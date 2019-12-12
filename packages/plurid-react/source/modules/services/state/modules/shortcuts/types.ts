export const SET_GLOBAL_SHORTCUTS = 'SET_GLOBAL_SHORTCUTS';
export interface SetGlobalShortcutsAction {
    type: typeof SET_GLOBAL_SHORTCUTS;
}


export const UNSET_GLOBAL_SHORTCUTS = 'UNSET_GLOBAL_SHORTCUTS';
export interface UnsetGlobalShortcutsAction {
    type: typeof UNSET_GLOBAL_SHORTCUTS;
}



export interface ShortcutsState {
    global: boolean;
}


export type ShortcutsActions = SetGlobalShortcutsAction
    | UnsetGlobalShortcutsAction;
