// #region imports
    // #region external
    import * as Types from '../types';

    import initialState from '../initial';

    import * as resolvers from '../resolvers';

    import {
        SET_STATE,
    } from '~services/state/modules/global';
    // #endregion external
// #endregion imports



// #region module
const reducer = (
    state: Types.State = initialState,
    action: Types.Actions,
): Types.State => {
    switch(action.type) {
        case SET_STATE:
            return {
                ...state,
                ...action.payload.themes,
            };
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
// #endregion module



// #region exports
export default reducer;
// #endregion exports
