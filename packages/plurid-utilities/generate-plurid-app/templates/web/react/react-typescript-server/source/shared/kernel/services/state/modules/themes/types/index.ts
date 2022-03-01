// #region imports
    // #region libraries
    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export const SET_GENERAL_THEME = 'SET_GENERAL_THEME';
export interface SetGeneralThemeAction {
    type: typeof SET_GENERAL_THEME;
    payload: Theme;
}


export const SET_INTERACTION_THEME = 'SET_INTERACTION_THEME';
export interface SetInteractionThemeAction {
    type: typeof SET_INTERACTION_THEME;
    payload: Theme;
}



export interface State {
    general: Theme,
    interaction: Theme,
}


export type Actions =
    | SetGeneralThemeAction
    | SetInteractionThemeAction;
// #endregion module
