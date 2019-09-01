export const SET_PAGES = 'SET_PAGES';

export interface SetPagesAction {
    type: typeof SET_PAGES;
    payload: any;
}


export interface PagesState {
    pages: any[];
}


export type PagesActionsType = SetPagesAction;
