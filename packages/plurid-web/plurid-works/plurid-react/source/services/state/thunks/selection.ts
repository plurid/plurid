// #region imports
    // #region libraries
    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    // #endregion libraries


    // #region external
    import actions from '~services/state/actions';
    import { AppState } from '~services/state/store';

    import {
        space as spaceEngine,
    } from '~services/engine';

    import {
        resolvePlaneFallbackSize,
    } from '~services/logic/camera';

    import {
        navigatePlane,
        getActivePlane,
    } from '~services/logic/animation';

    import {
        planesInScreenRect,
        projectedPlaneCenters,
        nearestInDirection,
        ScreenRect,
        Direction,
    } from '~services/logic/selection';
    // #endregion external
// #endregion imports



// #region module
type Dispatch = ThunkDispatch<{}, {}, AnyAction>;
type GetState = () => AppState;
export type SelectionThunk = (dispatch: Dispatch, getState: GetState) => void;

const fallbackOf = (
    state: AppState,
) => resolvePlaneFallbackSize(state.configuration, state.space.viewSize);

const snapOptionsOf = (
    state: AppState,
) => {
    const snap = state.configuration.space.snap;
    return {
        threshold: snap?.threshold,
        grid: snap?.grid,
        enabled: snap?.enabled !== false,
    };
};


/** Snap the selection after a drag (edge/center/grid), through the shared snap engine. */
export const snapSelectionNow = (): SelectionThunk => (dispatch, getState) => {
    const state = getState();
    const options = snapOptionsOf(state);
    if (!options.enabled) {
        return;
    }
    const fallback = fallbackOf(state);
    dispatch(actions.space.snapSelection({
        threshold: options.threshold,
        grid: options.grid,
        fallbackWidth: fallback.width,
        fallbackHeight: fallback.height,
    }));
};


export const alignSelection = (
    edge: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY',
): SelectionThunk => (dispatch, getState) => {
    const fallback = fallbackOf(getState());
    dispatch(actions.space.alignSelection({
        edge,
        fallbackWidth: fallback.width,
        fallbackHeight: fallback.height,
    }));
};


export const distributeSelection = (
    axis: 'x' | 'y',
): SelectionThunk => (dispatch, getState) => {
    const fallback = fallbackOf(getState());
    dispatch(actions.space.distributeSelection({
        axis,
        fallbackWidth: fallback.width,
        fallbackHeight: fallback.height,
    }));
};


export const duplicateSelection = (
    offset = 40,
): SelectionThunk => (dispatch) => {
    dispatch(actions.space.duplicateSelection({ offset }));
};


/**
 * The marquee's result: the planes whose projected rect intersects the screen rect — replacing
 * the selection, added to it (`add`), or removed from it (`subtract`).
 */
export const selectInScreenRect = (
    rect: ScreenRect,
    mode: 'set' | 'add' | 'subtract' = 'set',
): SelectionThunk => (dispatch, getState) => {
    const state = getState();
    const {
        tree,
        camera,
        viewSize,
        selectedPlaneIDs,
    } = state.space;

    const hits = planesInScreenRect(tree, camera, viewSize, rect, fallbackOf(state));

    if (mode === 'set') {
        dispatch(actions.space.setSelection(hits));
        return;
    }
    const current = new Set(selectedPlaneIDs);
    if (mode === 'add') {
        for (const id of hits) {
            current.add(id);
        }
    } else {
        for (const id of hits) {
            current.delete(id);
        }
    }
    dispatch(actions.space.setSelection([...current]));
};


/**
 * Keyboard plane navigation: from the active plane (or the view center), the nearest plane in a
 * screen direction becomes active and is framed.
 */
export const navigateDirection = (
    direction: Direction,
): SelectionThunk => (dispatch, getState) => {
    const state = getState();
    const {
        tree,
        camera,
        viewSize,
    } = state.space;
    const fallback = fallbackOf(state);
    const centers = projectedPlaneCenters(tree, camera, viewSize, fallback);
    if (centers.length === 0) {
        return;
    }

    const active = getActivePlane(state);
    const from = active
        ? centers.find((center) => center.id === active.planeID)
        : undefined;
    const origin = from
        ? { x: from.x, y: from.y }
        : { x: viewSize.width / 2, y: viewSize.height / 2 };
    const candidates = centers.filter((center) => center.id !== active?.planeID);

    const targetID = nearestInDirection(candidates, origin, direction)
        ?? (from ? undefined : candidates[0]?.id);
    if (!targetID) {
        return;
    }

    const target = spaceEngine.tree.logic.getTreePlaneByID(tree, targetID);
    if (!target) {
        return;
    }
    dispatch(navigatePlane(target, { deisolate: false }) as any);
};
// #endregion module
