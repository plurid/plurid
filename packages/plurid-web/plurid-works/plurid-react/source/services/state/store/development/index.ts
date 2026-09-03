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
    devTools: true,
    // `history` defaults to true; an explicit `false` drops the middleware entirely (no per-action
    // signature cost, no snapshot memory) — for hosts owning their own undo or never mutating the
    // arrangement.
    // `space.shortcuts.onUnhandledKey` is a host CALLBACK that legitimately lives in the merged
    // configuration; RTK's development serializable check would otherwise flag it on every action.
    middleware: (getDefaultMiddleware) => {
        const defaults = getDefaultMiddleware({
            thunk: {
                extraArgument: options?.extra,
            },
            serializableCheck: {
                ignoredPaths: [
                    'configuration.space.shortcuts.onUnhandledKey',
                ],
                ignoredActionPaths: [
                    'payload.space.shortcuts.onUnhandledKey',
                    'payload.configuration.space.shortcuts.onUnhandledKey',
                ],
            },
        });
        return options?.history === false
            ? defaults
            : defaults.concat(createHistoryMiddleware());
    },
});


export type AppDispatch = ReturnType<typeof store>['dispatch'];
// #endregion module



// #region exports
export default store;
// #endregion exports
