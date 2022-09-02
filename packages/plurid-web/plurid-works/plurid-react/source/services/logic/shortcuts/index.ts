// #region imports
    // #region libraries
    import { AnyAction } from '@reduxjs/toolkit';
    import { ThunkDispatch } from 'redux-thunk';


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


    // #region transform
    if (
        event.code === 'KeyF'
        && noModifiers
    ) {
        handleEvent();
        return dispatch(actions.configuration.toggleConfigurationSpaceFirstPerson());
    }

    if (firstPerson) {
        if (
            event.code === 'KeyW'
            && noModifiers
            && locks.translationZ
        ) {
            handleEvent();
            return dispatch(actions.space.viewCameraMoveForward());
        }

        if (
            event.code === 'KeyS'
            && noModifiers
            && locks.translationZ
        ) {
            handleEvent();
            return dispatch(actions.space.viewCameraMoveBackward());
        }


        if (
            event.code === 'KeyA'
            && noModifiers
            && locks.translationX
        ) {
            handleEvent();
            return dispatch(actions.space.viewCameraMoveLeft());
        }

        if (
            event.code === 'KeyA'
            && event.shiftKey
            && locks.rotationY
        ) {
            handleEvent();
            return dispatch(actions.space.viewCameraTurnLeft());
        }


        if (
            event.code === 'KeyD'
            && noModifiers
            && locks.translationX
        ) {
            handleEvent();
            return dispatch(actions.space.viewCameraMoveRight());
        }

        if (
            event.code === 'KeyD'
            && event.shiftKey
            && locks.rotationY
        ) {
            handleEvent();
            return dispatch(actions.space.viewCameraTurnRight());
        }


        if (
            event.code === 'KeyQ'
            && noModifiers
            && locks.rotationX
        ) {
            handleEvent();
            return dispatch(actions.space.viewCameraTurnUp());
        }

        if (
            event.code === 'KeyZ'
            && noModifiers
            && locks.rotationX
        ) {
            handleEvent();
            return dispatch(actions.space.viewCameraTurnDown());
        }


        if (
            event.code === 'KeyE'
            && noModifiers
            && locks.translationY
        ) {
            handleEvent();
            return dispatch(actions.space.viewCameraMoveUp());
        }

        if (
            event.code === 'KeyC'
            && noModifiers
            && locks.translationY
        ) {
            handleEvent();
            return dispatch(actions.space.viewCameraMoveDown());
        }
    }


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
        if (event.metaKey || event.ctrlKey && locks.scale) {
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
        if (event.metaKey || event.ctrlKey && locks.scale) {
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



export const handleGlobalWheel = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    event: WheelEvent,
    modes: TransformModes,
    locks: PluridConfigurationSpaceTransformLocks,
) => {
    if (event.shiftKey
        || event.metaKey
        || event.altKey
        || event.ctrlKey
        || modes.rotation
        || modes.translation
        || modes.scale
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

    if (modes.scale) {
        if (direction === directions.down && locks.scale) {
            return dispatch(actions.space.scaleUp());
        }

        if (direction === directions.up && locks.scale) {
            return dispatch(actions.space.scaleDown());
        }
    }

    if (event.metaKey || event.ctrlKey) {
        if (direction === directions.down && locks.scale) {
            return dispatch(actions.space.scaleUp());
        }

        if (direction === directions.up && locks.scale) {
            return dispatch(actions.space.scaleDown());
        }
    }

    return;
}
// #endregion module
