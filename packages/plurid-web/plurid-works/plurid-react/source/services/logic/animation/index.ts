// #region imports
    // #region libraries
    import { AnyAction } from 'redux';
    import { ThunkDispatch } from 'redux-thunk';


    import {
        PLURID_DEFAULT_ANIMATED_TRANSFORM_TIMEOUT,

        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import actions from '~services/state/actions';
    import { AppState } from '~services/state/store';

    import {
        space,
    } from '~services/engine';

    import {
        computePlaneLocation,
    } from '../computing';

    import {
        focusPluridPlaneAnchor,
    } from '../transform';
    // #endregion external
// #endregion imports



// #region module
export const factoryUseAnimatedTransform = () => {
    let timeout: NodeJS.Timeout | undefined;

    return (
        dispatch: ThunkDispatch<{}, {}, AnyAction>,
    ) => {
        const dispatchSetAnimatedTransform: typeof actions.space.setAnimatedTransform = (
            payload,
        ) => dispatch(
            actions.space.setAnimatedTransform(payload),
        );

        dispatchSetAnimatedTransform(true);

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            dispatchSetAnimatedTransform(false);
        }, PLURID_DEFAULT_ANIMATED_TRANSFORM_TIMEOUT);
    }
}

export const useAnimatedTransform = factoryUseAnimatedTransform();



export const navigateToPluridPlane = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    plane: TreePlane | undefined,
    event?: React.MouseEvent,
    deisolate: boolean = true,
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

    if (deisolate) {
        dispatchSetSpaceField({
            field: 'isolatePlane',
            value: '',
        });
    }

    setTimeout(() => {
        focusPluridPlaneAnchor(plane.planeID);

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

    const event = undefined;
    const deisolate = false;

    navigateToPluridPlane(
        dispatch,
        activePlane,
        event,
        deisolate,
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


export const findRootIndex = (
    tree: TreePlane[],
    activePlaneID: string,
    currentRootIndex?: number,
): number | undefined => {
    for (const [index, plane] of tree.entries()) {
        if (plane.planeID === activePlaneID) {
            return currentRootIndex ?? index;
        }

        if (
            plane.children
        ) {
            const rootIndex = findRootIndex(
                plane.children,
                activePlaneID,
                index,
            );

            if (typeof rootIndex === 'number') {
                return rootIndex;
            }
        }
    }

    return;
}


export const navigateToRoot = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    state: AppState,
    type: 'previous' | 'next',
) => {
    const {
        activePlaneID,
        tree,
    } = state.space;

    const rootIndex = findRootIndex(
        tree,
        activePlaneID,
    );
    if (typeof rootIndex !== 'number') {
        return;
    }

    const treeIndex = type === 'previous'
        ? rootIndex - 1 || 0
        : rootIndex + 1;

    const root = tree[treeIndex];
    if (!root) {
        return;
    }

    navigateToPluridPlane(
        dispatch,
        root,
        undefined,
        true,
    );
}


export const focusPreviousRoot = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    state: AppState,
) => {
    navigateToRoot(
        dispatch,
        state,
        'previous',
    );
}


export const focusNextRoot = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    state: AppState,
) => {
    navigateToRoot(
        dispatch,
        state,
        'next',
    );
}


export const focusRootIndex = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    state: AppState,
    index: number,
) => {
    const {
        tree,
    } = state.space;

    const root = tree[index];
    if (!root) {
        return;
    }

    navigateToPluridPlane(
        dispatch,
        root,
        undefined,
        true,
    );
}


export const focusRootID = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    state: AppState,
    id: string,
) => {
    const {
        tree,
    } = state.space;

    const root = tree.find(plane => plane.planeID === id);
    if (!root) {
        return;
    }

    navigateToPluridPlane(
        dispatch,
        root,
        undefined,
        true,
    );
}
// #endregion module
