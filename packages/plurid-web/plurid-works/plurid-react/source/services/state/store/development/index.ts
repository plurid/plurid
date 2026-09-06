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

    import {
        pluridMiddleware,
        PluridStoreOptions,
    } from '../middleware';
    // #endregion external
// #endregion imports



// #region module
export type {
    PluridStoreOptions,
};


const store: (
    preloadedState: AppState | {},
    options?: PluridStoreOptions,
) => Store<AppState> = (
    preloadedState: AppState | {},
    options?: PluridStoreOptions,
) => configureStore({
    preloadedState,
    reducer,
    devTools: true,
    // `history` defaults to true; an explicit `false` drops the middleware entirely (no per-action
    // signature cost, no snapshot memory) — for hosts owning their own undo or never mutating the
    // arrangement.
    // `space.shortcuts.onUnhandledKey` is a host CALLBACK that legitimately lives in the merged
    // configuration; RTK's development serializable check would otherwise flag it on every action.
    middleware: (getDefaultMiddleware) => pluridMiddleware(getDefaultMiddleware, options) as any,
});


export type AppDispatch = ReturnType<typeof store>['dispatch'];
// #endregion module



// #region exports
export default store;
// #endregion exports
