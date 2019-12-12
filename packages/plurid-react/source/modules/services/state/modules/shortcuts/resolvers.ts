import {
    ShortcutsState,
} from './types';



export const setGlobalShortcuts = (
    state: ShortcutsState,
) => {
    return {
        ...state,
        global: true,
    };
}


export const unsetGlobalShortcuts = (
    state: ShortcutsState,
) => {
    return {
        ...state,
        global: false,
    };
}
