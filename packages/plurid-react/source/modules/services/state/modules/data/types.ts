import {
    Indexed,
    PluridInternalStateDocument,
} from '@plurid/plurid-data';



export const SET_DOCUMENTS = 'SET_DOCUMENTS';

export interface SetDocumentsAction {
    type: typeof SET_DOCUMENTS;
    payload: Indexed<PluridInternalStateDocument>;
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
    documents: Indexed<PluridInternalStateDocument>;
    viewSize: ViewSize;
}


export type DataActionsType = SetDocumentsAction
    | SetViewSizeAction;
