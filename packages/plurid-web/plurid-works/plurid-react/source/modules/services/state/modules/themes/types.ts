import {
    Theme,
} from '@plurid/plurid-themes';



export const THEMES_SET_GENERAL_THEME = 'THEMES_SET_GENERAL_THEME';
export interface ThemesSetGeneralThemeAction {
    type: typeof THEMES_SET_GENERAL_THEME;
    payload: Theme;
}


export const THEMES_SET_INTERACTION_THEME = 'THEMES_SET_INTERACTION_THEME';
export interface ThemesSetInteractionThemeAction {
    type: typeof THEMES_SET_INTERACTION_THEME;
    payload: Theme;
}



export interface State {
    general: Theme;
    interaction: Theme;
}


export type Actions = ThemesSetGeneralThemeAction
    | ThemesSetInteractionThemeAction;
