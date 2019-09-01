import {
    SET_PAGES,
    SET_DOCUMENTS,
    SET_VIEW_SIZE,
    DataState,
    DataActionsType,
} from './types';



const initialState: DataState = {
    pages: [],
    documents: [],
    viewSize: {
        height: window.innerHeight,
        width: window.innerWidth,
    },
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
        case SET_VIEW_SIZE:
            return { ...state, viewSize: action.payload };
        default:
            return state;
    }
}


export default pagesReducer;
