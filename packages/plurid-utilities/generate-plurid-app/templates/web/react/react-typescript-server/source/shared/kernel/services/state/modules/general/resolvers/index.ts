// #region imports
    // #region external
    import * as Types from '../types';
    // #endregion external
// #endregion imports



// #region module
export const setGeneralField = (
    state: Types.State,
    action: Types.SetGeneralFieldAction,
): Types.State => {
    const {
        field,
        value,
    } = action.payload;

    const newState = {
        ...state,
    };
    (newState as any)[field] = value;

    return newState;
}


const resolvers = {
    setGeneralField,
};
// #endregion module



// #region exports
export default resolvers;
// #endregion exports
