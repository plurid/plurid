import * as Types from './types';



export const setGeneralTheme = (
    state: Types.State,
    action: Types.SetGeneralThemeAction,
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
    action: Types.SetInteractionThemeAction,
): Types.State => {
    return {
        ...state,
        interaction: {
            ...action.payload,
        },
    };
}



export const resolvers = {
    setGeneralTheme,
    setInteractionTheme,
};
