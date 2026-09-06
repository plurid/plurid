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
     * animation while it is not seen.
     */
    culled: 'visible' | 'hidden' | 'frozen';
    frozen: boolean;
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
        (state: AppState): 'visible' | 'hidden' | 'frozen' => {
            if (planeID === undefined || !state.space.culled) {
                return 'visible';
            }
            if (state.space.culled.hidden.includes(planeID)) {
                return 'hidden';
            }
            if (state.space.culled.frozen.includes(planeID)) {
                return 'frozen';
            }
            return 'visible';
        },
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
