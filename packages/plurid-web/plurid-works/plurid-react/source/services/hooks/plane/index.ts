// #region imports
    // #region libraries
    import {
        useContext,
        useMemo,
    } from 'react';

    import {
        createSelectorHook,
    } from 'react-redux';

    import {
        TreePlaneLocation,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import StateContext from '~services/state/context';

    import selectors from '~services/state/selectors';

    import {
        makeGetTreePlaneByID,
    } from '~services/state/modules/space/selectors';

    import type {
        AppState,
    } from '~services/state/store';
    // #endregion external


    // #region internal
    import PluridPlaneIDContext from './context';
    // #endregion internal
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
}


// Bind to the engine's private react-redux context: the per-application store
// lives ONLY under StateContext (Application provides it), never the default.
const useEngineSelector = createSelectorHook(StateContext as any);


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

    return {
        planeID,
        active,
        selected,
        isolation,
        shown,
        scale,
        viewSize,
        location,
    };
};
// #endregion module



// #region exports
export {
    PluridPlaneIDContext,
};
// #endregion exports
