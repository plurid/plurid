// #region imports
    // #region external
    import * as Types from '../types';
    // #endregion external
// #endregion imports



// #region module
export const setGeneralTheme = (
    state: Types.State,
    action: Types.ThemesSetGeneralThemeAction,
): Types.State => {
    return {
        ...state,
        general: {
            ...action.payload,
        },
    };
}


export const setInteractionTheme = (
    state: Types.State,
    action: Types.ThemesSetInteractionThemeAction,
): Types.State => {
    return {
        ...state,
        interaction: {
            ...action.payload,
        },
    };
}
// #endregion module
