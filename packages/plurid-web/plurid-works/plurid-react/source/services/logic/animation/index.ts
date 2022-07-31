// #region imports
    // #region libraries
    import { AnyAction } from 'redux';
    import { ThunkDispatch } from 'redux-thunk';


    import {
        PLURID_DEFAULT_ANIMATED_TRANSFORM_TIMEOUT,

        TreePlane,
    } from '@plurid/plurid-data';

    import {
        space,
    } from '@plurid/plurid-engine';
    // #endregion libraries


    // #region external
    import actions from '~services/state/actions';
    import { AppState } from '~services/state/store';

    import {
        computePlaneLocation,
    } from '../computing';
    // #endregion external
// #endregion imports



// #region module
export const useAnimatedTransform = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
) => {
    const dispatchSetAnimatedTransform: typeof actions.space.setAnimatedTransform = (
        payload,
    ) => dispatch(
        actions.space.setAnimatedTransform(payload),
    );

    dispatchSetAnimatedTransform(true);

    setTimeout(() => {
        dispatchSetAnimatedTransform(false);
    }, PLURID_DEFAULT_ANIMATED_TRANSFORM_TIMEOUT);
}


export const navigateToPluridPlane = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    plane: TreePlane | undefined,
    event?: React.MouseEvent,
) => {
    if (event && (event.ctrlKey || event.metaKey)) {
        // Only navigate at pure link click.
        return;
    }

    if (!plane) {
        return;
    }


    const dispatchSetTransform: typeof actions.space.setTransform = (
        payload,
    ) => dispatch(
        actions.space.setTransform(payload),
    );
    const dispatchSetSpaceField: typeof actions.space.setSpaceField = (
        payload,
    ) => dispatch(
        actions.space.setSpaceField(payload),
    );

    const {
        matrix3d,
        transform,
    } = computePlaneLocation(plane);

    useAnimatedTransform(dispatch);

    dispatchSetSpaceField({
        field: 'transform',
        value: matrix3d,
    });

    dispatchSetTransform({
        ...transform,
    });

    dispatchSetSpaceField({
        field: 'isolatePlane',
        value: '',
    });

    setTimeout(() => {
        dispatchSetSpaceField({
            field: 'activePlaneID',
            value: plane.planeID,
        });
    }, PLURID_DEFAULT_ANIMATED_TRANSFORM_TIMEOUT);
}



export const getActivePlane = (
    state: AppState,
) => {
    const {
        activePlaneID,
        tree,
    } = state.space;

    if (!activePlaneID) {
        return;
    }

    const treePlane = space.tree.logic.getTreePlaneByID(
        tree,
        activePlaneID,
    );

    return treePlane;
}


export const focusActivePlane = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    state: AppState,
) => {
    const activePlane = getActivePlane(state);
    if (!activePlane) {
        return;
    }

    navigateToPluridPlane(
        dispatch,
        activePlane,
    );
}


export const focusParentActivePlane = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    state: AppState,
) => {
    const activePlane = getActivePlane(state);
    if (!activePlane || !activePlane.parentPlaneID) {
        return;
    }

    const parentPlane = space.tree.logic.getTreePlaneByID(
        state.space.tree,
        activePlane.parentPlaneID,
    );
    if (!parentPlane) {
        return;
    }

    navigateToPluridPlane(
        dispatch,
        parentPlane,
    );
}
// #endregion module
