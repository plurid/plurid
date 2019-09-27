import { Theme } from '@plurid/utilities.themes';

import {
    SET_GENERAL_THEME,
    SetGeneralThemeAction,
    SET_INTERACTION_THEME,
    SetInteractionThemeAction,
} from './types';



export const setGeneralTheme = (theme: Theme): SetGeneralThemeAction => {
    return {
        type: SET_GENERAL_THEME,
        payload: theme,
    };
}


export const setInteractionTheme = (theme: Theme): SetInteractionThemeAction => {
    return {
        type: SET_INTERACTION_THEME,
        payload: theme,
    };
}
