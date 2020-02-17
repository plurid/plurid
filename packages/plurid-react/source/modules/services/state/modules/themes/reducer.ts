import * as Types from './types';

import initialState from './initial';

import * as resolvers from './resolvers';



const reducer = (
    state: Types.State = initialState,
    action: Types.Actions,
): Types.State => {
    switch(action.type) {
        case Types.THEMES_SET_GENERAL_THEME:
            return resolvers.setGeneralTheme(state, action);
        case Types.THEMES_SET_INTERACTION_THEME:
            return resolvers.setInteractionTheme(state, action);
        default:
            return {
                ...state,
            };
    }
}


export default reducer;
