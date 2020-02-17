import * as Types from './types';



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
