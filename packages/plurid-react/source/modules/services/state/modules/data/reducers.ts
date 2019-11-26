import {
    SET_DOCUMENTS,
    SET_VIEW_SIZE,

    DataState,
    DataActionsType,
} from './types';



const initialState: DataState = {
    documents: {},
    viewSize: {
        height: window ? window.innerHeight : 800,
        width: window ? window.innerWidth : 1440,
    },
};

const pagesReducer = (
    state: DataState = initialState,
    action: DataActionsType,
): DataState => {
    switch(action.type) {
        case SET_DOCUMENTS:
            return {
                ...state,
                documents: {
                    ...action.payload,
                },
            };
        case SET_VIEW_SIZE:
            return {
                ...state,
                viewSize: action.payload,
            };
        default:
            return {
                ...state,
            };
    }
}


export default pagesReducer;
