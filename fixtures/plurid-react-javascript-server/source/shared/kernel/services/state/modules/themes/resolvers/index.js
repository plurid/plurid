// #region module
const setGeneralTheme = (
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


const setInteractionTheme = (
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



const resolvers = {
    setGeneralTheme,
    setInteractionTheme,
};
// #endregion module



// #region exports
export default resolvers;
// #endregion exports
