// #region imports
    // #region libraries
    import {
        AnyAction,
        ThunkDispatch,
        Middleware,
        configureStore,
    } from '@reduxjs/toolkit';

    import {
        CameraState,
        TreePlane,
        PluridConfiguration,
        defaultConfiguration,
    } from '@plurid/plurid-data';

    import {
        interaction,
    } from '@plurid/plurid-engine';
    // #endregion libraries


    // #region external
    import {
        createReducer,
        AppState,
    } from '../services/state/store/reducer';
    import {
        pluridMiddleware,
    } from '../services/state/store/middleware';
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
    /** Told after every action, as the application's store tells its subscribers. Returns the unsubscribe. */
    subscribe: (listener: () => void) => () => void;
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
    /** Include the history middleware, as the application does. Default `true`. */
    history?: boolean;
}

/**
 * THE REAL STACK (2026-09-13). This used to be a hand-rolled `dispatch` closure over the reducer, with
 * NO middleware at all — so nothing in the unit suite ever ran a thunk through the middleware into the
 * reducer: the reducer was tested with no store, the thunks against a middleware-free dispatch, and
 * the history middleware against a fake reducer with invented action types. An action that changed
 * the arrangement but that the history middleware failed to record would have broken undo with every
 * test still green.
 *
 * It is now `configureStore` with `pluridMiddleware` — the same stack `PluridApplication` builds —
 * plus one recording middleware at the front, which is where `dispatched` comes from. RTK's
 * development checks (serializable / immutable) run here too, so a test now catches the mistakes they
 * are there to catch.
 */
export const makeSpaceStore = (
    configuration: PluridConfiguration = defaultConfiguration,
    tree: TreePlane[] = [],
    options: HeadlessStoreOptions = {},
): HeadlessStore => {
    const extra = createThunkExtra();
    const reducer = createReducer(extra);
    const dispatched: AnyAction[] = [];

    const record: Middleware = () => (next) => (action) => {
        if (action && typeof action === 'object' && 'type' in action) {
            dispatched.push(action as AnyAction);
        }
        return next(action);
    };

    // THE STARTING POINT IS PRELOADED, never dispatched: an application boots with its arrangement
    // already computed, and a store that DISPATCHES its setup would record that setup as the first
    // undoable edit (found the moment this helper started running the real middleware, 2026-09-13).
    let preloaded = reducer(undefined, { type: '@@plurid/testing/init' });
    preloaded = reducer(preloaded, actions.configuration.setConfiguration(configuration));
    preloaded = reducer(preloaded, actions.space.setViewSize(options.view ?? TEST_VIEW));
    if (tree.length > 0) {
        preloaded = reducer(preloaded, actions.space.restoreArrangement({ tree, links: [] }));
    }

    const store = configureStore({
        reducer,
        preloadedState: preloaded as never,
        middleware: ((getDefaultMiddleware: (options: unknown) => unknown) => [
            record,
            ...pluridMiddleware(getDefaultMiddleware as (options: any) => any, {
                history: options.history !== false,
                extra,
            }),
        ]) as never,
        devTools: false,
    });

    const getState = () => store.getState() as AppState;

    return {
        getState,
        dispatch: store.dispatch as unknown as HeadlessDispatch,
        subscribe: (listener) => store.subscribe(listener),
        dispatched,
        extra,
        cameraCommits: () => dispatched.filter((action) => action.type === actions.space.setCamera.type),
        space: () => getState().space,
        tree: () => getState().space.tree,
    };
};


export interface RecordedTween {
    target: CameraState;
    options?: TweenOptions;
}

export interface RecordedFling {
    velocity: { x: number; y: number };
    kind: string;
}

export interface MotionStub {
    /** Every `tweenTo`, in order: what was asked for. */
    tweens: RecordedTween[];
    /** Every `fling`, in order. */
    flings: RecordedFling[];
    /** Every `gesture` call, in order: `true` as a drag starts, `false` as it ends. */
    gestures: boolean[];
    /** How many times an input cancelled the motion. */
    cancels: number;
    /** Make the next `tweenTo` REFUSE (a jump instead of a tween) — the branch a caller must handle. */
    refuse: (refusing?: boolean) => void;
    /** Say a motion is running, so a caller's "is something moving?" branch can be driven. */
    setActive: (active: boolean) => void;
    /**
     * LAND the running tween, as its last frame does: its target is committed and its `onSettle`
     * called. `false` when no accepted tween is running (none started, or it landed, was cancelled
     * or was replaced). The stub moves nothing by itself, so a caller waiting for a landing (a tour
     * stop) is driven by this.
     */
    land: () => boolean;
}

export interface MotionStubOptions {
    /** Whether `tweenTo` reports a started tween. Default `true`. */
    accept?: boolean;
    /** What `isActive()` says. Default `false`. */
    active?: boolean;
    /** What `reducedMotion()` says. Default `false`. */
    reducedMotion?: boolean;
}

