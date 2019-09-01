import {
    SET_PAGES,
    SetPagesAction,
    SET_DOCUMENTS,
    SetDocumentsAction,
} from './types'



export const setPages = (payload: any): SetPagesAction => {
    return {
        type: SET_PAGES,
        payload,
    };
}


export const setDocuments = (payload: any): SetDocumentsAction => {
    return {
        type: SET_DOCUMENTS,
        payload,
    };
}
