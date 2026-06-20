// #region imports
    // #region libraries
    import React from 'react';

    import {
        ReactReduxContextValue,
    } from 'react-redux';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * The engine's private react-redux context. Every plurid `connect()` passes `{ context: StateContext }`
 * so the engine store stays isolated from any Redux store the host app already runs — without it, a
 * connected plurid component would silently bind to the host's store (or none) and fail at runtime.
 *
 * Typed as a real `ReactReduxContextValue` context (state generic left `any` to avoid a circular import
 * with the store) and defaulted to `null` — react-redux's own sentinel for "no Provider above me", which
 * its hooks/`connect` detect and throw on. The old `createContext<any>({})` swallowed that signal: an
 * empty object reads as a present-but-broken store, turning a clear "missing Provider" error into a
 * confusing downstream crash.
 */
const StateContext = React.createContext<ReactReduxContextValue<any> | null>(null);
// #endregion module



// #region exports
export default StateContext;
// #endregion exports
