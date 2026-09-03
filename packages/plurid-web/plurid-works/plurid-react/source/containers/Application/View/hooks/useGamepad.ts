// #region imports
    // #region libraries
    import React, {
        useEffect,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';

    import {
        CameraDelta,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import actions from '~services/state/actions';
    import { AppState } from '~services/state/store';

    import {
        applyLocks,
    } from '~services/logic/input/gesture';

    import {
        cameraCommand,
    } from '~services/logic/camera';

    import {
        CameraMotionController,
    } from '~services/logic/motion';
    // #endregion external
// #endregion imports



// #region module
export interface UseGamepadParameters {
    dispatch: ThunkDispatch<{}, {}, AnyAction>;
    stateRef: React.MutableRefObject<AppState>;
    motion: CameraMotionController;
}

const REFERENCE_FRAME_MS = 1000 / 60;

// Standard-mapping indices.
const AXIS_LEFT_X = 0;
const AXIS_LEFT_Y = 1;
const AXIS_RIGHT_X = 2;
const AXIS_RIGHT_Y = 3;
const BUTTON_A = 0;
const BUTTON_B = 1;
const BUTTON_Y = 3;
const BUTTON_LEFT_TRIGGER = 6;
const BUTTON_RIGHT_TRIGGER = 7;


/** Dead zone + response curve on one stick axis, sign preserved. */
export const shapeAxis = (
    value: number,
    deadZone: number,
    curve: number,
): number => {
    const magnitude = Math.abs(value);
    if (magnitude < deadZone) {
        return 0;
    }
    const normalized = Math.min(1, (magnitude - deadZone) / (1 - deadZone));
    return Math.sign(value) * Math.pow(normalized, curve);
};


/**
 * Opt-in gamepad navigation (`gestures.gamepad.enabled`): left stick pans (flies in first person),
 * right stick orbits (looks in first person), triggers zoom (dolly in first person); A frames
 * everything, Y goes home, B undoes. Polled per frame only while enabled and a pad is connected,
 * dt-based so the speed is the same at 60 and 240 Hz; any stick input cancels a tween or fling.
 */
export const useGamepad = (
    {
        dispatch,
        stateRef,
        motion,
    }: UseGamepadParameters,
) => {
    const enabled = !!stateRef.current?.configuration?.space?.gestures?.gamepad?.enabled;

    useEffect(() => {
        if (
            !enabled
            || typeof window === 'undefined'
            || typeof navigator === 'undefined'
            || typeof navigator.getGamepads !== 'function'
            || typeof requestAnimationFrame !== 'function'
        ) {
            return;
        }

        let frame: number | null = null;
        let last = 0;
        const pressed = new Set<number>();

        const tick = (now: number) => {
            frame = null;
            const configuration = stateRef.current.configuration.space;
            const settings = configuration.gestures?.gamepad;
            if (!settings?.enabled) {
                return;
            }

            const dt = last ? Math.min(Math.max(now - last, 0), 64) : REFERENCE_FRAME_MS;
            last = now;
            const k = dt / REFERENCE_FRAME_MS;

            const pads = Array.from(navigator.getGamepads() || []);
            const pad = pads.find((candidate) => candidate && candidate.connected);

            if (pad) {
                const deadZone = settings.deadZone ?? 0.15;
                const curve = settings.curve ?? 2;
                const panSpeed = settings.panSpeed ?? 14;
                const orbitSpeed = settings.orbitSpeed ?? 2.4;
                const zoomSpeed = settings.zoomSpeed ?? 1.02;
                const firstPerson = !!configuration.firstPerson;

                const leftX = shapeAxis(pad.axes[AXIS_LEFT_X] ?? 0, deadZone, curve);
                const leftY = shapeAxis(pad.axes[AXIS_LEFT_Y] ?? 0, deadZone, curve);
                const rightX = shapeAxis(pad.axes[AXIS_RIGHT_X] ?? 0, deadZone, curve);
                const rightY = shapeAxis(pad.axes[AXIS_RIGHT_Y] ?? 0, deadZone, curve);
                const leftTrigger = pad.buttons[BUTTON_LEFT_TRIGGER]?.value ?? 0;
                const rightTrigger = pad.buttons[BUTTON_RIGHT_TRIGGER]?.value ?? 0;
                const trigger = rightTrigger - leftTrigger;

                const delta: CameraDelta = {};
                if (leftX !== 0 || leftY !== 0) {
                    if (firstPerson) {
                        delta.fly = {
                            forward: -leftY * panSpeed * k,
                            strafe: leftX * panSpeed * k,
                        };
                    } else {
                        delta.pan = {
                            x: -leftX * panSpeed * k,
                            y: -leftY * panSpeed * k,
                        };
                    }
                }
                if (rightX !== 0 || rightY !== 0) {
                    if (firstPerson) {
                        delta.look = {
                            yaw: rightX * orbitSpeed * k,
                            pitch: -rightY * orbitSpeed * k,
                        };
                    } else {
                        delta.yaw = rightX * orbitSpeed * k;
                        delta.pitch = -rightY * orbitSpeed * k;
                    }
                }
                if (Math.abs(trigger) > 0.02) {
                    if (firstPerson) {
                        delta.dolly = trigger * panSpeed * k;
                    } else {
                        delta.zoom = {
                            factor: Math.pow(zoomSpeed, trigger * k),
                        };
                    }
                }

                if (Object.keys(delta).length > 0) {
                    motion.cancel();
                    dispatch(actions.space.applyCameraDelta(
                        applyLocks(delta, configuration.transformLocks),
                    ));
                }

                // Edge-triggered buttons.
                const edge = (index: number, run: () => void) => {
                    const down = !!pad.buttons[index]?.pressed;
                    if (down && !pressed.has(index)) {
                        pressed.add(index);
                        run();
                    } else if (!down) {
                        pressed.delete(index);
                    }
                };
                edge(BUTTON_A, () => dispatch(cameraCommand({ kind: 'fit' }, { animate: true }) as any));
                edge(BUTTON_Y, () => dispatch(cameraCommand({ kind: 'home' }, { animate: true }) as any));
                edge(BUTTON_B, () => dispatch(actions.space.undo()));
            }

            frame = requestAnimationFrame(tick);
        };

        const start = () => {
            if (frame === null) {
                last = 0;
                frame = requestAnimationFrame(tick);
            }
        };

        window.addEventListener('gamepadconnected', start);
        start();

        return () => {
            window.removeEventListener('gamepadconnected', start);
            if (frame !== null) {
                cancelAnimationFrame(frame);
                frame = null;
            }
        };
    }, [
        enabled,
        motion,
    ]);
}
// #endregion module



// #region exports
export default useGamepad;
// #endregion exports
