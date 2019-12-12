import {
    SET_DOCUMENTS,

    DataState,
    DataActionsType,
} from './types';



const initialState: DataState = {
    documents: {},
};

const dataReducer = (
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
        default:
            return {
                ...state,
            };
    }
}


export default dataReducer;
