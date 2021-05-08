// #region imports
    // #region libraries
    import {
        combineReducers,
    } from 'redux';
    // #endregion libraries


    // #region external
    import * as configuration from '../modules/configuration';
    import * as shortcuts from '../modules/shortcuts';
    import * as space from '../modules/space';
    import * as themes from '../modules/themes';
    import * as ui from '../modules/ui';
    // #endregion external
// #endregion imports



// #region module
const rootReducer = combineReducers({
    configuration: configuration.reducer,
    shortcuts: shortcuts.reducer,
    space: space.reducer,
    themes: themes.reducer,
    ui: ui.reducer,
});
// #endregion module



// #region exports
export default rootReducer;
// #endregion exports
