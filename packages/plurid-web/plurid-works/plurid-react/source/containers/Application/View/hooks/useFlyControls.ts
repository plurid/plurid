// #region imports
    // #region libraries
    import React, {
        useEffect,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    // #endregion libraries


    // #region external
    import actions from '~services/state/actions';
    // #endregion external
// #endregion imports



// #region module
export interface UseFlyControlsParameters {
    viewElement: React.RefObject<HTMLDivElement>;
    firstPerson: boolean;
    /** `space.gestures.flySpeed` — planar move speed, px/frame. Default 9. */
    flySpeed?: number;
    /** `space.gestures.flyLookSensitivity` — pointer-locked mouse-look, deg/px. Default 0.12. */
    flyLook?: number;
    dispatch: ThunkDispatch<{}, {}, AnyAction>;
}


/**
 * First-person "fly" controls, active only in `firstPerson` mode. Continuous, frame-rate-independent
 * movement from held keys (WASD = move, E/Space = up, Q/Shift = down) via a `requestAnimationFrame`
 * loop, plus mouse-look: click the view to lock the pointer and steer with the mouse (Esc releases).
 * (Drag-to-look while NOT pointer-locked is handled in the pointer-gesture hook, not here.)
 */
export const useFlyControls = (
    {
        viewElement,
        firstPerson,
        flySpeed,
        flyLook,
        dispatch,
    }: UseFlyControlsParameters,
) => {
    useEffect(() => {
        const element = viewElement.current;
        if (!element || typeof window === 'undefined') {
            return;
        }
        if (!firstPerson) {
            return;
        }

        const FLY_SPEED = flySpeed ?? 9;            // px per frame (planar)
        const FLY_VERTICAL = (flySpeed ?? 9) * (7 / 9); // up/down scales with planar speed (default 7)
        const FLY_LOOK = flyLook ?? 0.12;           // deg per px (locked mouse-look)
        const FLY_KEYS = new Set([
            'KeyW', 'KeyA', 'KeyS', 'KeyD',
            'KeyE', 'KeyQ', 'Space', 'ShiftLeft',
        ]);

        const held = new Set<string>();
        let frame: number | null = null;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.metaKey || event.ctrlKey || event.altKey) {
                return;
            }
            if (FLY_KEYS.has(event.code)) {
                held.add(event.code);
                event.preventDefault();
            }
        };
        const onKeyUp = (event: KeyboardEvent) => {
            held.delete(event.code);
        };

        const onMouseMove = (event: MouseEvent) => {
            if (document.pointerLockElement !== element) {
                return;
            }
            const yaw = event.movementX * FLY_LOOK;
            const pitch = -event.movementY * FLY_LOOK;
            if (yaw !== 0 || pitch !== 0) {
                dispatch(actions.space.flyMove({ yaw, pitch }));
            }
        };

        const onClick = () => {
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

        const loop = () => {
            let forward = 0;
            let strafe = 0;
            let vertical = 0;
            if (held.has('KeyW')) { forward += FLY_SPEED; }
            if (held.has('KeyS')) { forward -= FLY_SPEED; }
            if (held.has('KeyA')) { strafe += FLY_SPEED; }
            if (held.has('KeyD')) { strafe -= FLY_SPEED; }
            if (held.has('KeyE') || held.has('Space')) { vertical += FLY_VERTICAL; }
            if (held.has('KeyQ') || held.has('ShiftLeft')) { vertical -= FLY_VERTICAL; }
            if (forward !== 0 || strafe !== 0 || vertical !== 0) {
                dispatch(actions.space.flyMove({ forward, strafe, vertical }));
            }
            frame = requestAnimationFrame(loop);
        };
        frame = requestAnimationFrame(loop);

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        document.addEventListener('mousemove', onMouseMove);
        element.addEventListener('click', onClick);

        return () => {
            if (frame !== null) {
                cancelAnimationFrame(frame);
            }
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            document.removeEventListener('mousemove', onMouseMove);
            element.removeEventListener('click', onClick);
            if (document.pointerLockElement === element && document.exitPointerLock) {
                document.exitPointerLock();
            }
        };
    }, [
        firstPerson,
        viewElement.current,
        flySpeed,
        flyLook,
    ]);
}
// #endregion module



// #region exports
export default useFlyControls;
// #endregion exports
