// #region imports
    // #region libraries
    import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';


    import {
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
        focusPluridPlaneAnchor,
    } from '../transform';

    import {
        framePlaneNode,
        CameraThunk,
    } from '../camera';
    // #endregion external
// #endregion imports



// #region module
/**
 * Navigate to a plane: frame it face-on (an interruptible tween through the motion controller),
 * de-isolate, make it the active plane, and move keyboard focus to its anchor once the tween has
 * landed (`preventScroll`, so the focus never scrolls the view).
 */
export interface NavigatePlaneOptions {
    deisolate?: boolean;
    animate?: boolean;
    /** Frame again once the plane's first measurement lands (a plane that (re)opens with a stale size). */
    awaitMeasure?: boolean;
}


export const navigatePlane = (
    plane: TreePlane,
    options: NavigatePlaneOptions = {},
): CameraThunk => (dispatch, getState) => {
    const {
        deisolate = true,
        animate = true,
        awaitMeasure = false,
    } = options;

    dispatch(framePlaneNode(plane, animate, { awaitMeasure }) as any);

    if (deisolate) {
        dispatch(actions.space.setSpaceField({
            field: 'isolatePlane',
            value: '',
        }));
    }

    dispatch(actions.space.setSpaceField({
        field: 'activePlaneID',
        value: plane.planeID,
    }));

    const duration = animate
        ? (getState().configuration.space.navigation?.motion?.duration ?? 380)
        : 0;
    const focus = () => {
        focusPluridPlaneAnchor(plane.planeID);
    };
    if (duration > 0) {
        setTimeout(focus, duration + 16);
    } else {
        focus();
    }
};


export const navigateToPluridPlane = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    plane: TreePlane | undefined,
    event?: React.MouseEvent,
    deisolate: boolean = true,
    options: Pick<NavigatePlaneOptions, 'awaitMeasure'> = {},
) => {
    if (event && (event.ctrlKey || event.metaKey)) {
        // Only navigate at pure link click.
        return;
    }

    if (!plane) {
        return;
    }

    dispatch(navigatePlane(plane, { deisolate, ...options }) as any);
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

    let root = tree[treeIndex];
    if (!root) {
        // cycle over tree
        if (type === 'previous') {
            root = tree[tree.length - 1];
        } else {
            root = tree[0];
        }

        if (!root) {
            return;
        }
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
