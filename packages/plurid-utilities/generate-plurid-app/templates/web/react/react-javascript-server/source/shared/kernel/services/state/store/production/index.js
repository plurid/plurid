// #region imports
    // #region libraries
    import {
        configureStore,
    } from '@reduxjs/toolkit';
    // #endregion libraries


    // #region external
    import reducer from '../reducer';
    // #endregion external
// #endregion imports



// #region module
const store = (
    preloadedState,
) => configureStore({
    preloadedState,
    reducer,
    devTools: false,
});
// #endregion module



// #region exports
export default store;
// #endregion exports
