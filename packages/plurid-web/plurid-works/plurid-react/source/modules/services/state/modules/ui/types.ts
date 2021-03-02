export const SET_UI_TOOLBAR_SCROLL_POSITION = 'SET_UI_TOOLBAR_SCROLL_POSITION';
export interface SetUIToolbarScrollPositionAction {
    type: typeof SET_UI_TOOLBAR_SCROLL_POSITION;
    payload: number;
}



export interface State {
    toolbarScrollPosition: number;
}


export type Actions = SetUIToolbarScrollPositionAction;
