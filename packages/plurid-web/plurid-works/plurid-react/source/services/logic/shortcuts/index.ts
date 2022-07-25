// #region imports
    // #region libraries
    import { AnyAction } from 'redux';
    import { ThunkDispatch } from 'redux-thunk';

    import {
        dom,
    } from '@plurid/plurid-functions';

    import {
        TRANSFORM_MODES,

        PluridConfigurationSpaceTransformLocks,
    } from '@plurid/plurid-data';

    import {
        interaction,
    } from '@plurid/plurid-engine';
    // #endregion libraries


    // #region external
    import actions from '~services/state/actions';
    // #endregion external
// #endregion imports



// #region module
const {
    direction: directionLogic,
} = interaction;


const directions = {
    left: 'left',
    right: 'right',
    up: 'up',
    down: 'down',
};


export interface Modes {
    rotation: boolean;
    translation: boolean;
    scale: boolean;
}


export const handleGlobalShortcuts = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
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

    if (
        event.code === 'KeyF'
        && noModifiers
    ) {
        return dispatch(actions.configuration.toggleConfigurationSpaceFirstPerson());
    }

    if (firstPerson) {
        if (
            event.code === 'KeyW'
            && noModifiers
            && locks.translationZ
        ) {
            return dispatch(actions.space.viewCameraMoveForward());
        }

        if (
            event.code === 'KeyS'
            && noModifiers
            && locks.translationZ
        ) {
            return dispatch(actions.space.viewCameraMoveBackward());
        }


        if (
            event.code === 'KeyA'
            && noModifiers
            && locks.translationX
        ) {
            return dispatch(actions.space.viewCameraMoveLeft());
        }

        if (
            event.code === 'KeyA'
            && event.shiftKey
            && locks.rotationY
        ) {
            return dispatch(actions.space.viewCameraTurnLeft());
        }


        if (
            event.code === 'KeyD'
            && noModifiers
            && locks.translationX
        ) {
            return dispatch(actions.space.viewCameraMoveRight());
        }

        if (
            event.code === 'KeyD'
            && event.shiftKey
            && locks.rotationY
        ) {
            return dispatch(actions.space.viewCameraTurnRight());
        }


        if (
            event.code === 'KeyQ'
            && noModifiers
            && locks.rotationX
        ) {
            return dispatch(actions.space.viewCameraTurnUp());
        }

        if (
            event.code === 'KeyZ'
            && noModifiers
            && locks.rotationX
        ) {
            return dispatch(actions.space.viewCameraTurnDown());
        }


        if (
            event.code === 'KeyE'
            && noModifiers
            && locks.translationY
        ) {
            return dispatch(actions.space.viewCameraMoveUp());
        }

        if (
            event.code === 'KeyC'
            && noModifiers
            && locks.translationY
        ) {
            return dispatch(actions.space.viewCameraMoveDown());
        }
    }


    if (
        event.code === 'KeyR'
        && noModifiers
    ) {
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
        return dispatch(
            actions.configuration.setConfigurationSpaceTransformMode(
                TRANSFORM_MODES.SCALE,
            ),
        );
    }


    if (event.key === 'ArrowRight') {
        if (event.shiftKey && locks.rotationY) {
            return dispatch(actions.space.rotateLeft());
        }
        if (event.altKey && locks.translationX) {
            return dispatch(actions.space.translateRight());
        }
    }

    if (event.key === 'ArrowLeft') {
        if (event.shiftKey && locks.rotationY) {
            return dispatch(actions.space.rotateRight());
        }
        if (event.altKey && locks.translationX) {
            return dispatch(actions.space.translateLeft());
        }
    }

    if (event.key === 'ArrowUp') {
        if (event.shiftKey && event.altKey && locks.translationZ) {
            return dispatch(actions.space.translateIn());
        }
        if (event.shiftKey && !event.altKey && locks.rotationX) {
            return dispatch(actions.space.rotateUp());
        }
        if (event.altKey && !event.shiftKey && locks.translationY) {
            return dispatch(actions.space.translateUp());
        }
        if (event.metaKey || event.ctrlKey && locks.scale) {
            return dispatch(actions.space.scaleUp());
        }
    }

    if (event.key === 'ArrowDown') {
        if (event.shiftKey && event.altKey && locks.translationZ) {
            return dispatch(actions.space.translateOut());
        }
        if (event.shiftKey && !event.altKey && locks.rotationX) {
            return dispatch(actions.space.rotateDown());
        }
        if (event.altKey && !event.shiftKey && locks.translationY) {
            return dispatch(actions.space.translateDown());
        }
        if (event.metaKey || event.ctrlKey && locks.scale) {
            return dispatch(actions.space.scaleDown());
        }
    }

    return;
}



export const handleGlobalWheel = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    event: WheelEvent,
    modes: Modes,
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
    const direction = directionLogic.getWheelDirection(deltas, absoluteThreshold);

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
