import {
    ThemesState,

    SetGeneralThemeAction,
    SetInteractionThemeAction,
} from './types';



export const setGeneralTheme = (
    state: ThemesState,
    action: SetGeneralThemeAction,
) => {
    return {
        ...state,
        general: {
            ...action.payload,
        },
    };
}


export const setInteractionTheme = (
    state: ThemesState,
    action: SetInteractionThemeAction,
) => {
    return {
        ...state,
        interaction: {
            ...action.payload,
        },
    };
}
