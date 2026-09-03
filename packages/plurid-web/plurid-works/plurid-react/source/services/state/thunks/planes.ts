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
    } from '~services/logic/animation';
    // #endregion external
// #endregion imports



// #region module
type Dispatch = ThunkDispatch<{}, {}, AnyAction>;
type GetState = () => AppState;
export type PlaneThunk = (dispatch: Dispatch, getState: GetState) => void;


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
    const {
        updatedTree,
        updatedPlane,
    } = spaceEngine.tree.logic.togglePlaneFromTree(tree, existing.planeID, show);

    dispatch(actions.space.setTree(updatedTree));

    if (show) {
        if (navigate && updatedPlane) {
            navigateToPluridPlane(dispatch, updatedPlane);
        }
    } else {
        dispatch(actions.space.setSpaceField({
            field: 'lastClosedPlane',
            value: existing.planeID,
        }));
    }
};


/** Hide a plane (root or child) and remember it as the last closed. */
export const closePlane = (
    planeID: string,
): PlaneThunk => (dispatch, getState) => {
    const tree = getState().space.tree;
    const plane = spaceEngine.tree.logic.getTreePlaneByID(tree, planeID);
    if (!plane) {
        return;
    }

    const {
        updatedTree,
    } = spaceEngine.tree.logic.togglePlaneFromTree(tree, planeID, false);
    dispatch(actions.space.setTree(updatedTree));
    dispatch(actions.space.setSpaceField({
        field: 'lastClosedPlane',
        value: planeID,
    }));
};


/** Show a plane again (root or child). */
export const openPlane = (
    planeID: string,
): PlaneThunk => (dispatch, getState) => {
    const tree = getState().space.tree;
    const plane = spaceEngine.tree.logic.getTreePlaneByID(tree, planeID);
    if (!plane) {
        return;
    }

    const {
        updatedTree,
    } = spaceEngine.tree.logic.togglePlaneFromTree(tree, planeID, true);
    dispatch(actions.space.setTree(updatedTree));
};


/** Reopen the last closed plane. */
export const openLastClosed = (): PlaneThunk => (dispatch, getState) => {
    const planeID = getState().space.lastClosedPlane;
    if (!planeID) {
        return;
    }

    openPlane(planeID)(dispatch, getState);
    dispatch(actions.space.setSpaceField({
        field: 'lastClosedPlane',
        value: '',
    }));
};
// #endregion module
