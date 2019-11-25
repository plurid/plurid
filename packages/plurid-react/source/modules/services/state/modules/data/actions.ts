import {
    Indexed,
    PluridPage,
    PluridDocument,
} from '@plurid/plurid-data';

import {
    SET_PAGES,
    SetPagesAction,
    SET_DOCUMENTS,
    SetDocumentsAction,
    SET_VIEW_SIZE,
    SetViewSizeAction,
    ViewSize,
} from './types'



export const setPages = (payload: Indexed<PluridPage>): SetPagesAction => {
    return {
        type: SET_PAGES,
        payload,
    };
}


export const setDocuments = (payload: Indexed<PluridDocument>): SetDocumentsAction => {
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
