import {
    Indexed,
    PluridInternalStateDocument,
} from '@plurid/plurid-data';

import {
    SET_DOCUMENTS,
    SetDocumentsAction,
    SET_VIEW_SIZE,
    SetViewSizeAction,
    ViewSize,
} from './types'



export const setDocuments = (payload: Indexed<PluridInternalStateDocument>): SetDocumentsAction => {
    return {
        type: SET_DOCUMENTS,
        payload,
    };
}


export const setViewSize = (payload: ViewSize): SetViewSizeAction => {
    return {
        type: SET_VIEW_SIZE,
        payload,
    };
}
