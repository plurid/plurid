import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    defaultShortcuts,
} from '../../../data/constants/shortcuts';

import {
    SHORTCUTS,
} from '../../../data/enumerations';

import actions from '../../state/actions';

import { getWheelDirection } from '@plurid/plurid-engine';



export const handleGlobalShortcuts = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    event: KeyboardEvent,
) => {
    console.log(event);
    console.log(event.key);
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

    if (event.metaKey || event.ctrlKey) {
        const deltas = {
            deltaX: event.deltaX,
            deltaY: event.deltaY,
        }
        const direction = getWheelDirection(deltas);
        console.log(direction);

        if (direction === 'down') {
            dispatch(actions.space.scaleUp());
        }

        if (direction === 'up') {
            dispatch(actions.space.scaleDown());
        }
    }
}
