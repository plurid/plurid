// #region imports
    // #region external
    import * as Types from '../types';
    // #endregion external
// #endregion imports



// #region module
export const setUIToolbarScrollPosition = (
    value: number,
): Types.SetUIToolbarScrollPositionAction => {
    return {
        type: Types.SET_UI_TOOLBAR_SCROLL_POSITION,
        payload: value,
    };
}
// #endregion module
