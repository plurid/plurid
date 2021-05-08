// #region imports
    // #region external
    import {
        SetStateAction,
    } from '~services/state/modules/global';
    // #endregion external
// #endregion imports



// #region module
export const SHORTCUTS_SET_GLOBAL_SHORTCUTS = 'SHORTCUTS_SET_GLOBAL_SHORTCUTS';
export interface ShortcutsSetGlobalShortcutsAction {
    type: typeof SHORTCUTS_SET_GLOBAL_SHORTCUTS;
}


export const SHORTCUTS_UNSET_GLOBAL_SHORTCUTS = 'SHORTCUTS_UNSET_GLOBAL_SHORTCUTS';
export interface ShortcutsUnsetGlobalShortcutsAction {
    type: typeof SHORTCUTS_UNSET_GLOBAL_SHORTCUTS;
}



export interface State {
    global: boolean;
}


export type Actions =
    | SetStateAction
    | ShortcutsSetGlobalShortcutsAction
    | ShortcutsUnsetGlobalShortcutsAction;
// #endregion module
