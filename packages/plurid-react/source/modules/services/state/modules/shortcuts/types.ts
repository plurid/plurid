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


export type Actions = ShortcutsSetGlobalShortcutsAction
    | ShortcutsUnsetGlobalShortcutsAction;
