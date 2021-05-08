// #region imports
    // #region external
    import * as Types from '../types';
    // #endregion external
// #endregion imports



// #region module
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
// #endregion module
