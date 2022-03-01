// #region imports
    // #region external
    import * as Types from '../types';
    // #endregion externalr
// #endregion imports



// #region module
export const setGeneralField = <T>(
    payload: Types.SetGeneralFieldPayload<T>,
): Types.SetGeneralFieldAction => {
    return {
        type: Types.SET_GENERAL_FIELD,
        payload,
    };
}


const actions = {
    setGeneralField,
};
// #endregion module



// #region exports
export default actions;
// #endregion exports
