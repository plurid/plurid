// #region imports
    // #region external
    import * as Types from '../types';
    // #endregion external
// #endregion imports



// #region module
export const setGlobalShortcuts = (
    state: Types.State,
): Types.State => {
    return {
        ...state,
        global: true,
    };
}


export const unsetGlobalShortcuts = (
    state: Types.State,
): Types.State => {
    return {
        ...state,
        global: false,
    };
}
// #endregion module
