import * as Types from './types';



export const setGlobalShortcuts = (
): Types.ShortcutsSetGlobalShortcutsAction => {
    return {
        type: Types.SHORTCUTS_SET_GLOBAL_SHORTCUTS,
    };
}


export const unsetGlobalShortcuts = (
): Types.ShortcutsUnsetGlobalShortcutsAction => {
    return {
        type: Types.SHORTCUTS_UNSET_GLOBAL_SHORTCUTS,
    };
}
