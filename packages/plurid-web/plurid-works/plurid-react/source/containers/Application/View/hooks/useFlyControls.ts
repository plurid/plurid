// #region imports
    // #region libraries
    import React, {
        useEffect,
        useRef,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';

    import {
        PluridConfigurationSpace,
        PluridShortcutID,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import actions from '~services/state/actions';

    import {
        isEditableTarget,
    } from '~services/logic/input/guard';

    import {
        applyLocks,
    } from '~services/logic/input/gesture';

    import {
        createFrameBatcher,
    } from '~services/logic/input/frame';

    import {
        resolveHoldShortcuts,
    } from '~services/logic/shortcuts/registry';
    // #endregion external


    // #region internal
    import type {
        CameraMotionController,
    } from './useCameraMotion';
    // #endregion internal
// #endregion imports



// #region module
export interface UseFlyControlsParameters {
    viewElement: React.RefObject<HTMLDivElement>;
    firstPerson: boolean;
    spaceConfiguration: PluridConfigurationSpace;
    dispatch: ThunkDispatch<{}, {}, AnyAction>;
    motion: CameraMotionController;
}

const REFERENCE_FRAME_MS = 1000 / 60;

const FLY_IDS: PluridShortcutID[] = [
    'flyForward',
    'flyBack',
    'flyLeft',
    'flyRight',
    'flyUp',
    'flyDown',
    'flySprint',
];


/**
 * First-person "fly" controls, active only in `firstPerson` mode. The held keys come from the
 * shortcut registry (WASD move, E up, Q down, Shift sprint — remappable / disableable like every
 * other shortcut), movement is TIME-based (`flySpeed` is px per 60 Hz frame, applied per real
 * frame duration) with normalized diagonals, and the loop runs only while a key is down. Typing in
 * a field never flies. Mouse-look: click the view to lock the pointer and steer (Esc releases);
 * the look rotates about the EYE. Drag-to-look while not locked lives in the pointer hook.
 */
export const useFlyControls = (
    {
        viewElement,
        firstPerson,
        spaceConfiguration,
        dispatch,
        motion,
    }: UseFlyControlsParameters,
) => {
    const configRef = useRef(spaceConfiguration);
    configRef.current = spaceConfiguration;

    useEffect(() => {
        const element = viewElement.current;
        if (!element || typeof window === 'undefined' || !firstPerson) {
            return;
        }

        const batcher = createFrameBatcher((delta) => {
            dispatch(actions.space.applyCameraDelta(
                applyLocks(delta, configRef.current.transformLocks),
            ));
        });

        const held = new Map<PluridShortcutID, true>();
        let frame: number | null = null;
        let last = 0;

        const codeToID = () => {
            const map = new Map<string, PluridShortcutID>();
            for (const entry of resolveHoldShortcuts(configRef.current.shortcuts)) {
                if (FLY_IDS.includes(entry.id)) {
                    map.set(entry.code, entry.id);
                }
            }
            return map;
        };

        const loop = (now: number) => {
            frame = null;
            const dt = last === 0 ? REFERENCE_FRAME_MS : Math.min(Math.max(now - last, 0), 64);
            last = now;

            const gestures = configRef.current.gestures || {};
            const speed = (gestures.flySpeed ?? 9) * (dt / REFERENCE_FRAME_MS);
            const sprint = held.has('flySprint') ? (gestures.flySprintMultiplier ?? 2.5) : 1;

            let forward = 0;
            let strafe = 0;
            let vertical = 0;
            if (held.has('flyForward')) { forward += 1; }
            if (held.has('flyBack')) { forward -= 1; }
            if (held.has('flyRight')) { strafe += 1; }
            if (held.has('flyLeft')) { strafe -= 1; }
            if (held.has('flyUp')) { vertical += 1; }
            if (held.has('flyDown')) { vertical -= 1; }

            const planar = Math.hypot(forward, strafe);
            if (planar > 1) {
                forward /= planar;
                strafe /= planar;
            }

            if (forward !== 0 || strafe !== 0 || vertical !== 0) {
                batcher.add({
                    fly: {
                        forward: forward * speed * sprint,
                        strafe: strafe * speed * sprint,
                        vertical: vertical * speed * sprint * (7 / 9),
                    },
                });
            }

            if (held.size > 0) {
                frame = requestAnimationFrame(loop);
            } else {
                last = 0;
            }
        };

        const start = () => {
            if (frame === null) {
                last = 0;
                frame = requestAnimationFrame(loop);
            }
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.metaKey || event.ctrlKey || event.altKey) {
                return;
            }
            if (isEditableTarget(event.target)) {
                return;
            }
            const id = codeToID().get(event.code);
            if (!id) {
                return;
            }
            event.preventDefault();
            if (!held.has(id)) {
                held.set(id, true);
                motion.cancel();
                start();
            }
        };

        const onKeyUp = (event: KeyboardEvent) => {
            const id = codeToID().get(event.code);
            if (id) {
                held.delete(id);
            }
        };

        const clearHeld = () => {
            held.clear();
        };

        const onMouseMove = (event: MouseEvent) => {
            if (document.pointerLockElement !== element) {
                return;
            }
            const look = configRef.current.gestures?.flyLookSensitivity ?? 0.15;
            const yaw = event.movementX * look;
            const pitch = -event.movementY * look;
            if (yaw !== 0 || pitch !== 0) {
                batcher.add({ look: { yaw, pitch } });
            }
        };

        const onClick = (event: MouseEvent) => {
            if (isEditableTarget(event.target)) {
                return;
            }
            // Guard cross-document/detached contexts (iframes throw `WrongDocumentError`)
            // and swallow the rejection of the now-Promise-returning API — a denied or
            // unavailable pointer lock must never bubble as an unhandled error.
            if (document.pointerLockElement !== element
                && (element as any).requestPointerLock
                && element.ownerDocument === document
                && element.isConnected
            ) {
                try {
                    const lockResult = (element as any).requestPointerLock();
                    if (lockResult && typeof lockResult.catch === 'function') {
                        lockResult.catch(() => { /* pointer lock denied/unavailable */ });
                    }
                } catch (_error) {
                    /* WrongDocumentError and friends — non-fatal */
                }
            }
        };

        element.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('blur', clearHeld);
        document.addEventListener('mousemove', onMouseMove);
        element.addEventListener('click', onClick);

        return () => {
            if (frame !== null) {
                cancelAnimationFrame(frame);
            }
            batcher.cancel();
            element.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('blur', clearHeld);
            document.removeEventListener('mousemove', onMouseMove);
            element.removeEventListener('click', onClick);
            if (document.pointerLockElement === element && document.exitPointerLock) {
                document.exitPointerLock();
            }
        };
    }, [
        firstPerson,
    ]);
}
// #endregion module



// #region exports
export default useFlyControls;
// #endregion exports
