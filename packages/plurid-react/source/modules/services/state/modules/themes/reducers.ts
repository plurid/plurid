import themes from '@plurid/plurid-themes';

import {
    SET_GENERAL_THEME,
    SET_INTERACTION_THEME,

    ThemesState,
    ThemesActionsType,
} from './types';



const initialState: ThemesState = {
    general: themes.plurid,
    interaction: themes.plurid,
}

const themesReducer = (
    state: ThemesState = initialState,
    action: ThemesActionsType,
): ThemesState => {
    switch(action.type) {
        case SET_GENERAL_THEME:
            return {
                ...state,
                general: {
                    ...action.payload,
                },
            };
        case SET_INTERACTION_THEME:
            return {
                ...state,
                interaction: {
                    ...action.payload,
                },
            };
        default:
            return {
                ...state,
            };
    }
}


export default themesReducer;
