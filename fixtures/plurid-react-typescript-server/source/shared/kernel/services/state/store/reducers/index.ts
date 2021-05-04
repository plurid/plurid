// #region imports
    // #region libraries
    import {
        combineReducers,
    } from 'redux';
    // #endregion libraries


    // #region external
    import modules from '../../modules';
    // #endregion external
// #endregion imports



// #region module
const reducers = combineReducers({
    general: modules.general.reducer,
    themes: modules.themes.reducer,
});
// #endregion module



// #region exports
export default reducers;
// #endregion exports
