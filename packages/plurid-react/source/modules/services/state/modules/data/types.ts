import {
    PluridPage,
    PluridDocument,
} from '@plurid/plurid-data';



export const SET_PAGES = 'SET_PAGES';

export interface SetPagesAction {
    type: typeof SET_PAGES;
    payload: PluridPage[];
}


export const SET_DOCUMENTS = 'SET_DOCUMENTS';

export interface SetDocumentsAction {
    type: typeof SET_DOCUMENTS;
    payload: PluridDocument[];
}


export const SET_VIEW_SIZE = 'SET_VIEW_SIZE';

export interface ViewSize {
    width: number;
    height: number;
}

export interface SetViewSizeAction {
    type: typeof SET_VIEW_SIZE;
    payload: ViewSize;
}


export interface DataState {
    pages: any[];
    documents: any[];
    viewSize: ViewSize;
}


export type DataActionsType = SetPagesAction
    | SetDocumentsAction
    | SetViewSizeAction;
