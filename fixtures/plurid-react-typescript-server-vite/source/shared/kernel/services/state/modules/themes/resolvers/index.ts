// #region imports
    // #region external
    import * as Types from '../types';
    // #endregion external
// #endregion imports



// #region module
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



const resolvers = {
    setGeneralTheme,
    setInteractionTheme,
};
// #endregion module



// #region exports
export default resolvers;
// #endregion exports
