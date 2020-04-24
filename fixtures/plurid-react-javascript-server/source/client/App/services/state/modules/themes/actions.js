import * as Types from './types';



export const setGeneralTheme = (
    theme,
) => {
    return {
        type: Types.SET_GENERAL_THEME,
        payload: theme,
    };
}


export const setInteractionTheme = (
    theme,
) => {
    return {
        type: Types.SET_INTERACTION_THEME,
        payload: theme,
    };
}



export const actions = {
    setGeneralTheme,
    setInteractionTheme,
};
