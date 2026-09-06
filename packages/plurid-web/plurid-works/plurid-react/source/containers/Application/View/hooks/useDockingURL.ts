// #region imports
    // #region libraries
    import {
        useEffect,
        useRef,
        useState,
    } from 'react';
    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import {
        TreePlane,
        DockingURLBinding,
        PluridPlanesRegistrar,
    } from '@plurid/plurid-data';
    // #endregion libraries

    // #region external
    import {
        space as spaceEngine,
        getPlanesRegistrar,
    } from '~services/engine';
    import { AppState } from '~services/state/store';
    import {
        getDockedPlaneID,
    } from '~services/state/modules/space/selectors';
    import {
        dockCommand,
        revealCommand,
    } from '~services/logic/camera';
    import {
        toggleLinkPlane,
        openPlane,
    } from '~services/state/thunks/planes';
    import {
        resolveLinkID,
        measureLinkCoordinates,
    } from '~services/logic/link/measure';
    import {
        warnOnce,
    } from '~services/logic/development/warn';
    import {
        readDockingURLTarget,
        readDockingURLState,
        writeDockingURL,
        treePlanePath,
        findTreePlaneByPath,
        linkElementToPath,
        parentPath,
        LinkToPath,
    } from '~services/logic/docking/url';
    // #endregion external
// #endregion imports



// #region module
export interface UseDockingURLParameters {
    /** `resolveDockingURL(configuration.space.docking?.url, { router })`; `null` = no binding. */
    binding: DockingURLBinding | null;
    stateDockedPlaneID: string;
    stateTree: TreePlane[];
    stateResolvedLayout: boolean;
    /** The state's view size: the restore waits until it is the element's (the boot's first measurement re-lays the roots and re-pivots the camera; a page docked before it would be lost). */
    stateViewSize: { width: number; height: number };
    /** The latest state (the view's `stateRef`), for the deferred handlers. */
    getState: () => AppState;
    dispatch: ThunkDispatch<{}, {}, AnyAction>;
    viewElement: React.RefObject<HTMLDivElement | null>;
    planesRegistrar?: PluridPlanesRegistrar<any>;
    hostname?: string;
    warnings?: boolean;
}

/** How many commits the restore waits for the DOM (the parent page, its link) before giving up. */
const RESTORE_ATTEMPTS = 20;
const RESTORE_RETRY_MS = 50;

/**
 * THE ADDRESS BAR IS THE PAGE (`space.docking.url`, 2026-09-06). Two directions, the model of
 * `useViewpointURL`:
 * - WRITE: while docked, the page's path is the pathname (the query and the hash untouched); docking
 *   on another page pushes a history entry (`history: 'push'`); the reveal keeps the last page's path;
 *   nothing is written when the path is already current — which is also why a Back / Forward dock
 *   pushes nothing. The FIRST write replaces the entry (the URL the reader arrived on becomes the page
 *   they are on), every later one follows the binding's history.
 * - RESTORE: on mount, the page the location names is docked at once: the entry's own record first
 *   (`history.state.plurid`), then a plane at that path in the tree, then a `PluridLink` to it in a
 *   mounted page — the page is SPAWNED behind its parent exactly as a click would (the bridge, the
 *   lineage, Escape to the parent) and docked; a deeper path walks the links one level per commit.
 *   A path that names nothing leaves the boot page and the writer normalizes the address. The writer
 *   is silent until the restore settles, so a deep link is never rewritten to the boot page's path.
 * - BACK / FORWARD: `popstate` docks the entry's page with the configured docking motion (an instant
 *   dock under `docking.motion: 'instant'`), or reveals when the entry names no page.
 * The query mode (`binding.mode === 'query'`, a host router owning the pathname) rides `?<param>=`.
 */
