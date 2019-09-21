import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

// import {
//     defaultShortcuts,
//     SHORTCUTS,
// } from '@plurid/plurid-data';

import actions from '../../state/actions';

import { getWheelDirection } from '@plurid/plurid-engine';



export const handleGlobalShortcuts = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    event: KeyboardEvent,
) => {
    // console.log(event);
    // console.log(event.key);
    // const useShortcuts = shortcuts || defaultShortcuts;
    // useShortcuts.forEach((shortcut: any) => {
    //     if (event.key === shortcut.key && mount) {
    //         handleGlobalShortcut(dispatch, shortcut.type);
    //     }
    // });
}


const handleGlobalShortcut = (dispatch: ThunkDispatch<{}, {}, AnyAction>, shortcutType: any) => {
    // switch(shortcutType) {

    // }
}


export const handleGlobalWheel = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    event: WheelEvent,
) => {
    // console.log(document.activeElement);
    // console.log(event);

    if (event.shiftKey
        || event.metaKey
        || event.altKey
        || event.ctrlKey
    ) {
        event.preventDefault();
    }

    const deltas = {
        deltaX: event.deltaX,
        deltaY: event.deltaY,
    }
    const direction = getWheelDirection(deltas);
    // console.log(direction);

    if (event.shiftKey) {
        if (direction === 'left') {
            dispatch(actions.space.rotateLeft());
        }

        if (direction === 'right') {
            dispatch(actions.space.rotateRight());
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

    if (event.metaKey || event.ctrlKey) {
        if (direction === 'down') {
            dispatch(actions.space.scaleUp());
        }

        if (direction === 'up') {
            dispatch(actions.space.scaleDown());
        }
    }
}
