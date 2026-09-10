// #region imports
    // #region libraries
    import React, {
        useEffect,
        useRef,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';

    import {
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import actions from '~services/state/actions';
    import { AppState } from '~services/state/store';

    import {
        space as spaceEngine,
        interaction,
    } from '~services/engine';

    import {
        resolvePlaneFallbackSize,
    } from '~services/logic/camera';
    import {
        getDockedLineage,
    } from '~services/state/modules/space/selectors';
    // #endregion external
// #endregion imports



// #region module
const cameraEngine = interaction.camera;

export interface UseCullingParameters {
    dispatch: ThunkDispatch<{}, {}, AnyAction>;
    stateRef: React.MutableRefObject<AppState>;
    /** The camera matrix: the signal that a frame was committed. */
    transform: string;
    tree: TreePlane[];
    viewElement: React.RefObject<HTMLDivElement>;
    /**
     * Everything else that changes a plane's eligibility — the selection, the active and isolated
     * planes, the docked lineage, the culling and depth-fade configuration, the detach tier's gate —
     * folded into one string by the View, so a change to any of them schedules a pass with a still
     * camera (the focused plane is caught by the `focusin` listener below).
     */
    eligibility: string;
}

/** At most one culling pass per this many ms, per committed frame. */
const CULLING_INTERVAL = 100;


/**
 * The culling pass, at most every 100 ms after a camera commit or a tree change: which planes stop
 * painting (`culled.hidden`), which are frozen (`culled.frozen`), which hidden ones lose their
 * content (`culled.detached` — the engine's `resolveDetached` holds the rules; a maturity timer
 * re-runs the pass when the earliest candidate is due), and, with `elements.plane.depthFade`, each
 * plane's depth cue as CSS variables on its element (no store churn for a per-frame visual). Off
 * unless `space.culling.enabled`; the active, selected, isolated and focused planes and the docked
 * page's lineage are never culled.
 */
export const useCulling = (
    {
        dispatch,
        stateRef,
        transform,
        tree,
        viewElement,
        eligibility,
    }: UseCullingParameters,
) => {
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const last = useRef(0);
    /** When each hidden plane became hidden (the detach clock). */
    const hiddenSince = useRef(new Map<string, number>());
    /** The maturity timer: the pass re-runs when the earliest detach candidate is due. */
    const mature = useRef<ReturnType<typeof setTimeout> | null>(null);
    /** The latest scheduler, for the focus listener (it must not re-subscribe per frame). */
    const scheduleRef = useRef<() => void>(() => {});


    useEffect(() => {
        const clearMature = () => {
            if (mature.current !== null) {
                clearTimeout(mature.current);
                mature.current = null;
            }
        };
        /** Nothing culled: the state emptied when it holds anything, the detach clock reset. */
        const clearCulled = (culled: AppState['space']['culled']) => {
            if (culled.hidden.length > 0 || culled.frozen.length > 0 || culled.detached.length > 0) {
                dispatch(actions.space.setCulled({ hidden: [], frozen: [], detached: [] }));
            }
            hiddenSince.current = new Map();
            clearMature();
        };

        const run = () => {
            timer.current = null;
            last.current = Date.now();

            const state = stateRef.current;
            const configuration = state.configuration;
            const culling = configuration.space.culling;
            const depthFade = configuration.elements.plane.depthFade;
            const spaceState = state.space;
            const enabled = !!culling?.enabled;
            const fadeEnabled = !!depthFade?.enabled;
            if (!enabled && !fadeEnabled) {
                clearCulled(spaceState.culled);
                return;
            }

            const fallback = resolvePlaneFallbackSize(configuration, spaceState.viewSize);
            const planes: { id: string; location: TreePlane['location']; width: number; height: number }[] = [];
            /** each plane's SHOWN children (the detach step keeps a parent whose child is in view) */
            const childrenOf = new Map<string, string[]>();
            const walk = (nodes: TreePlane[]) => {
                for (const node of nodes) {
                    if (node.show === false) {
                        continue;
                    }
                    planes.push({
                        id: node.planeID,
                        location: node.location,
                        width: node.width || fallback.width,
                        height: node.height || fallback.height,
                    });
                    if (node.children) {
                        childrenOf.set(node.planeID, node.children.filter((child) => child.show !== false).map((child) => child.planeID));
                        walk(node.children);
                    }
                }
            };
            walk(spaceState.tree);

            const exceptions = new Set<string>([
                spaceState.activePlaneID,
                spaceState.isolatePlane,
                ...spaceState.selectedPlaneIDs,
                // the docked page, its ancestors and its descendants stay whole (Escape to the parent is instant)
                ...getDockedLineage(state),
            ].filter(Boolean));
            const focused = typeof document !== 'undefined'
                ? document.activeElement?.closest?.('[data-plurid-plane]')?.getAttribute('data-plurid-plane')
                : undefined;
            if (focused) {
                exceptions.add(focused);
            }

            const previous = {
                ...spaceState.culled,
                depths: {},
            };
            const result = spaceEngine.view.cullPlanes(
                planes,
                spaceState.camera,
                spaceState.viewSize,
                {
                    distance: culling?.distance,
                    hysteresis: culling?.hysteresis,
                    frustumMargin: culling?.frustumMargin,
                    freezeDistance: culling?.freezeDistance,
                },
                previous,
                exceptions,
            );

            // THE DETACH TIER: which hidden planes lose their content
            const now = Date.now();
            const detach = spaceEngine.view.resolveDetached({
                hidden: result.hidden,
                depths: result.depths,
                childrenOf,
                previous: previous.detached,
                hiddenSince: hiddenSince.current,
                now,
                exceptions,
                // nothing new is detached while the camera moves or a relayout glides
                gate: spaceState.motion !== 'idle' || spaceState.layoutTransition > 0,
                options: spaceEngine.view.resolveDetachOptions(culling),
            });
            hiddenSince.current = detach.hiddenSince;
            clearMature();
            if (detach.nextDue !== null) {
                mature.current = setTimeout(() => {
                    mature.current = null;
                    scheduleRef.current();
                }, Math.max(0, detach.nextDue - now));
            }
            const next = {
                hidden: result.hidden,
                frozen: result.frozen,
                detached: detach.detached,
                depths: result.depths,
            };

            if (!enabled) {
                // the depth cues alone: nothing is culled
                clearCulled(spaceState.culled);
            } else if (!spaceEngine.view.sameCulling(previous, next)) {
                dispatch(actions.space.setCulled({
                    hidden: next.hidden,
                    frozen: next.frozen,
                    detached: next.detached,
                }));
            }

            if (fadeEnabled && viewElement.current) {
                const start = depthFade?.start ?? 800;
                const end = Math.max(start + 1, depthFade?.end ?? 2500);
                const minimum = depthFade?.minOpacity ?? 0.35;
                const blur = depthFade?.blur ?? 0;
                const elements = viewElement.current.querySelectorAll<HTMLElement>('[data-plurid-plane]');
                elements.forEach((element) => {
                    const id = element.getAttribute('data-plurid-plane') || '';
                    const depth = result.depths[id];
                    if (depth === undefined) {
                        return;
                    }
                    const t = Math.min(1, Math.max(0, (depth - start) / (end - start)));
                    const fade = 1 - t * (1 - minimum);
                    element.style.setProperty('--plurid-plane-depth', String(Math.round(depth)));
                    element.style.setProperty('--plurid-plane-fade', fade.toFixed(3));
                    element.style.setProperty('--plurid-plane-blur', (t * blur).toFixed(2) + 'px');
                });
            }
        };

        const schedule = () => {
            if (timer.current !== null) {
                return;
            }
            const elapsed = Date.now() - last.current;
            timer.current = setTimeout(run, Math.max(0, CULLING_INTERVAL - elapsed));
        };
        scheduleRef.current = schedule;
        schedule();

        return () => {
            if (timer.current !== null) {
                clearTimeout(timer.current);
                timer.current = null;
            }
        };
    }, [
        transform,
        tree,
        eligibility,
    ]);

    // the maturity timer dies with the hook
    useEffect(() => () => {
        if (mature.current !== null) {
            clearTimeout(mature.current);
            mature.current = null;
        }
    }, []);

    // A focus change inside the view makes another plane an exception: schedule a pass.
    useEffect(() => {
        const element = viewElement.current;
        if (!element) {
            return;
        }
        const onFocus = () => scheduleRef.current();
        element.addEventListener('focusin', onFocus);
        element.addEventListener('focusout', onFocus);
        return () => {
            element.removeEventListener('focusin', onFocus);
            element.removeEventListener('focusout', onFocus);
        };
    }, [
        viewElement,
    ]);
}
// #endregion module



// #region exports
export default useCulling;
// #endregion exports
