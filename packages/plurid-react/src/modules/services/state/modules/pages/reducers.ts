import {
    SET_PAGES,
    PagesState,
    PagesActionsType,
} from './types';



const initialState: PagesState = {
    pages: [],
}

const pagesReducer = (
    state: PagesState = initialState,
    action: PagesActionsType,
): PagesState => {
    switch(action.type) {
        case SET_PAGES:
            return { ...state, pages: action.payload };
        default:
            return state;
    }
}


export default pagesReducer;
