// #region imports
    // #region external
    import * as Types from '../types';
    // #endregion externalr
// #endregion imports



// #region module
const setGeneralTheme = (
    theme,
) => {
    return {
        type: Types.SET_GENERAL_THEME,
        payload: theme,
    };
}


const setInteractionTheme = (
    theme,
) => {
    return {
        type: Types.SET_INTERACTION_THEME,
        payload: theme,
    };
}



const actions = {
    setGeneralTheme,
    setInteractionTheme,
};
// #endregion module



// #region exports
export default actions;
// #endregion exports
