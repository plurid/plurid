import {
    Theme,
} from '@plurid/plurid-themes';

import * as Types from './types';



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
