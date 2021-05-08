// #region imports
    // #region external
    import * as Types from '../types';

    import initialState from '../initial';

    import * as resolvers from '../resolvers';

    import {
        SET_STATE,
    } from '~services/state/global';
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
                ...action.payload.shortcuts,
            };
        case Types.SHORTCUTS_SET_GLOBAL_SHORTCUTS:
            return resolvers.setGlobalShortcuts(state);
        case Types.SHORTCUTS_UNSET_GLOBAL_SHORTCUTS:
            return resolvers.unsetGlobalShortcuts(state);
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
