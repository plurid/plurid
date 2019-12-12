export const SET_UI_TOOLBAR_SCROLL_POSITION = 'SET_UI_TOOLBAR_SCROLL_POSITION';
export interface SetUIToolbarScrollPositionAction {
    type: typeof SET_UI_TOOLBAR_SCROLL_POSITION;
    payload: number;
}



export interface UIState {
    toolbarScrollPosition: number;
}


export type UIActionsType = SetUIToolbarScrollPositionAction;
