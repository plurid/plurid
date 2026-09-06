// #region imports
    // #region libraries
    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';

    import {
        LinkCoordinates,
        RegisteredPluridPlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';

    import actions from '~services/state/actions';
    import { AppState } from '~services/state/store';

    import {
        space as spaceEngine,
    } from '~services/engine';

    import {
        navigateToPluridPlane,
        navigatePlane,
    } from '~services/logic/animation';

    import {
        planeCoversViewCenter,
        resolvePlaneFallbackSize,
    } from '~services/logic/camera';
    // #endregion external
// #endregion imports



// #region module
type Dispatch = ThunkDispatch<{}, {}, AnyAction>;
type GetState = () => AppState;
export type PlaneThunk = (dispatch: Dispatch, getState: GetState) => void;


const sameCoordinates = (
    a: LinkCoordinates | undefined,
    b: LinkCoordinates | undefined,
) => !!a && !!b && a.x === b.x && a.y === b.y;


export interface ToggleLinkPlaneParameters {
    parentPlaneID: string;
    linkID: string;
    route: string;
    linkCoordinates: LinkCoordinates;
    planesRegistry: Map<string, RegisteredPluridPlane<PluridReactComponent>>;
    hostname?: string;
    /** Navigate to the plane when it opens. Default `true`. */
    navigate?: boolean;
}


/**
 * A `PluridLink` click. The TREE is the single source of truth: the link's plane is looked up by
 * the link's stable id — absent → spawn it (recording `spawnedByLinkID`); present → flip its
 * visibility. Opening navigates to the plane; closing records it as the last closed plane.
 */
export const toggleLinkPlane = (
    {
        parentPlaneID,
        linkID,
        route,
        linkCoordinates,
        planesRegistry,
        hostname,
        navigate = true,
    }: ToggleLinkPlaneParameters,
): PlaneThunk => (dispatch, getState) => {
    const state = getState();
    const tree = state.space.tree;

    const existing = spaceEngine.tree.fields.findPlaneByLinkID(tree, parentPlaneID, linkID);

    if (!existing) {
        const {
            updatedTree,
            updatedTreePlane,
        } = spaceEngine.tree.logic.updateTreeWithNewPlane(
            route,
            parentPlaneID,
            linkCoordinates,
            tree,
            planesRegistry,
            state.configuration,
            hostname,
            {
                linkID,
                // a mirrored child (`bridgeSide: 'end'`) is placed by its width before it is measured
                fallbackWidth: resolvePlaneFallbackSize(state.configuration, state.space.viewSize).width,
            },
        );

        if (!updatedTreePlane) {
            return;
        }

        dispatch(actions.space.setTree(updatedTree));
        if (navigate) {
            navigateToPluridPlane(dispatch, updatedTreePlane);
        }
        return;
    }

    const show = existing.show === false;

    // On a PAGE a link is a link: it takes the user to its page and never toggles it closed (the
    // page's own close control and the back control do that).
    if (!show && state.configuration.space.presentation === 'page') {
        if (navigate) {
            navigateToPluridPlane(dispatch, existing);
        }
        return;
    }

    // A link re-measures itself at every click, while a closed plane kept the coordinates of the
    // moment it closed (its link stopped tracking it): the fresh measurement relocates the subtree
    // BEFORE it shows, so the frame below targets where the plane really is.
    if (show && !sameCoordinates(existing.linkCoordinates, linkCoordinates)) {
        dispatch(actions.space.updateLinkCoordinates({
            planeID: existing.planeID,
            linkCoordinates,
        }));
    }

    const {
        updatedTree,
        updatedPlane,
    } = spaceEngine.tree.logic.togglePlaneFromTree(getState().space.tree, existing.planeID, show);

    dispatch(actions.space.setTree(updatedTree));

    if (show) {
        if (navigate && updatedPlane) {
            // The plane was unmounted while closed: its size is stale until it measures again.
            navigateToPluridPlane(dispatch, updatedPlane, undefined, true, { awaitMeasure: true });
        }
    } else {
        dispatch(actions.space.setSpaceField({
            field: 'lastClosedPlane',
            value: existing.planeID,
        }));
    }
};


export interface ClosePlaneOptions {
    /**
     * Where the camera goes when the closed plane is the one IN VIEW: to its parent (`'parent'`,
     * the default — a child closed from within returns to where it was opened from) or nowhere
     * (`'stay'`). Roots always stay. Defaults to `space.navigation.onClose`.
     */
    navigate?: 'parent' | 'stay';
}


/**
 * Hide a plane (root or child) and remember it as the last closed. A plane the user was looking
 * at (the active one, the isolated one, or the one under the view center) hands the camera to its
 * parent, so closing never leaves the view on the empty spot where a plane was.
 */
export const closePlane = (
    planeID: string,
    options: ClosePlaneOptions = {},
): PlaneThunk => (dispatch, getState) => {
    const state = getState();
    const tree = state.space.tree;
    const plane = spaceEngine.tree.logic.getTreePlaneByID(tree, planeID);
    if (!plane) {
        return;
    }

    const policy = options.navigate
        ?? state.configuration.space.navigation?.onClose
        ?? 'parent';
    const inView = state.space.activePlaneID === planeID
        || state.space.isolatePlane === planeID
        || planeCoversViewCenter(state.space, state.configuration, plane);

    const {
        updatedTree,
    } = spaceEngine.tree.logic.togglePlaneFromTree(tree, planeID, false);
    dispatch(actions.space.setTree(updatedTree));
    dispatch(actions.space.setSpaceField({
        field: 'lastClosedPlane',
        value: planeID,
    }));

    if (policy !== 'parent' || !inView || !plane.parentPlaneID) {
        return;
    }
    const parent = spaceEngine.tree.logic.getTreePlaneByID(updatedTree, plane.parentPlaneID);
    if (parent && parent.show !== false) {
        dispatch(navigatePlane(parent, { deisolate: true }) as any);
    }
};


/** Frame the parent of a plane (a child's "back"). No-op for roots. */
export const navigateToParent = (
    planeID: string,
): PlaneThunk => (dispatch, getState) => {
    const tree = getState().space.tree;
    const plane = spaceEngine.tree.logic.getTreePlaneByID(tree, planeID);
    const parent = plane?.parentPlaneID
        ? spaceEngine.tree.logic.getTreePlaneByID(tree, plane.parentPlaneID)
        : undefined;
    if (!parent) {
        return;
    }

    dispatch(navigatePlane(parent, { deisolate: true }) as any);
};


export interface OpenPlaneOptions {
    /** Frame the plane once it shows (re-framed from its first measurement). Default `false`. */
    navigate?: boolean;
}


/** Show a plane again (root or child). */
export const openPlane = (
    planeID: string,
    options: OpenPlaneOptions = {},
): PlaneThunk => (dispatch, getState) => {
    const tree = getState().space.tree;
    const plane = spaceEngine.tree.logic.getTreePlaneByID(tree, planeID);
    if (!plane) {
        return;
    }

    const {
        updatedTree,
        updatedPlane,
    } = spaceEngine.tree.logic.togglePlaneFromTree(tree, planeID, true);
    dispatch(actions.space.setTree(updatedTree));

    if (options.navigate && updatedPlane) {
        navigateToPluridPlane(dispatch, updatedPlane, undefined, true, { awaitMeasure: true });
    }
};


/** Reopen the last closed plane and bring it into view (`navigate: false` only shows it). */
export const openLastClosed = (
    options: OpenPlaneOptions = {},
): PlaneThunk => (dispatch, getState) => {
    const planeID = getState().space.lastClosedPlane;
    if (!planeID) {
        return;
    }

    openPlane(planeID, { navigate: options.navigate ?? true })(dispatch, getState);
    dispatch(actions.space.setSpaceField({
        field: 'lastClosedPlane',
        value: '',
    }));
};
// #endregion module
