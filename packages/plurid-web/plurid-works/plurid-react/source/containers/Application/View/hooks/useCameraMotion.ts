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
    spaceConfiguration: PluridConfigurationSpace;
}

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
        spaceConfiguration,
    }: UseCameraMotionParameters,
): CameraMotionController => {
    const configRef = useRef(spaceConfiguration);
    configRef.current = spaceConfiguration;

    const frame = useRef<number | null>(null);
    const tween = useRef<{
        from: CameraState;
        to: CameraState;
        start: number;
        duration: number;
        easing: Easing;
    } | null>(null);
    const fling = useRef<{
        velocity: Vec2;
        kind: FlingKind;
        last: number;
    } | null>(null);

    const mediaQuery = useRef<MediaQueryList | null>(null);
    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return;
        }
        mediaQuery.current = window.matchMedia('(prefers-reduced-motion: reduce)');
    }, []);

    const controller = useMemo<CameraMotionController>(() => {
        const setMotion = (motion: CameraMotion) => {
            if (stateRef.current?.space?.motion !== motion) {
                dispatch(actions.space.setMotion(motion));
            }
        };

        const stop = () => {
            if (frame.current !== null) {
                cancelAnimationFrame(frame.current);
                frame.current = null;
            }
            const wasActive = tween.current !== null || fling.current !== null;
            tween.current = null;
            fling.current = null;
            if (wasActive) {
                setMotion('idle');
            }
        };

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
                    tween.current = null;
                    setMotion('idle');
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
            cancel: stop,
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
                stop();
                fling.current = {
                    velocity: { x: velocity.x, y: velocity.y },
                    kind,
                    last: performance.now(),
                };
                setMotion('fling');
                schedule();
            },
            tweenTo: (target, options = {}) => {
                stop();
                const from = stateRef.current.space.camera;
                const motion = configRef.current.navigation?.motion || {};
                const duration = options.duration ?? motion.duration ?? 380;
                const easingName = options.easing ?? (motion.easing === 'spring' ? 'out-quint' : (motion.easing ?? 'out-cubic'));

                if (
                    duration <= 0
                    || reducedMotion()
                    || typeof requestAnimationFrame !== 'function'
                    || cameraEngine.sameCamera(from, target, 1e-9)
                ) {
                    dispatch(actions.space.setCamera(target));
                    return;
                }

                tween.current = {
                    from,
                    to: target,
                    start: performance.now(),
                    duration,
                    easing: (cameraEngine.EASINGS as Record<string, Easing>)[easingName] || cameraEngine.EASINGS['out-cubic'],
                };
                setMotion('tween');
                schedule();
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
