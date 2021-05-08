// #region imports
    // #region external
    import * as Types from '../types';
    // #endregion external
// #endregion imports



// #region module
export const setUIToolbarScrollPosition = (
    state: Types.State,
    action: Types.SetUIToolbarScrollPositionAction,
): Types.State => {
    return {
        ...state,
        toolbarScrollPosition: action.payload,
    };
}
// #endregion module
