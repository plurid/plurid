// #region imports
    // #region libraries
    import {
        combineReducers,
    } from '@reduxjs/toolkit';
    // #endregion libraries


    // #region external
    import modules from '~services/state/modules';
    // #endregion external
// #endregion imports



// #region module
const reducer = combineReducers({
    configuration: modules.configuration.reducer,
    general: modules.general.reducer,
    shortcuts: modules.shortcuts.reducer,
    space: modules.space.reducer,
    themes: modules.themes.reducer,
    ui: modules.ui.reducer,
});
// #endregion module



// #region exports
export type AppState = ReturnType<typeof reducer>;

export default reducer;
// #endregion exports
