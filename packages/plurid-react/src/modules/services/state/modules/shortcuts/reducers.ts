import {
    SET_GLOBAL_SHORTCUTS,
    UNSET_GLOBAL_SHORTCUTS,
} from './types';



const initialState = {
    global: true,
}

const selectedThemeReducer = (state = initialState, action: any) => {
    switch(action.type) {
        case SET_GLOBAL_SHORTCUTS:
            return { ...state, global: true };
        case UNSET_GLOBAL_SHORTCUTS:
            return { ...state, global: false };
        default:
            return state;
    }
}


export default selectedThemeReducer;
