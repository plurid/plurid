// #region imports
    // #region libraries
    import React, {
        useEffect,
        useMemo,
        useRef,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';

    import {
        CameraState,
        CameraDelta,
        CameraMotion,
        PluridConfigurationSpace,
        Vec2,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import actions from '~services/state/actions';
    import { AppState } from '~services/state/store';

    import {
        interaction,
    } from '~services/engine';

    import {
        applyLocks,
    } from '~services/logic/input/gesture';

    import {
        FlingKind,
        TweenOptions,
        CameraMotionController,
        EasingName,
    } from '~services/logic/motion';
    // #endregion external
// #endregion imports



// #region module
const {
    camera: cameraEngine,
} = interaction;

type Easing = (t: number) => number;

export type {
    FlingKind,
    TweenOptions,
    CameraMotionController,
    EasingName,
};

export interface UseCameraMotionParameters {
    dispatch: ThunkDispatch<{}, {}, AnyAction>;
    stateRef: React.MutableRefObject<AppState>;
    /** The store as it is now (`stateRef` holds the last render's): where a tween starts. */
    getState?: () => AppState;
    spaceConfiguration: PluridConfigurationSpace;
}

/** The clock the tweens read (the global one, so tests can drive it); `Date.now` without `performance`. */
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

const REFERENCE_FRAME_MS = 1000 / 60;


/**
 * The ONE rAF loop that drives programmatic camera motion — tweens (frame / fit / navigate /
 * presets) and momentum flings — dispatching a single camera commit per frame. Store-driven frames
 * keep the viewpoint URL, the minimap, `space.changed` observers and persistence consistent every
 * frame, and any input can interrupt exactly where the camera is (`cancel`).
 */
export const useCameraMotion = (
    {
        dispatch,
        stateRef,
        getState,
        spaceConfiguration,
    }: UseCameraMotionParameters,
): CameraMotionController => {
    const getStateRef = useRef(getState);
    getStateRef.current = getState;
    /** the store now, else the last render's (a host of the hook without a store) */
    const live = () => getStateRef.current?.() ?? stateRef.current;
    const configRef = useRef(spaceConfiguration);
    configRef.current = spaceConfiguration;

    const frame = useRef<number | null>(null);
    const tween = useRef<{
        from: CameraState;
        to: CameraState;
        start: number;
        duration: number;
        easing: Easing;
        /** the caller's: told when it lands */
        onSettle?: () => void;
        /** set: the tween is EXCLUSIVE, and this is told when it stops without landing */
        onInterrupt?: () => void;
        /**
         * The settles of the non-exclusive tweens this one replaced: each rides on, through every
         * retarget, and is told when the camera lands (never when an input stops it).
         */
        riders: (() => void)[];
    } | null>(null);
    const fling = useRef<{
        velocity: Vec2;
        kind: FlingKind;
        last: number;
    } | null>(null);
    // The motion this controller last dispatched. `stateRef` is assigned at render time, so within
    // one synchronous run (a retarget: `stop()` then a new tween) it cannot tell that the store
    // already moved — comparing against it alone skipped the `tween` after the `idle`.
    const motionRef = useRef<CameraMotion>('idle');

    const mediaQuery = useRef<MediaQueryList | null>(null);
    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return;
        }
        mediaQuery.current = window.matchMedia('(prefers-reduced-motion: reduce)');
    }, []);

    const controller = useMemo<CameraMotionController>(() => {
        const setMotion = (motion: CameraMotion) => {
            if (motionRef.current !== motion || stateRef.current?.space?.motion !== motion) {
                motionRef.current = motion;
                dispatch(actions.space.setMotion(motion));
            }
        };

        /**
         * Stop the motion, and hand back what an exclusive tween asked to be told when it stops
         * without landing: the caller calls it once the motion it replaces this one with (none, a
         * jump, a tween) is in place, so a caller that reacts by moving the camera finds the
         * controller settled, not halfway through a retarget.
         */
        const stop = (): (() => void) | undefined => {
            if (frame.current !== null) {
                cancelAnimationFrame(frame.current);
                frame.current = null;
            }
            const interrupted = tween.current?.onInterrupt;
            const wasActive = tween.current !== null || fling.current !== null;
            tween.current = null;
            fling.current = null;
            if (wasActive) {
                setMotion('idle');
            }
            return interrupted;
        };

        /** Stop whatever drives the camera, and tell an exclusive tween it did not land. */
        const halt = () => {
            stop()?.();
        };

        /** one callback, then the other: two callers waiting on one landing */
        const both = (
            first: (() => void) | undefined,
            second: (() => void) | undefined,
        ) => (first && second
            ? () => {
                first();
                second();
            }
            : (first ?? second));

        const reducedMotion = () => {
            const policy = configRef.current.navigation?.motion?.reducedMotion ?? 'respect';
            return policy === 'respect' && !!mediaQuery.current?.matches;
        };

        const tick = (now: number) => {
            frame.current = null;

            const activeTween = tween.current;
            if (activeTween) {
                const progress = activeTween.duration <= 0
                    ? 1
                    : Math.min(1, (now - activeTween.start) / activeTween.duration);
                const camera = cameraEngine.interpolateCamera(
                    activeTween.from,
                    activeTween.to,
                    activeTween.easing(progress),
                );
                dispatch(actions.space.setCamera(camera));
                if (progress >= 1) {
                    const {
                        onSettle,
                        riders,
                    } = activeTween;
                    tween.current = null;
                    setMotion('idle');
                    for (const rider of riders) {
                        rider();
                    }
                    onSettle?.();
                    return;
                }
                frame.current = requestAnimationFrame(tick);
                return;
            }

            const activeFling = fling.current;
            if (activeFling) {
                const dt = Math.min(Math.max(now - activeFling.last, 0), 64);
                activeFling.last = now;
                const gestures = configRef.current.gestures || {};
                const decay = gestures.momentumDecay ?? 0.92;
                const minimum = (gestures.momentumMin ?? 0.05) / REFERENCE_FRAME_MS;

                const velocity = activeFling.velocity;
                let delta: CameraDelta;
                if (activeFling.kind === 'orbit') {
                    const sensitivity = gestures.rotateSensitivity ?? 0.22;
                    delta = {
                        yaw: velocity.x * dt * sensitivity,
                        pitch: -velocity.y * dt * sensitivity,
                    };
                } else {
                    delta = {
                        pan: {
                            x: velocity.x * dt,
                            y: velocity.y * dt,
                        },
                    };
                }
                dispatch(actions.space.applyCameraDelta(
                    applyLocks(delta, configRef.current.transformLocks),
                ));

                velocity.x = cameraEngine.decayVelocity(velocity.x, decay, dt);
                velocity.y = cameraEngine.decayVelocity(velocity.y, decay, dt);
                if (Math.abs(velocity.x) < minimum && Math.abs(velocity.y) < minimum) {
                    fling.current = null;
                    setMotion('idle');
                    return;
                }
                frame.current = requestAnimationFrame(tick);
            }
        };

        const schedule = () => {
            if (frame.current === null) {
                frame.current = requestAnimationFrame(tick);
            }
        };

        return {
            cancel: halt,
            isActive: () => tween.current !== null || fling.current !== null,
            reducedMotion,
            fling: (velocity, kind) => {
                if (typeof requestAnimationFrame !== 'function') {
                    return;
                }
                const gestures = configRef.current.gestures || {};
                if (gestures.disableMomentum || reducedMotion()) {
                    return;
                }
                const enabled = kind === 'orbit'
                    ? gestures.momentum?.orbit ?? true
                    : gestures.momentum?.pan ?? true;
                if (!enabled) {
                    return;
                }
                const minimum = (gestures.momentumMin ?? 0.05) / REFERENCE_FRAME_MS;
                if (Math.abs(velocity.x) < minimum && Math.abs(velocity.y) < minimum) {
                    return;
                }
                halt();
                fling.current = {
                    velocity: { x: velocity.x, y: velocity.y },
                    kind,
                    last: now(),
                };
                setMotion('fling');
                schedule();
            },
            gesture: (active) => {
                if (active) {
                    halt();
                    setMotion('gesture');
                } else if (motionRef.current === 'gesture') {
                    setMotion('idle');
                }
            },
            tweenTo: (target, options = {}) => {
                const running = tween.current;
                // already on its way there: a retarget to the same pose would only restart the tween.
                // Another caller asking for it JOINS it: the camera lands where both asked, so both
                // are told, whichever kind each is; a retarget that continues it re-aims its owner's
                // callbacks (2026-10-30)
                if (running && cameraEngine.sameCamera(running.to, target, 1e-9)) {
                    if (options.continues) {
                        running.onSettle = options.onSettle ?? running.onSettle;
                        running.onInterrupt = options.onInterrupt ?? running.onInterrupt;
                    } else {
                        running.onSettle = both(running.onSettle, options.onSettle);
                        running.onInterrupt = both(running.onInterrupt, options.onInterrupt);
                    }
                    return true;
                }
                // WHAT THE REPLACED CALLER HEARS (2026-10-30). A retarget that continues the running
                // tween keeps its callbacks. Another caller's tween replaces it: an EXCLUSIVE one is
                // told `onInterrupt` (it did not land where it asked) and its `onSettle` goes no
                // further; a non-exclusive one gave no `onInterrupt`, and its `onSettle` RIDES the
                // replacing tween, told when the camera lands, as a re-frame always carried the
                // focus grab after a link. It was dropped, in silence, whenever the replacing caller
                // brought an `onSettle` of its own.
                let onSettle = options.onSettle;
                let onInterrupt = options.onInterrupt;
                let riders: (() => void)[] = [];
                let replaced: (() => void) | undefined;
                if (running && options.continues) {
                    onSettle = options.onSettle ?? running.onSettle;
                    onInterrupt = options.onInterrupt ?? running.onInterrupt;
                    riders = running.riders;
                } else if (running) {
                    riders = running.onInterrupt || !running.onSettle
                        ? running.riders
                        : [...running.riders, running.onSettle];
                    replaced = running.onInterrupt;
                }
                stop();
                // FROM THE STORE AS IT IS NOW (2026-10-20): the last render's camera, a jump in the same
                // tick was not in it, and the tween started from before the jump
                const from = live().space.camera;
                const motion = configRef.current.navigation?.motion || {};
                const duration = options.duration ?? motion.duration ?? 380;
                // `spring` is out-quint, asked per call as in the configuration (per call it fell to
                // out-cubic, 2026-10-20); no spring is simulated
                const asked = options.easing ?? motion.easing ?? 'out-cubic';
                const easingName = asked === 'spring' ? 'out-quint' : asked;

                if (
                    duration <= 0
                    || reducedMotion()
                    || typeof requestAnimationFrame !== 'function'
                    || cameraEngine.sameCamera(from, target, 1e-9)
                ) {
                    // a jump that docks names its page for its one commit, as the jump of a dock does
                    if (options.docking) {
                        dispatch(actions.space.setDockingPlaneID(options.docking));
                    }
                    dispatch(actions.space.setCamera(target));
                    if (options.docking) {
                        dispatch(actions.space.setDockingPlaneID(''));
                    }
                    replaced?.();
                    for (const rider of riders) {
                        rider();
                    }
                    onSettle?.();
                    return false;
                }

                tween.current = {
                    from,
                    to: target,
                    start: now(),
                    duration,
                    easing: (cameraEngine.EASINGS as Record<string, Easing>)[easingName] || cameraEngine.EASINGS['out-cubic'],
                    onSettle,
                    onInterrupt,
                    riders,
                };
                setMotion('tween');
                schedule();
                replaced?.();
                return true;
            },
        };
    }, []);

    useEffect(() => () => {
        controller.cancel();
    }, [controller]);

    return controller;
}
// #endregion module



// #region exports
export default useCameraMotion;
// #endregion exports
