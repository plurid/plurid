import {
    Indexed,
    PluridInternalStateDocument,
} from '@plurid/plurid-data';

import {
    SET_DOCUMENTS,
    SetDocumentsAction,
} from './types';



export const setDocuments = (
    payload: Indexed<PluridInternalStateDocument>,
): SetDocumentsAction => {
    return {
        type: SET_DOCUMENTS,
        payload,
    };
}
