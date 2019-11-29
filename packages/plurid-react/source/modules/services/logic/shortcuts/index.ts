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
