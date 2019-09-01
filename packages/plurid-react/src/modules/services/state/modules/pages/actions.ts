import {
    SET_PAGES,
    SetPagesAction,
} from './types'



export const setPages = (payload: any): SetPagesAction => {
    return {
        type: SET_PAGES,
        payload,
    };
}
