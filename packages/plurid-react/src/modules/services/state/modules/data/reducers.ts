import {
    SET_PAGES,
    SET_DOCUMENTS,
    DataState,
    DataActionsType,
} from './types';



const initialState: DataState = {
    pages: [],
    documents: [],
}

const pagesReducer = (
    state: DataState = initialState,
    action: DataActionsType,
): DataState => {
    switch(action.type) {
        case SET_PAGES:
            return { ...state, pages: action.payload };
        case SET_DOCUMENTS:
            return { ...state, documents: action.payload };
        default:
            return state;
    }
}


export default pagesReducer;
