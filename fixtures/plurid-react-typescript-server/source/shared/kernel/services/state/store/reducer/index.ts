// #region imports
    // #region libraries
    import {
        combineReducers,
    } from '@reduxjs/toolkit';
    // #endregion libraries


    // #region external
    import modules from '~kernel-services/state/modules';
    // #endregion external
// #endregion imports



// #region module
const reducer = combineReducers({
    general: modules.general.reducer,
    themes: modules.themes.reducer,
});
// #endregion module



// #region exports
export type AppState = ReturnType<typeof reducer>;

export default reducer;
// #endregion exports
