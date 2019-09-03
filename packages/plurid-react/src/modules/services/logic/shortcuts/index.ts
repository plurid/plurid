import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    defaultShortcuts,
} from '../../../data/constants/shortcuts';

import {
    SHORTCUTS,
} from '../../../data/enumerations';

import actions from '../../state/actions';



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
    event: MouseEvent,
) => {
    console.log(document.activeElement);
    console.log(event);

    if (event.shiftKey
        || event.metaKey
        || event.altKey
        || event.ctrlKey
    ) {
        event.preventDefault();
    }
}