/**
 * A mounted View's motion controller, STUBBED on the store's thunk extra: it records what was asked
 * of it and moves nothing (the real controller is `useCameraMotion`, tested against a deterministic
 * frame clock in its own suite).
 *
 * Until 2026-09-13 the stub lied in four ways — `tweenTo` always returned `true`, `isActive()` always
 * `false`, `cancel` and `fling` were unrecorded no-ops, and `reducedMotion()` was always `false` — so
 * "the controller refused the tween", "a drag cancelled a running tween", "a flick flung" and the
 * reduced-motion path were all unreachable from a unit test. Everything is recorded now, and the two
 * answers a caller branches on are the test's to set.
 */
export const motionStub = (
    store: HeadlessStore,
    options: MotionStubOptions = {},
): MotionStub => {
    const tweens: RecordedTween[] = [];
    const flings: RecordedFling[] = [];
    let accept = options.accept ?? true;
    let active = options.active ?? false;
    // the accepted tween that has not landed, with the callbacks it carries as the real controller's
    // would (an exclusive tween's are its own; a retarget that `continues` it keeps them; a
    // non-exclusive tween's settle rides the tween that replaces it; a caller asking for the same
    // pose joins it)
    let running: {
        target: CameraState;
        onSettle?: () => void;
        onInterrupt?: () => void;
        riders: (() => void)[];
    } | undefined;
    const both = (
        first: (() => void) | undefined,
        second: (() => void) | undefined,
    ) => (first && second ? () => { first(); second(); } : (first ?? second));

    const stub: MotionStub = {
        tweens,
        flings,
        gestures: [],
        cancels: 0,
        refuse: (refusing = true) => {
            accept = !refusing;
        },
        setActive: (next) => {
            active = next;
        },
        land: () => {
            const landing = running;
            if (!landing) {
                return false;
            }
            running = undefined;
            store.dispatch(actions.space.setCamera(landing.target));
            for (const rider of landing.riders) {
                rider();
            }
            landing.onSettle?.();
            return true;
        },
    };

    store.extra.motion = {
        tweenTo: (target, tweenOptions) => {
            tweens.push({ target, options: tweenOptions });
            const previous = running;
            // the same pose: joined, as the controller joins it (an accepted tween only)
            if (accept && previous && interaction.camera.sameCamera(previous.target, target, 1e-9)) {
                if (tweenOptions?.continues) {
                    previous.onSettle = tweenOptions.onSettle ?? previous.onSettle;
                    previous.onInterrupt = tweenOptions.onInterrupt ?? previous.onInterrupt;
                } else {
                    previous.onSettle = both(previous.onSettle, tweenOptions?.onSettle);
                    previous.onInterrupt = both(previous.onInterrupt, tweenOptions?.onInterrupt);
                }
                return true;
            }
            let onSettle = tweenOptions?.onSettle;
            let onInterrupt = tweenOptions?.onInterrupt;
            let riders: (() => void)[] = [];
            let replaced: (() => void) | undefined;
            if (previous && tweenOptions?.continues) {
                onSettle = tweenOptions.onSettle ?? previous.onSettle;
                onInterrupt = tweenOptions.onInterrupt ?? previous.onInterrupt;
                riders = previous.riders;
            } else if (previous) {
                riders = previous.onInterrupt || !previous.onSettle
                    ? previous.riders
                    : [...previous.riders, previous.onSettle];
                replaced = previous.onInterrupt;
            }
            running = undefined;
            if (!accept) {
                // THE CONTRACT OF A REFUSAL: `false` means "I did not tween — I jumped", and the real
                // controller commits the camera itself before saying so (`useCameraMotion`), which is
                // why `commitCameraTarget` returns without committing. A stub that refused WITHOUT
                // committing would make its callers look broken.
                if (tweenOptions?.docking) {
                    store.dispatch(actions.space.setDockingPlaneID(tweenOptions.docking));
                }
                store.dispatch(actions.space.setCamera(target));
                if (tweenOptions?.docking) {
                    store.dispatch(actions.space.setDockingPlaneID(''));
                }
                replaced?.();
                for (const rider of riders) {
                    rider();
                }
                onSettle?.();
                return false;
            }
            running = { target, onSettle, onInterrupt, riders };
            replaced?.();
            return true;
        },
        cancel: () => {
            stub.cancels += 1;
            const stopped = running;
            running = undefined;
            stopped?.onInterrupt?.();
        },
        fling: (velocity, kind) => {
            flings.push({ velocity: { x: velocity.x, y: velocity.y }, kind });
        },
        gesture: (on) => {
            stub.gestures.push(on);
        },
        isActive: () => active,
        reducedMotion: () => options.reducedMotion ?? false,
    };

    return stub;
};

/** The recorded tweens alone — what most callers want (`motionStub` for the rest). */
export const motionSpy = (
    store: HeadlessStore,
): RecordedTween[] => motionStub(store).tweens;
// #endregion module
