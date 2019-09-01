export const SET_PAGES = 'SET_PAGES';

export interface SetPagesAction {
    type: typeof SET_PAGES;
    payload: any;
}


export const SET_DOCUMENTS = 'SET_DOCUMENTS';

export interface SetDocumentsAction {
    type: typeof SET_DOCUMENTS;
    payload: any;
}


export interface DataState {
    pages: any[];
    documents: any[];
}


export type DataActionsType = SetPagesAction
    | SetDocumentsAction;
