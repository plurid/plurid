import * as Types from './types';



export const setGeneralTheme = (
    state,
    action,
) => {
    return {
        ...state,
        general: {
            ...action.payload,
        },
    };
}


export const setInteractionTheme = (
    state,
    action,
) => {
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
