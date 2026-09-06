// #region imports
    // #region libraries
    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';

    import {
        CameraState,
        TreePlane,
        PluridConfiguration,
        defaultConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import reducer, {
        AppState,
    } from '../services/state/store/reducer';
    import actions from '../services/state/actions';
    import {
        createThunkExtra,
        PluridThunkExtra,
    } from '../services/state/extra';
    import type {
        TweenOptions,
    } from '../services/logic/motion';
    // #endregion external


    // #region internal
    import {
        ViewSize,
        TEST_VIEW,
    } from './fixtures';
    // #endregion internal
// #endregion imports



// #region module
export type HeadlessDispatch = ThunkDispatch<AppState, PluridThunkExtra, AnyAction>;

/**
 * A HEADLESS STORE: the application's reducer and thunk extra without a DOM or a React tree. A
 * thunk runs through `dispatch` exactly as in the application (`dispatch(thunk)` or
 * `thunk(dispatch, getState, extra)`); every plain action that reached the reducer is kept.
 */
export interface HeadlessStore {
    getState: () => AppState;
    dispatch: HeadlessDispatch;
    /** every plain action that reached the reducer, in order */
    dispatched: AnyAction[];
    /** the thunk extra: mount a motion controller on it with `motionSpy` */
    extra: PluridThunkExtra;
    /** the camera commits so far (`space/setCamera`) */
    cameraCommits: () => AnyAction[];
    space: () => AppState['space'];
    tree: () => TreePlane[];
}

export interface HeadlessStoreOptions {
    view?: ViewSize;
}

export const makeSpaceStore = (
    configuration: PluridConfiguration = defaultConfiguration,
    tree: TreePlane[] = [],
    options: HeadlessStoreOptions = {},
): HeadlessStore => {
    let state = reducer(undefined, { type: '@@plurid/testing/init' });
    state = reducer(state, actions.configuration.setConfiguration(configuration));
    state = reducer(state, actions.space.setViewSize(options.view ?? TEST_VIEW));
    if (tree.length > 0) {
        state = reducer(state, actions.space.restoreArrangement({ tree, links: [] }));
    }

    const extra = createThunkExtra();
    const dispatched: AnyAction[] = [];
    const getState = () => state;
    // one typed seam: a function that is both the thunk runner and the action sink
    const dispatch = ((action: AnyAction | ((...parameters: unknown[]) => unknown)) => {
        if (typeof action === 'function') {
            return action(dispatch, getState, extra);
        }
        dispatched.push(action);
        state = reducer(state, action);
        return action;
    }) as HeadlessDispatch;

    return {
        getState,
        dispatch,
        dispatched,
        extra,
        cameraCommits: () => dispatched.filter((action) => action.type === actions.space.setCamera.type),
        space: () => state.space,
        tree: () => state.space.tree,
    };
};


export interface RecordedTween {
    target: CameraState;
    options?: TweenOptions;
}

/**
 * A mounted View's motion controller, as a spy on the store's thunk extra: every `tweenTo` is
 * recorded and reports a started tween; nothing moves the camera. Returns the record.
 */
export const motionSpy = (
    store: HeadlessStore,
): RecordedTween[] => {
    const tweens: RecordedTween[] = [];
    store.extra.motion = {
        tweenTo: (target, options) => {
            tweens.push({ target, options });
            return true;
        },
        cancel: () => {},
        fling: () => {},
        isActive: () => false,
        reducedMotion: () => false,
    };
    return tweens;
};
// #endregion module
