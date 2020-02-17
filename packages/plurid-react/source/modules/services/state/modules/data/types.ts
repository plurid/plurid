import {
    Indexed,
    PluridInternalStateDocument,
} from '@plurid/plurid-data';



export const DATA_SET_DOCUMENTS = 'DATA_SET_DOCUMENTS';
export interface DataSetDocumentsAction {
    type: typeof DATA_SET_DOCUMENTS;
    payload: Indexed<PluridInternalStateDocument>;
}



export interface State {
    documents: Indexed<PluridInternalStateDocument>;
}


export type Actions = DataSetDocumentsAction;
