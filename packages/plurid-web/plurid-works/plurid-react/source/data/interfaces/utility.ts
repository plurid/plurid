// #region imports
    // #region libraries
    import {
        ActionCreatorWithPayload,
    } from '@reduxjs/toolkit';
    // #endregion libraries
// #endregion imports



// #region module
export type DispatchAction<A> = (
    payload: A extends ActionCreatorWithPayload<infer P> ? P : unknown,
) => ReturnType<
    ActionCreatorWithPayload<
        A extends ActionCreatorWithPayload<infer P> ? P : unknown,
        string
    >
>;
// #endregion module