export const useDockingURL = (
    {
        binding,
        stateDockedPlaneID,
        stateTree,
        stateResolvedLayout,
        stateViewSize,
        getState,
        dispatch,
        viewElement,
        planesRegistrar,
        hostname,
        warnings = true,
    }: UseDockingURLParameters,
) => {
    /** The writer is silent until the restore settles. */
    const restoring = useRef(true);
    /** Whether the location has once been made consistent with a page (the first write replaces). */
    const synced = useRef(false);
    /** Set by a `popstate` dock: the next writer run is a no-op (the browser already moved). */
    const suppress = useRef(false);
    const attempts = useRef(0);
    /** A retry tick for a restore waiting on the DOM. */
    const [tick, setTick] = useState(0);
    const retry = useRef<ReturnType<typeof setTimeout> | null>(null);

    const latest = useRef({ binding, stateTree, planesRegistrar, hostname });
    latest.current = { binding, stateTree, planesRegistrar, hostname };

    const planeByID = (id: string): TreePlane | undefined => spaceEngine.tree.logic.getTreePlaneByID(getState().space.tree, id);

    /** Spawn the link's page behind its parent as a click would, without navigating; the spawned plane. */
    const spawnThrough = (link: LinkToPath): TreePlane | undefined => {
        const linkID = resolveLinkID(link.linkElement, link.planeElement, link.route);
        const existing = spaceEngine.tree.fields.findPlaneByLinkID(getState().space.tree, link.parentPlaneID, linkID);
        if (existing) {
            if (existing.show === false) {
                dispatch(openPlane(existing.planeID, { navigate: false }) as any);
            }
            return existing;
        }
        const registrar = getPlanesRegistrar(latest.current.planesRegistrar);
        dispatch(toggleLinkPlane({
            parentPlaneID: link.parentPlaneID,
            linkID,
            route: link.route,
            linkCoordinates: measureLinkCoordinates(link.linkElement, link.planeElement),
            planesRegistry: registrar?.getAll() ?? new Map(),
            hostname: latest.current.hostname,
            navigate: false,
        }) as any);
        return spaceEngine.tree.fields.findPlaneByLinkID(getState().space.tree, link.parentPlaneID, linkID);
    };

    /** The page a path names, resolved and made present (shown / spawned); `''` when nothing yet. */
    const resolvePath = (target: string, recorded: unknown): { planeID: string; settled: boolean } => {
        const tree = getState().space.tree;
        const state = readDockingURLState(recorded);
        if (state && state.path === target && planeByID(state.docked)) {
            return { planeID: state.docked, settled: true };
        }
        const plane = findTreePlaneByPath(tree, target);
        if (plane) {
            if (plane.show === false) {
                dispatch(openPlane(plane.planeID, { navigate: false }) as any);
            }
            return { planeID: plane.planeID, settled: true };
        }
        const element = viewElement.current;
        if (!element) {
            return { planeID: '', settled: false };
        }
        let path: string | null = target;
        while (path) {
            const link = linkElementToPath(element, path);
            if (link) {
                const spawned = spawnThrough(link);
                if (path === target) {
                    return { planeID: spawned?.planeID ?? '', settled: !!spawned };
                }
                // an ancestor spawned: the next commit walks one level deeper
                return { planeID: '', settled: false };
            }
            path = parentPath(path);
        }
        return { planeID: '', settled: false };
    };

    // #region restore, then write
    useEffect(() => {
        if (!binding) {
            return;
        }
        if (restoring.current) {
            const element = viewElement.current;
            const measured = !!element && typeof window !== 'undefined'
                && (element.offsetWidth || window.innerWidth) === stateViewSize.width
                && (element.offsetHeight || window.innerHeight) === stateViewSize.height;
            if (!binding.restore) {
                restoring.current = false;
            } else if (!measured) {
                // before the first real measurement: wait (the effect re-runs on the view size)
                return;
            } else {
                const target = readDockingURLTarget(binding);
                // a path no registered plane answers to names nothing: nothing to restore, the writer
                // normalizes the address to the boot page
                const registrar = getPlanesRegistrar(latest.current.planesRegistrar);
                if (!target || !registrar?.get(target)) {
                    restoring.current = false;
                } else {
                    const found = resolvePath(target, typeof window !== 'undefined' ? window.history.state : null);
                                if (found.planeID) {
                        restoring.current = false;
                        if (found.planeID !== getDockedPlaneID(getState())) {
                            dispatch(dockCommand(found.planeID, false) as any);
                                                // the write follows on the next commit, from the docked page's own props
                            return;
                        }
                    } else if (found.settled || attempts.current >= RESTORE_ATTEMPTS) {
                        if (attempts.current >= RESTORE_ATTEMPTS) {
                            warnOnce(
                                'docking-url-orphan',
                                `docking.url: nothing at ${target} — no plane or link reaches it; the boot page stays and the address follows it.`,
                                warnings,
                            );
                        }
                        restoring.current = false;
                    } else {
                        // the DOM is not there yet (the parent page, its link): try again shortly
                        attempts.current += 1;
                        if (stateResolvedLayout && retry.current === null) {
                            retry.current = setTimeout(() => {
                                retry.current = null;
                                setTick((value) => value + 1);
                            }, RESTORE_RETRY_MS);
                        }
                        return;
                    }
                }
            }
        }

        // write
        if (!binding.write) {
            return;
        }
        if (suppress.current) {
            suppress.current = false;
            return;
        }
        if (!stateDockedPlaneID) {
            return;
        }
        const plane = planeByID(stateDockedPlaneID);
        const path = plane ? treePlanePath(plane) : null;
        if (!path) {
            return;
        }
        if (path === readDockingURLTarget(binding)) {
            synced.current = true;
            return;
        }
        writeDockingURL(binding, path, stateDockedPlaneID, {
            replace: !synced.current || binding.history === 'replace',
        });
        synced.current = true;
    }, [
        binding,
        stateDockedPlaneID,
        stateTree,
        stateResolvedLayout,
        stateViewSize,
        tick,
    ]);

    useEffect(() => () => {
        if (retry.current !== null) {
            clearTimeout(retry.current);
            retry.current = null;
        }
    }, []);
    // #endregion restore, then write

    // #region back / forward
    useEffect(() => {
        if (!binding || typeof window === 'undefined') {
            return;
        }
        const onPopState = (event: PopStateEvent) => {
            const current = latest.current.binding;
            if (!current) {
                return;
            }
            const docked = getDockedPlaneID(getState());
            const target = readDockingURLTarget(current);
            suppress.current = true;
            const found = target ? resolvePath(target, event.state) : { planeID: '', settled: true };
            if (found.planeID) {
                if (found.planeID !== docked) {
                    dispatch(dockCommand(found.planeID, true) as any);
                } else {
                    suppress.current = false;
                }
                return;
            }
            if (docked) {
                dispatch(revealCommand(true) as any);
            } else {
                suppress.current = false;
            }
        };
        window.addEventListener('popstate', onPopState);
        return () => {
            window.removeEventListener('popstate', onPopState);
        };
    }, [
        binding?.mode,
        binding?.param,
    ]);
    // #endregion back / forward
};
// #endregion module



// #region exports
export default useDockingURL;
// #endregion exports
