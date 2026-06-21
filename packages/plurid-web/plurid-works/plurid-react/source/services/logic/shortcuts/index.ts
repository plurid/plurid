// #region imports
    // #region libraries
    import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';


    import {
        dom,
    } from '@plurid/plurid-functions';

    import {
        TRANSFORM_MODES,
        directions,

        PluridConfigurationSpaceTransformLocks,

        PluridPubSub as IPluridPubSub,
        TransformModes,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import actions from '~services/state/actions';

    import {
        focusActivePlane,
        focusParentActivePlane,
        focusPreviousRoot,
        focusNextRoot,
        focusRootIndex,
    } from '~services/logic/animation';

    import {
        interaction,
    } from '~services/engine';
    // #endregion external


    // #region internal
    import {
        refreshActivePlane,
        isolateActivePlane,
        openClosedPlane,
        closeActivePlane,
    } from './logic';
    // #endregion internal
// #endregion imports



// #region module
export const handleGlobalShortcuts = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    state: AppState,
    pubsub: IPluridPubSub,
    event: KeyboardEvent,
    firstPerson: boolean,
    locks: PluridConfigurationSpaceTransformLocks,
) => {
    if (event.defaultPrevented) {
        return;
    }

    const inputOnPath = dom.verifyPathInputElement(
        dom.getEventPath(event),
    );
    if (inputOnPath) {
        return;
    }

    const noModifiers = !event.shiftKey
        && !event.altKey
        && !event.ctrlKey
        && !event.metaKey;

    const handleEvent = () => {
        event.preventDefault();
    }


    // Undo / redo of spatial arrangement (spawn / close / open / relayout): Cmd/Ctrl+Z,
    // Cmd/Ctrl+Shift+Z. The `inputOnPath` guard above already lets an editor keep its own undo.
    if ((event.metaKey || event.ctrlKey) && event.code === 'KeyZ') {
        handleEvent();
        if (event.shiftKey) {
            return dispatch(actions.space.redo());
        }
        return dispatch(actions.space.undo());
    }


    // Fit all planes into view (CAD "frame all"): Home or 0.
    if (
        (event.key === 'Home' || event.code === 'Digit0')
        && noModifiers
    ) {
        handleEvent();
        return dispatch(actions.space.spaceFitToView());
    }


    // #region transform
    if (
        event.code === 'KeyF'
        && noModifiers
    ) {
        handleEvent();
        return dispatch(actions.configuration.toggleConfigurationSpaceFirstPerson());
    }

    // First-person (fly) movement is handled by the continuous rAF loop + mouse-look in
    // the View's '#region effects fly' (smooth, held-key driven) — not discrete keydowns.


    if (
        event.code === 'KeyR'
        && noModifiers
    ) {
        handleEvent();
        return dispatch(
            actions.configuration.setConfigurationSpaceTransformMode(
                TRANSFORM_MODES.ROTATION,
            ),
        );
    }

    if (
        event.code === 'KeyT'
        && noModifiers
    ) {
        handleEvent();
        return dispatch(
            actions.configuration.setConfigurationSpaceTransformMode(
                TRANSFORM_MODES.TRANSLATION,
            ),
        );
    }

    if (
        event.code === 'KeyS'
        && noModifiers
        && !firstPerson
    ) {
        handleEvent();
        return dispatch(
            actions.configuration.setConfigurationSpaceTransformMode(
                TRANSFORM_MODES.SCALE,
            ),
        );
    }


    if (event.key === 'ArrowRight') {
        if (event.shiftKey && locks.rotationY) {
            handleEvent();
            return dispatch(actions.space.rotateLeft());
        }
        if (event.altKey && locks.translationX) {
            handleEvent();
            return dispatch(actions.space.translateRight());
        }
    }

    if (event.key === 'ArrowLeft') {
        if (event.shiftKey && locks.rotationY) {
            handleEvent();
            return dispatch(actions.space.rotateRight());
        }
        if (event.altKey && locks.translationX) {
            handleEvent();
            return dispatch(actions.space.translateLeft());
        }
    }

    if (event.key === 'ArrowUp') {
        if (event.shiftKey && event.altKey && locks.translationZ) {
            handleEvent();
            return dispatch(actions.space.translateIn());
        }
        if (event.shiftKey && !event.altKey && locks.rotationX) {
            handleEvent();
            return dispatch(actions.space.rotateUp());
        }
        if (event.altKey && !event.shiftKey && locks.translationY) {
            handleEvent();
            return dispatch(actions.space.translateUp());
        }
        if ((event.metaKey || event.ctrlKey) && locks.scale) {
            handleEvent();
            return dispatch(actions.space.scaleUp());
        }
    }

    if (event.key === 'ArrowDown') {
        if (event.shiftKey && event.altKey && locks.translationZ) {
            handleEvent();
            return dispatch(actions.space.translateOut());
        }
        if (event.shiftKey && !event.altKey && locks.rotationX) {
            handleEvent();
            return dispatch(actions.space.rotateDown());
        }
        if (event.altKey && !event.shiftKey && locks.translationY) {
            handleEvent();
            return dispatch(actions.space.translateDown());
        }
        if ((event.metaKey || event.ctrlKey) && locks.scale) {
            handleEvent();
            return dispatch(actions.space.scaleDown());
        }
    }
    // #endregion transform


    // #region plane
    if (event.altKey && event.code === 'KeyF') {
        handleEvent();
        focusActivePlane(
            dispatch,
            state,
        );
        return;
    }

    if (event.altKey && event.code === 'KeyB') {
        handleEvent();
        focusParentActivePlane(
            dispatch,
            state,
        );
        return;
    }

    if (event.altKey && event.code === 'KeyR') {
        handleEvent();
        refreshActivePlane(
            state,
            pubsub,
        );
        return;
    }

    if (event.altKey && event.code === 'KeyE') {
        handleEvent();
        isolateActivePlane(
            state,
            pubsub,
        );
        return;
    }

    if (event.altKey && event.shiftKey && event.code === 'KeyT') {
        handleEvent();
        openClosedPlane(
            pubsub,
        );
        return;
    }

    if (event.altKey && event.code === 'KeyW') {
        handleEvent();
        closeActivePlane(
            state,
            pubsub,
        );
        return;
    }
    // #endregion plane


    // #region focus
    if (event.altKey && event.code === 'KeyA') {
        handleEvent();
        focusPreviousRoot(
            dispatch,
            state,
        );
        return;
    }

    if (event.altKey && event.code === 'KeyD') {
        handleEvent();
        focusNextRoot(
            dispatch,
            state,
        );
        return;
    }

    if (event.altKey && event.code === 'Tab') {
        handleEvent();

        if (event.shiftKey) {
            focusPreviousRoot(
                dispatch,
                state,
            );
        } else {
            focusNextRoot(
                dispatch,
                state,
            );
        }

        return;
    }


    if (event.altKey && event.code.startsWith('Digit')) {
        handleEvent();

        const index = parseInt(event.code.replace('Digit', '')) - 1;

        focusRootIndex(
            dispatch,
            state,
            index,
        );
        return;
    }
    // #endregion focus


    return;
}



