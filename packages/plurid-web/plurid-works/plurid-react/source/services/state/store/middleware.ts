// #region imports
    // #region libraries
    import {
        Middleware,
    } from '@reduxjs/toolkit';
    // #endregion libraries

    // #region external
    import createHistoryMiddleware from '../middleware/history';
    import { PluridThunkExtra } from '../extra';
    // #endregion external
// #endregion imports



// #region module
export interface PluridStoreOptions {
    /** Include the spatial undo/redo history middleware. Default `true`. */
    history?: boolean;
    /** The thunk extra argument (the View's motion controller holder). */
    extra?: PluridThunkExtra;
}

/**
 * The host CALLBACKS that legitimately live in the merged configuration. RTK's development checks
 * (serializable / immutable state) run whenever `NODE_ENV` is not `production` at runtime — a Vite
 * dev server included, whichever store variant the library resolved at build time — so BOTH variants
 * declare them (2026-09-06: the production variant did not, and every action logged an error).
 */
const CONFIGURATION_CALLBACK_PATHS = [
    'configuration.space.shortcuts.onUnhandledKey',
];

const CONFIGURATION_CALLBACK_ACTION_PATHS = [
    'payload.space.shortcuts.onUnhandledKey',
    'payload.configuration.space.shortcuts.onUnhandledKey',
];

/** The one middleware stack: RTK's defaults with the callback paths ignored, plus history unless off. */
export const pluridMiddleware = (
    getDefaultMiddleware: (options: any) => any,
    options?: PluridStoreOptions,
): Middleware[] => {
    const defaults = getDefaultMiddleware({
        thunk: {
            extraArgument: options?.extra,
        },
        serializableCheck: {
            ignoredPaths: CONFIGURATION_CALLBACK_PATHS,
            ignoredActionPaths: CONFIGURATION_CALLBACK_ACTION_PATHS,
        },
        immutableCheck: {
            ignoredPaths: CONFIGURATION_CALLBACK_PATHS,
        },
    });

    // `history` defaults to true; an explicit `false` drops the middleware entirely (no per-action
    // signature cost, no snapshot memory) — for hosts owning their own undo or never mutating the
    // arrangement.
    return options?.history === false
        ? defaults
        : defaults.concat(createHistoryMiddleware());
};
// #endregion module
