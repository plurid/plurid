import {
    Indexed,
    PluridInternalStateDocument,
} from '@plurid/plurid-data';



export const SET_DOCUMENTS = 'SET_DOCUMENTS';
export interface SetDocumentsAction {
    type: typeof SET_DOCUMENTS;
    payload: Indexed<PluridInternalStateDocument>;
}



export interface DataState {
    documents: Indexed<PluridInternalStateDocument>;
}


export type DataActionsType = SetDocumentsAction;
