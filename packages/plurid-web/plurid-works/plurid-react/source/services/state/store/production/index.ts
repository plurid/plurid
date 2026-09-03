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

    import createHistoryMiddleware from '../../middleware/history';
    import { PluridThunkExtra } from '../../extra';
    // #endregion external
// #endregion imports



// #region module
export interface PluridStoreOptions {
    /** Include the spatial undo/redo history middleware. Default `true`. */
    history?: boolean;
    /** The thunk extra argument (the View's motion controller holder). */
    extra?: PluridThunkExtra;
}


const store: (
    preloadedState: AppState | {},
    options?: PluridStoreOptions,
) => Store<AppState> = (
    preloadedState: AppState | {},
    options?: PluridStoreOptions,
) => configureStore({
    preloadedState,
    reducer,
    devTools: false,
    // `history` defaults to true; an explicit `false` drops the middleware entirely (no per-action
    // signature cost, no snapshot memory) — for hosts owning their own undo or never mutating the
    // arrangement.
    middleware: (getDefaultMiddleware) =>
        options?.history === false
            ? getDefaultMiddleware({ thunk: { extraArgument: options?.extra } })
            : getDefaultMiddleware({ thunk: { extraArgument: options?.extra } }).concat(createHistoryMiddleware()),
});


export type AppDispatch = ReturnType<typeof store>['dispatch'];
// #endregion module



// #region exports
export default store;
// #endregion exports