// Smooth-zoom tuning: the scale delta is proportional to wheel/trackpad magnitude
// (continuous, CAD-like) instead of a fixed quantized step, clamped so a single
// aggressive notch can't jump across the whole scale range.
const SCALE_WHEEL_SENSITIVITY = 0.0015;
const SCALE_WHEEL_MAX_STEP = 0.2;

export const handleGlobalWheel = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    event: WheelEvent,
    modes: TransformModes,
    locks: PluridConfigurationSpaceTransformLocks,
    grabMode: boolean = false,
) => {
    // The wheel only zooms the space while navigating (grab mode, scale mode, or
    // ⌘/Ctrl+wheel). Otherwise it's left alone so page/plane content scrolls normally.
    const wheelZooms = grabMode;
    if (event.shiftKey
        || event.metaKey
        || event.altKey
        || event.ctrlKey
        || modes.rotation
        || modes.translation
        || modes.scale
        || wheelZooms
    ) {
        event.preventDefault();
    }

    const deltas = {
        deltaX: event.deltaX,
        deltaY: event.deltaY,
    };
    const absoluteThreshold = 100;
    const direction = interaction.direction.getWheelDirection(deltas, absoluteThreshold);

    if (modes.rotation) {
        if (direction === directions.left && locks.rotationY) {
            return dispatch(actions.space.rotateLeft());
        }

        if (direction === directions.right && locks.rotationY) {
            return dispatch(actions.space.rotateRight());
        }

        if (direction === directions.up && locks.rotationX) {
            return dispatch(actions.space.rotateUp());
        }

        if (direction === directions.down && locks.rotationX) {
            return dispatch(actions.space.rotateDown());
        }
    }

    if (event.shiftKey && !event.altKey) {
        if (direction === directions.up && locks.rotationX) {
            return dispatch(actions.space.rotateUp());
        }

        if (direction === directions.down && locks.rotationX) {
            return dispatch(actions.space.rotateDown());
        }

        if (direction === directions.left && locks.rotationY) {
            return dispatch(actions.space.rotateLeft());
        }

        if (direction === directions.right && locks.rotationY) {
            return dispatch(actions.space.rotateRight());
        }
    }

    if (modes.translation) {
        if (event.metaKey || event.ctrlKey) {
            if (direction === directions.up) {
                return dispatch(actions.space.translateDown());
            }

            if (direction === directions.down) {
                return dispatch(actions.space.translateUp());
            }

            return;
        }

        if (event.altKey) {
            if (direction === directions.up && locks.translationZ) {
                return dispatch(actions.space.translateIn());
            }

            if (direction === directions.down && locks.translationZ) {
                return dispatch(actions.space.translateOut());
            }
        }

        if (direction === directions.up && locks.translationY) {
            return dispatch(actions.space.translateDown());
        }

        if (direction === directions.down && locks.translationY) {
            return dispatch(actions.space.translateUp());
        }

        if (direction === directions.left && locks.translationX) {
            return dispatch(actions.space.translateRight());
        }

        if (direction === directions.right && locks.translationX) {
            return dispatch(actions.space.translateLeft());
        }
    }

    if (event.altKey && event.shiftKey) {
        if (direction === directions.up && locks.translationZ) {
            return dispatch(actions.space.translateIn());
        }

        if (direction === directions.down && locks.translationZ) {
            return dispatch(actions.space.translateOut());
        }
    }

    if (event.altKey && !event.shiftKey) {
        if (event.metaKey || event.ctrlKey) {
            if (direction === directions.up) {
                return dispatch(actions.space.translateDown());
            }

            if (direction === directions.down) {
                return dispatch(actions.space.translateUp());
            }

            return;
        }

        if (direction === directions.up && locks.translationY) {
            return dispatch(actions.space.translateDown());
        }

        if (direction === directions.down && locks.translationY) {
            return dispatch(actions.space.translateUp());
        }

        if (direction === directions.left && locks.translationX) {
            return dispatch(actions.space.translateRight());
        }

        if (direction === directions.right && locks.translationX) {
            return dispatch(actions.space.translateLeft());
        }
    }

    // Smooth, proportional zoom toward the cursor. The wheel/trackpad magnitude drives
    // the scale delta directly (continuous, not a quantized fixed step), and ⌘/Ctrl+wheel
    // zooms from any mode — matching trackpad pinch. Convention: wheel up (deltaY < 0) =
    // zoom in. The point under the cursor stays anchored (CAD-standard).
    if (modes.scale || event.metaKey || event.ctrlKey || wheelZooms) {
        if (!locks.scale) {
            return;
        }

        const zoomAmount = Math.min(
            Math.abs(event.deltaY) * SCALE_WHEEL_SENSITIVITY,
            SCALE_WHEEL_MAX_STEP,
        );

        if (zoomAmount === 0) {
            return;
        }

        const deltaScale = event.deltaY < 0 ? zoomAmount : -zoomAmount;

        const target = event.currentTarget as HTMLElement | null;
        const rect = target && target.getBoundingClientRect
            ? target.getBoundingClientRect()
            : null;
        const originX = rect ? event.clientX - rect.left : event.clientX;
        const originY = rect ? event.clientY - rect.top : event.clientY;

        return dispatch(actions.space.zoomAtPoint({
            deltaScale,
            originX,
            originY,
        }));
    }

    return;
}
// #endregion module
