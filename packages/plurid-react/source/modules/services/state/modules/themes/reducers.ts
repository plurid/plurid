import themes from '@plurid/plurid-themes';

import {
    SET_GENERAL_THEME,
    SET_INTERACTION_THEME,

    ThemesState,
    ThemesActionsType,
} from './types';

import {
    setGeneralTheme,
    setInteractionTheme,
} from './resolvers';



const initialState: ThemesState = {
    general: themes.plurid,
    interaction: themes.plurid,
};

const themesReducer = (
    state: ThemesState = initialState,
    action: ThemesActionsType,
): ThemesState => {
    switch(action.type) {
        case SET_GENERAL_THEME:
            return setGeneralTheme(state, action);
        case SET_INTERACTION_THEME:
            return setInteractionTheme(state, action);
        default:
            return {
                ...state,
            };
    }
}


export default themesReducer;
