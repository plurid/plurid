// #region imports
    // #region libraries
    import {
        configureStore,
        Store,
    } from '@reduxjs/toolkit';
    // #endregion libraries


    // #region external
    import reducer, {
        AppState,
    } from '../reducer';
    // #endregion external
// #endregion imports



// #region module
const store: (
    preloadedState: AppState | {},
) => Store<AppState> = (
    preloadedState: AppState | {},
) => configureStore({
    preloadedState,
    reducer,
    devTools: true,
});


export type AppDispatch = ReturnType<typeof store>['dispatch'];
// #endregion module



// #region exports
export default store;
// #endregion exports
