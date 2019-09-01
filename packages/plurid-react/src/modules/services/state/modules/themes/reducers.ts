import themes from '@plurid/apps.utilities.themes';

import {
    SET_GENERAL_THEME,
    SET_INTERACTION_THEME,
} from './types';



const initialState = {
    general: themes.plurid,
    interaction: themes.plurid,
}

const themesReducer = (state = initialState, action: any) => {
    switch(action.type) {
        case SET_GENERAL_THEME:
            return { ...state, general: { ...action.payload } };
        case SET_INTERACTION_THEME:
            return { ...state, interaction: { ...action.payload } };
        default:
            return state;
    }
}


export default themesReducer;
