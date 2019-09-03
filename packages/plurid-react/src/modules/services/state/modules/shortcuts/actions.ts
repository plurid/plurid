import {
    SET_GLOBAL_SHORTCUTS,
    SetGlobalShortcutsAction,
    UNSET_GLOBAL_SHORTCUTS,
    UnsetGlobalShortcutsAction,
} from './types'



export const setGlobalShortcuts = (): SetGlobalShortcutsAction => {
    return {
        type: SET_GLOBAL_SHORTCUTS,
    };
}


export const unsetGlobalShortcuts = (): UnsetGlobalShortcutsAction => {
    return {
        type: UNSET_GLOBAL_SHORTCUTS,
    };
}
