// #region imports
    // #region libraries
    import {
        combineReducers,
    } from 'redux';
    // #endregion libraries


    // #region external
    import modules from '~services/state/modules';
    // #endregion external
// #endregion imports



// #region module
const rootReducer = combineReducers({
    configuration: modules.configuration.reducer,
    general: modules.general.reducer,
    shortcuts: modules.shortcuts.reducer,
    space: modules.space.reducer,
    themes: modules.themes.reducer,
    ui: modules.ui.reducer,
});
// #endregion module



// #region exports
export default rootReducer;
// #endregion exports
