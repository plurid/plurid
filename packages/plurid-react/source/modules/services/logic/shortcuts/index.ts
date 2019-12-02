import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import actions from '../../state/actions';

import {
    getWheelDirection,
} from '@plurid/plurid-engine';



export const handleGlobalShortcuts = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    event: KeyboardEvent,
    firstPerson: boolean,
) => {
    const noModifiers = !event.shiftKey
        && !event.altKey
        && !event.ctrlKey
        && !event.metaKey;


    if (
        event.code === 'KeyF'
        && noModifiers
    ) {
        return dispatch(actions.space.toggleFirstPerson());
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
        return dispatch(actions.space.toggleRotationLocked());
    }

    if (
        event.code === 'KeyT'
        && noModifiers
    ) {
        return dispatch(actions.space.toggleTranslationLocked());
    }

    if (
        event.code === 'KeyS'
        && noModifiers
    ) {
        return dispatch(actions.space.toggleScaleLocked());
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


interface Locks {
    rotation: boolean;
    translation: boolean;
    scale: boolean;
}

export const handleGlobalWheel = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    event: WheelEvent,
    locks: Locks,
) => {
    if (event.shiftKey
        || event.metaKey
        || event.altKey
        || event.ctrlKey
        || locks.rotation
        || locks.translation
        || locks.scale
    ) {
        event.preventDefault();
    }

    const deltas = {
        deltaX: event.deltaX,
        deltaY: event.deltaY,
    }
    const direction = getWheelDirection(deltas);

    if (locks.rotation) {
        if (direction === 'left') {
            dispatch(actions.space.rotateLeft());
        }

        if (direction === 'right') {
            dispatch(actions.space.rotateRight());
        }
    }

    if (event.shiftKey && !event.altKey) {
        if (direction === 'up') {
            dispatch(actions.space.rotateUp());
        }

        if (direction === 'down') {
            dispatch(actions.space.rotateDown());
        }

        if (direction === 'left') {
            dispatch(actions.space.rotateLeft());
        }

        if (direction === 'right') {
            dispatch(actions.space.rotateRight());
        }
    }

    if (locks.translation) {
        if (direction === 'up') {
            dispatch(actions.space.translateDown());
        }

        if (direction === 'down') {
            dispatch(actions.space.translateUp());
        }

        if (direction === 'left') {
            dispatch(actions.space.translateRight());
        }

        if (direction === 'right') {
            dispatch(actions.space.translateLeft());
        }
    }

    if (event.altKey && event.shiftKey) {
        if (direction === 'up') {
            dispatch(actions.space.translateIn());
        }

        if (direction === 'down') {
            dispatch(actions.space.translateOut());
        }
    }

    if (event.altKey && !event.shiftKey) {
        if (direction === 'up') {
            dispatch(actions.space.translateDown());
        }

        if (direction === 'down') {
            dispatch(actions.space.translateUp());
        }

        if (direction === 'left') {
            dispatch(actions.space.translateRight());
        }

        if (direction === 'right') {
            dispatch(actions.space.translateLeft());
        }
    }

    if (locks.scale) {
        if (direction === 'down') {
            dispatch(actions.space.scaleUp());
        }

        if (direction === 'up') {
            dispatch(actions.space.scaleDown());
        }
    }

    if (event.metaKey || event.ctrlKey) {
        if (direction === 'down') {
            dispatch(actions.space.scaleUp());
        }

        if (direction === 'up') {
            dispatch(actions.space.scaleDown());
        }
    }
}
