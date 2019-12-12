import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    TRANSFORM_MODES,

    PluridConfigurationSpaceTransformLocks,
} from '@plurid/plurid-data';

import {
    getWheelDirection,
} from '@plurid/plurid-engine';

import actions from '../../state/actions';



export const handleGlobalShortcuts = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    event: KeyboardEvent,
    firstPerson: boolean,
) => {
    const inputOnPath = verifyPathforInputElement((event as any).path);
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
        ) {
            return dispatch(actions.space.viewCameraMoveForward());
        }

        if (
            event.code === 'KeyS'
            && noModifiers
        ) {
            return dispatch(actions.space.viewCameraMoveBackward());
        }


        if (
            event.code === 'KeyA'
            && noModifiers
        ) {
            return dispatch(actions.space.viewCameraMoveLeft());
        }

        if (
            event.code === 'KeyA'
            && event.shiftKey
        ) {
            return dispatch(actions.space.viewCameraTurnLeft());
        }


        if (
            event.code === 'KeyD'
            && noModifiers
        ) {
            return dispatch(actions.space.viewCameraMoveRight());
        }

        if (
            event.code === 'KeyD'
            && event.shiftKey
        ) {
            return dispatch(actions.space.viewCameraTurnRight());
        }


        if (
            event.code === 'KeyQ'
            && noModifiers
        ) {
            return dispatch(actions.space.viewCameraTurnUp());
        }

        if (
            event.code === 'KeyZ'
            && noModifiers
        ) {
            return dispatch(actions.space.viewCameraTurnDown());
        }


        if (
            event.code === 'KeyE'
            && noModifiers
        ) {
            return dispatch(actions.space.viewCameraMoveUp());
        }

        if (
            event.code === 'KeyC'
            && noModifiers
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
    ) {
        return dispatch(
            actions.configuration.setConfigurationSpaceTransformMode(
                TRANSFORM_MODES.SCALE,
            ),
        );
    }


    if (event.key === 'ArrowRight') {
        if (event.shiftKey) {
            return dispatch(actions.space.rotateLeft());
        }
        if (event.altKey) {
            return dispatch(actions.space.translateRight());
        }
    }

    if (event.key === 'ArrowLeft') {
        if (event.shiftKey) {
            return dispatch(actions.space.rotateRight());
        }
        if (event.altKey) {
            return dispatch(actions.space.translateLeft());
        }
    }

    if (event.key === 'ArrowUp') {
        if (event.shiftKey && event.altKey) {
            return dispatch(actions.space.translateIn());
        }
        if (event.shiftKey && !event.altKey) {
            return dispatch(actions.space.rotateUp());
        }
        if (event.altKey && !event.shiftKey) {
            return dispatch(actions.space.translateUp());
        }
        if (event.metaKey || event.ctrlKey) {
            return dispatch(actions.space.scaleUp());
        }
    }

    if (event.key === 'ArrowDown') {
        if (event.shiftKey && event.altKey) {
            return dispatch(actions.space.translateOut());
        }
        if (event.shiftKey && !event.altKey) {
            return dispatch(actions.space.rotateDown());
        }
        if (event.altKey && !event.shiftKey) {
            return dispatch(actions.space.translateDown());
        }
        if (event.metaKey || event.ctrlKey) {
            return dispatch(actions.space.scaleDown());
        }
    }

    return;
}


interface Modes {
    rotation: boolean;
    translation: boolean;
    scale: boolean;
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
    }
    const direction = getWheelDirection(deltas);

    if (modes.rotation) {
        if (direction === 'left' && locks.rotationY) {
            dispatch(actions.space.rotateLeft());
        }

        if (direction === 'right' && locks.rotationY) {
            dispatch(actions.space.rotateRight());
        }

        if (direction === 'up' && locks.rotationX) {
            dispatch(actions.space.rotateUp());
        }

        if (direction === 'down' && locks.rotationX) {
            dispatch(actions.space.rotateDown());
        }
    }

    if (event.shiftKey && !event.altKey) {
        if (direction === 'up' && locks.rotationX) {
            dispatch(actions.space.rotateUp());
        }

        if (direction === 'down' && locks.rotationX) {
            dispatch(actions.space.rotateDown());
        }

        if (direction === 'left' && locks.rotationY) {
            dispatch(actions.space.rotateLeft());
        }

        if (direction === 'right' && locks.rotationY) {
            dispatch(actions.space.rotateRight());
        }
    }

    if (modes.translation) {
        if (direction === 'up' && locks.translationY) {
            dispatch(actions.space.translateDown());
        }

        if (direction === 'down' && locks.translationY) {
            dispatch(actions.space.translateUp());
        }

        if (direction === 'left' && locks.translationX) {
            dispatch(actions.space.translateRight());
        }

        if (direction === 'right' && locks.translationX) {
            dispatch(actions.space.translateLeft());
        }
    }

    if (event.altKey && event.shiftKey) {
        if (direction === 'up' && locks.translationZ) {
            dispatch(actions.space.translateIn());
        }

        if (direction === 'down' && locks.translationZ) {
            dispatch(actions.space.translateOut());
        }
    }

    if (event.altKey && !event.shiftKey) {
        if (direction === 'up' && locks.translationY) {
            dispatch(actions.space.translateDown());
        }

        if (direction === 'down' && locks.translationY) {
            dispatch(actions.space.translateUp());
        }

        if (direction === 'left' && locks.translationX) {
            dispatch(actions.space.translateRight());
        }

        if (direction === 'right' && locks.translationX) {
            dispatch(actions.space.translateLeft());
        }
    }

    if (modes.scale) {
        if (direction === 'down' && locks.scale) {
            dispatch(actions.space.scaleUp());
        }

        if (direction === 'up' && locks.scale) {
            dispatch(actions.space.scaleDown());
        }
    }

    if (event.metaKey || event.ctrlKey) {
        if (direction === 'down' && locks.scale) {
            dispatch(actions.space.scaleUp());
        }

        if (direction === 'up' && locks.scale) {
            dispatch(actions.space.scaleDown());
        }
    }
}



const verifyPathforInputElement = (
    path: any[],
) => {
    let input = false;

    path.some(element => {
        if (
            element.tagName === 'INPUT'
            || element.tagName === 'TEXTAREA'
            || element.contentEditable === 'true'
        ) {
            input = true;
            return true;
        }
        return false;
    })

    return input;
}
