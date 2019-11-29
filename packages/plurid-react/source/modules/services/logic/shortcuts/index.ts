import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    defaultShortcuts,
    SHORTCUTS,
} from '@plurid/plurid-data';

import actions from '../../state/actions';

import {
    getWheelDirection,
} from '@plurid/plurid-engine';



export const handleGlobalShortcuts = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    event: KeyboardEvent,
) => {
    const noModifiers = !event.shiftKey
        && !event.altKey
        && !event.ctrlKey
        && !event.metaKey;



    if (
        event.code === 'KeyW'
        && noModifiers
    ) {
        console.log('move forward');
        dispatch(actions.space.viewCameraMoveForward());
    }

    if (
        event.code === 'KeyS'
        && noModifiers
    ) {
        console.log('move backward');
        dispatch(actions.space.viewCameraMoveBackward());
    }


    if (
        event.code === 'KeyA'
        && noModifiers
    ) {
        console.log('move left');
        dispatch(actions.space.viewCameraMoveLeft());
    }

    if (
        event.code === 'KeyA'
        && event.shiftKey
    ) {
        console.log('turn left');
        dispatch(actions.space.viewCameraTurnLeft());
    }


    if (
        event.code === 'KeyD'
        && noModifiers
    ) {
        console.log('move right');
        dispatch(actions.space.viewCameraMoveRight());
    }

    if (
        event.code === 'KeyD'
        && event.shiftKey
    ) {
        console.log('turn right');
        dispatch(actions.space.viewCameraTurnRight());
    }


    if (
        event.code === 'KeyQ'
        && noModifiers
    ) {
        console.log('turn up');
        dispatch(actions.space.viewCameraTurnUp());
    }

    if (
        event.code === 'KeyZ'
        && noModifiers
    ) {
        console.log('turn down');
        dispatch(actions.space.viewCameraTurnDown());
    }


    if (
        event.code === 'KeyE'
        && noModifiers
    ) {
        console.log('move up');
        dispatch(actions.space.viewCameraMoveUp());
    }

    if (
        event.code === 'KeyC'
        && noModifiers
    ) {
        console.log('move down');
        dispatch(actions.space.viewCameraMoveDown());
    }


    if (
        event.code === 'KeyR'
        && noModifiers
    ) {
        dispatch(actions.space.toggleRotationLocked());
    }

    if (
        event.code === 'KeyT'
        && noModifiers
    ) {
        dispatch(actions.space.toggleTranslationLocked());
    }

    if (
        event.code === 'KeyS'
        && noModifiers
    ) {
        dispatch(actions.space.toggleScaleLocked());
    }

    if (event.key === 'ArrowRight') {
        if (event.shiftKey) {
            dispatch(actions.space.rotateLeft());
        }
        if (event.altKey) {
            dispatch(actions.space.translateRight());
        }
    }

    if (event.key === 'ArrowLeft') {
        if (event.shiftKey) {
            dispatch(actions.space.rotateRight());
        }
        if (event.altKey) {
            dispatch(actions.space.translateLeft());
        }
    }

    if (event.key === 'ArrowUp') {
        if (event.shiftKey) {
            dispatch(actions.space.rotateUp());
        }
        if (event.altKey) {
            dispatch(actions.space.translateUp());
        }
        if (event.metaKey || event.ctrlKey) {
            dispatch(actions.space.scaleUp());
        }
    }

    if (event.key === 'ArrowDown') {
        if (event.shiftKey) {
            dispatch(actions.space.rotateDown());
        }
        if (event.altKey) {
            dispatch(actions.space.translateDown());
        }
        if (event.metaKey || event.ctrlKey) {
            dispatch(actions.space.scaleDown());
        }
    }
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

    if (event.shiftKey) {
        // if (direction === 'up') {
        //     dispatch(actions.space.rotateUp());
        // }

        // if (direction === 'down') {
        //     dispatch(actions.space.rotateDown());
        // }

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

    if (event.altKey) {
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
