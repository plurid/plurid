import {
    Indexed,
    PluridInternalStateDocument,
} from '@plurid/plurid-data';

import * as Types from './types';



export const setDocuments = (
    payload: Indexed<PluridInternalStateDocument>,
): Types.DataSetDocumentsAction => {
    return {
        type: Types.DATA_SET_DOCUMENTS,
        payload,
    };
}
