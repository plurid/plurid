// #region imports
    // #region libraries
    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import * as Types from '../types';
    // #endregion externalr
// #endregion imports



// #region module
export const setGeneralTheme = (
    theme: Theme,
): Types.SetGeneralThemeAction => {
    return {
        type: Types.SET_GENERAL_THEME,
        payload: theme,
    };
}


export const setInteractionTheme = (
    theme: Theme,
): Types.SetInteractionThemeAction => {
    return {
        type: Types.SET_INTERACTION_THEME,
        payload: theme,
    };
}



const actions = {
    setGeneralTheme,
    setInteractionTheme,
};
// #endregion module



// #region exports
export default actions;
// #endregion exports
