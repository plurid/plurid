import {
    Theme,
} from '@plurid/plurid-themes';

import * as Types from './types';



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



export const actions = {
    setGeneralTheme,
    setInteractionTheme,
};
