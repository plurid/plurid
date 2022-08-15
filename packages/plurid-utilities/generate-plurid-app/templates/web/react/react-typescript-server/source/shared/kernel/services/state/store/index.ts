// #region imports
    // #region libraries
    import {
        ThunkAction,
        Action,
    } from '@reduxjs/toolkit';
    // #endregion libraries


    // #region external
    import environment from '~kernel-services/utilities/environment';
    // #endregion external


    // #region internal
    import storeProduction, {
        AppDispatch as AppDispatchProduction,
    } from './production';

    import storeDevelopment, {
        AppDispatch as AppDispatchDevelopment,
    } from './development';

    import type {
        AppState,
    } from './reducer';
    // #endregion internal
// #endregion imports



// #region module
type AppDispatch =
    | AppDispatchProduction
    | AppDispatchDevelopment;

type AppThunk = ThunkAction<void, AppState, unknown, Action>;


const store = environment.production
    ? storeProduction
    : storeDevelopment;
// #endregion module



// #region exports
export {
    AppState,
    AppDispatch,
    AppThunk,
};

export default store;
// #endregion exports
