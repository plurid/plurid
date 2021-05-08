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
                ...action.payload.ui,
            };
        case Types.SET_UI_TOOLBAR_SCROLL_POSITION:
            return resolvers.setUIToolbarScrollPosition(state, action);
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
