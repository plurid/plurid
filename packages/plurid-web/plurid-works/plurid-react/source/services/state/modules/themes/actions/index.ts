// #region imports
    // #region libraries
    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import * as Types from '../types';
    // #endregion external
// #endregion imports



// #region module
export const setGeneralTheme = (
    theme: Theme,
): Types.ThemesSetGeneralThemeAction => {
    return {
        type: Types.THEMES_SET_GENERAL_THEME,
        payload: theme,
    };
}


export const setInteractionTheme = (
    theme: Theme,
): Types.ThemesSetInteractionThemeAction => {
    return {
        type: Types.THEMES_SET_INTERACTION_THEME,
        payload: theme,
    };
}
// #endregion module
