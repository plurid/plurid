// #region module
const setGeneralField = (
    state,
    action,
) => {
    const {
        field,
        value,
    } = action.payload;

    const newState = {
        ...state,
    };
    newState[field] = value;

    return newState;
}


const resolvers = {
    setGeneralField,
};
// #endregion module



// #region exports
export default resolvers;
// #endregion exports
