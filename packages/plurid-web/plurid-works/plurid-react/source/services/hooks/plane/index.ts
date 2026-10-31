// #region imports
    // #region libraries
    import {
        useContext,
        useMemo,
    } from 'react';

    import {
        createSelectorHook,
        createDispatchHook,
    } from 'react-redux';

    import {
        TreePlaneLocation,
        PluridPubSub as IPluridPubSub,
    } from '@plurid/plurid-data';
    import type {
        PluridPinnedRect,
        PluridPlaceOptions,
        PluridPlaceResult,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import Context from '~services/context';
    import StateContext from '~services/state/context';

    import {
        closePlane,
        navigateToParent,
        ClosePlaneOptions,
    } from '~services/state/thunks/planes';

    import {
        framePlaneByID,
    } from '~services/logic/camera';

    import selectors from '~services/state/selectors';

    import {
        makeGetTreePlaneByID,
        getCulledSets,
        planeCullingState,
    } from '~services/state/modules/space/selectors';

    import type {
        AppState,
    } from '~services/state/store';
    // #endregion external


    // #region internal
    import PluridPlaneIDContext, {
        PluridPlaneDetailsContext,
        PluridPlaneDetails,
    } from './context';
    // #endregion internal
    import {
        getDockedPlaneID,
        makeGetIsPlaneAside,
    } from '~services/state/modules/space/selectors';
    import {
        cameraCommand,
    } from '~services/logic/camera';
    import {
        pinPlane,
        placePinnedPlane,
        collapsePinnedPlane,
    } from '~services/logic/pinned';
// #endregion imports



// #region module
export type PluridPlaneIsolation = 'none' | 'self' | 'other';

export interface PluridPlaneLens {
    /**
     * The ID of the plane this content is rendered inside;
     * `undefined` outside plane content (route exterior, shell, overlays).
     */
    planeID: string | undefined;
    /**
     * Hover-derived: this plane is the space's active plane.
     */
    active: boolean;
    /**
     * This plane is in the multi-selection working set.
     */
    selected: boolean;
    /** This plane owns ordinary wheel input under `click-to-scroll` (clicked or docked). */
    scrollSelected: boolean;
    /**
     * `'self'` when this plane is the isolated one, `'other'` when another
     * plane is isolated (this content is faded out / inert), `'none'` when
     * no isolation is active.
     */
    isolation: PluridPlaneIsolation;
    /**
     * The plane is shown in the space (`treePlane.show !== false`).
     */
    shown: boolean;
    /**
     * The culling pass's verdict (`space.culling`): `hidden` planes stop painting (state intact),
     * `frozen` ones paint but skip layout-affecting work — a plane can pause video, polling or
     * animation while it is not seen; `detached` ones (`culling.detach`) have their content
     * retained (state kept, effects unmounted) or unmounted — a retained plane reads it on reveal.
     */
    culled: 'visible' | 'hidden' | 'frozen' | 'detached';
    frozen: boolean;
    /** The content is detached (`culling.detach`): retained or unmounted while the plane is hidden. */
    detached: boolean;
    /**
     * The space zoom factor.
     */
    scale: number;
    /**
     * The measured view size the space computes against.
     */
    viewSize: {
        width: number;
        height: number;
    };
    /**
     * The plane's spatial location - a STABLE reference that changes only
     * when THIS plane moves (structural sharing).
     */
    location: TreePlaneLocation | undefined;
    /** The plane's size in the tree — declared, measured or hand-set; 0 while unmeasured. */
    width: number;
    height: number;
    /** How that size is determined: `measured` (the default), `manual` (a hand resize), `declared`. */
    sizeMode: 'measured' | 'manual' | 'declared';
    /**
     * The plane's REGISTERED route — the pattern it was registered under (`/imagene/:id`), the
     * same value as the `plurid` prop's `plane.value`; `undefined` outside plane content.
     */
    route: string | undefined;
    /**
     * The concrete values of the route (`/imagene/42` → `{ id: '42' }`) and its query.
     */
    parameters: Record<string, string>;
    query: Record<string, string>;
    fragments: PluridPlaneDetails['fragments'] | undefined;
    /**
     * The plane this one was spawned from; `undefined` for roots.
     */
    parentPlaneID: string | undefined;
    /**
     * The application's pubsub (the same object as the `plurid` prop's `pubSub`);
     * `undefined` outside an application.
     */
    pubsub: IPluridPubSub | undefined;
    /**
     * Hide this plane. When it is the one in view the camera returns to its parent
     * (`space.navigation.onClose`, overridable per call).
     */
    close: (options?: ClosePlaneOptions) => void;
    /**
     * Frame the parent plane (a child's "back"); no-op for roots.
     */
    navigateToParent: () => void;
    /**
     * Frame this plane.
     */
    frame: () => void;
    /** The page presentation: `'page'` when the space presents as pages. */
    presentation: 'space' | 'page';
    /** This plane is the page the camera is docked on (or docking on). */
    docked: boolean;
    /** This plane is set aside: outside the docked page's lineage, faded and inert. */
    aside: boolean;
    /** Dock the camera on this plane (the page presentation). */
    dock: () => void;
    /** Reveal the space from this plane (the page presentation). */
    reveal: () => void;
    /** This plane is pinned to the screen (2026-10-31), above the space. */
    pinned: boolean;
    /** Pinned and collapsed to its title bar. */
    collapsed: boolean;
    /** Faded: it stands between the camera and the plane the camera rests on (`space.occlusion`). */
    occluding: boolean;
    /** Pin this plane to the screen, at `rect`, else a free slot on the right edge (`handle.planes.pin`). */
    pin: (rect?: PluridPinnedRect) => boolean;
    /** Put this pinned plane into the space where its frame is (`handle.planes.place`). */
    place: (options?: PluridPlaceOptions) => Promise<PluridPlaceResult>;
    /** Collapse this pinned plane to its title bar, or expand it (`false`); toggles without an argument. */
    collapse: (collapsed?: boolean) => boolean;
}


// Bind to the engine's private react-redux context: the per-application store
// lives ONLY under StateContext (Application provides it), never the default.
const useEngineSelector = createSelectorHook(StateContext as any);
const useEngineDispatch = createDispatchHook(StateContext as any);

const EMPTY_RECORD: Record<string, string> = {};


/**
 * Live lens over the plane a content component is rendered inside - the
 * substrate seam for content-heavy consumers (pause a video when the plane
 * is not `active`, lazy-load when it becomes `shown`, pick asset quality
 * from `scale`).
 *
 * Field subscriptions are per-primitive (the engine's own granular-derived
 * pattern), so consuming content re-renders only when a consumed value
 * actually changes - not per orbit frame.
 *
 * Valid only under a `PluridApplication` (react-redux throws without the
 * engine store). Outside plane content but inside the application (route
 * exteriors, overlays) `planeID` is `undefined` and the plane-derived
 * fields are inert (`active`/`selected` false, `isolation` 'none',
 * `shown` true).
 */
export const usePluridPlane = (): PluridPlaneLens => {
    const planeID = useContext(PluridPlaneIDContext);
    const details = useContext(PluridPlaneDetailsContext);
    const context = useContext(Context);
    const dispatch = useEngineDispatch();

    const getTreePlane = useMemo(
        () => makeGetTreePlaneByID(),
        [],
    );

    const active = useEngineSelector(
        (state: AppState) => planeID !== undefined
            && selectors.space.getActivePlaneID(state) === planeID,
    );
    const selected = useEngineSelector(
        (state: AppState) => planeID !== undefined
            && selectors.space.getSelectedPlaneIDs(state).includes(planeID),
    );
    const scrollSelected = useEngineSelector(
        (state: AppState) => !!planeID
            && state.configuration?.space?.gestures?.wheel === 'click-to-scroll'
            && state.configuration.space.gestures?.buttonMap?.wheel !== 'disabled'
            && (getDockedPlaneID(state) || state.ui.scrollPlaneID) === planeID,
    );
    const isolation = useEngineSelector(
        (state: AppState): PluridPlaneIsolation => {
            const isolatePlane = selectors.space.getIsolatePlane(state);
            if (!isolatePlane) {
                return 'none';
            }
            return isolatePlane === planeID ? 'self' : 'other';
        },
    );
    const shown = useEngineSelector(
        (state: AppState) => {
            if (planeID === undefined) {
                return true;
            }
            const treePlane = getTreePlane(state, planeID);
            return treePlane ? treePlane.show !== false : true;
        },
    );
    const scale = useEngineSelector(
        (state: AppState) => selectors.space.getScale(state),
    );
    const viewSize = useEngineSelector(
        (state: AppState) => selectors.space.getViewSize(state),
    );
    const location = useEngineSelector(
        (state: AppState) => planeID !== undefined
            ? getTreePlane(state, planeID)?.location
            : undefined,
    );
    const width = useEngineSelector(
        (state: AppState) => (planeID !== undefined ? getTreePlane(state, planeID)?.width : 0) ?? 0,
    );
    const height = useEngineSelector(
        (state: AppState) => (planeID !== undefined ? getTreePlane(state, planeID)?.height : 0) ?? 0,
    );
    const sizeMode = useEngineSelector(
        (state: AppState): 'measured' | 'manual' | 'declared' => (planeID !== undefined
            ? getTreePlane(state, planeID)?.sizeMode
            : undefined) ?? 'measured',
    );
    const presentation = useEngineSelector((state: AppState) => state.configuration?.space?.presentation ?? 'space');
    const docked = useEngineSelector((state: AppState) => !!planeID && getDockedPlaneID(state) === planeID);
    const getIsAside = useMemo(() => makeGetIsPlaneAside(), []);
    const aside = useEngineSelector((state: AppState) => getIsAside(state, planeID));
    const culled = useEngineSelector(
        (state: AppState): 'visible' | 'hidden' | 'frozen' | 'detached' => planeCullingState(getCulledSets(state), planeID),
    );
    const pinned = useEngineSelector(
        (state: AppState) => planeID !== undefined && !!getTreePlane(state, planeID)?.pinned,
    );
    const collapsed = useEngineSelector(
        (state: AppState) => planeID !== undefined && !!getTreePlane(state, planeID)?.pinned?.collapsed,
    );
    const occluding = useEngineSelector(
        (state: AppState) => planeID !== undefined && (state.space.occluded?.planeIDs ?? []).includes(planeID),
    );

    const commands = useMemo(() => ({
        close: (options?: ClosePlaneOptions) => {
            if (planeID !== undefined) {
                dispatch(closePlane(planeID, options) as any);
            }
        },
        navigateToParent: () => {
            if (planeID !== undefined) {
                dispatch(navigateToParent(planeID) as any);
            }
        },
        frame: () => {
            if (planeID !== undefined) {
                dispatch(framePlaneByID(planeID) as any);
            }
        },
        dock: () => {
            if (planeID !== undefined) {
                dispatch(cameraCommand({ kind: 'dock', planeID }, { animate: true }) as any);
            }
        },
        reveal: () => {
            dispatch(cameraCommand({ kind: 'reveal' }, { animate: true }) as any);
        },
        pin: (rect?: PluridPinnedRect) => (planeID !== undefined
            ? dispatch(pinPlane(planeID, rect) as any) as unknown as boolean
            : false),
        place: (options?: PluridPlaceOptions) => (planeID !== undefined
            ? dispatch(placePinnedPlane(planeID, options) as any) as unknown as Promise<PluridPlaceResult>
            : Promise.resolve<PluridPlaceResult>('refused')),
        collapse: (next?: boolean) => (planeID !== undefined
            ? dispatch(collapsePinnedPlane(planeID, next) as any) as unknown as boolean
            : false),
    }), [
        dispatch,
        planeID,
    ]);

    return {
        planeID,
        presentation,
        docked,
        aside,
        active,
        selected,
        scrollSelected,
        isolation,
        shown,
        scale,
        viewSize,
        location,
        width,
        height,
        sizeMode,
        culled,
        frozen: culled === 'frozen',
        detached: culled === 'detached',
        pinned,
        collapsed,
        occluding,
        route: details?.value,
        parameters: details?.parameters ?? EMPTY_RECORD,
        query: details?.query ?? EMPTY_RECORD,
        fragments: details?.fragments,
        parentPlaneID: details?.parentPlaneID,
        pubsub: context?.defaultPubSub,
        ...commands,
    };
};
// #endregion module



// #region exports
export {
    PluridPlaneIDContext,
    PluridPlaneDetailsContext,
};
// #endregion exports
