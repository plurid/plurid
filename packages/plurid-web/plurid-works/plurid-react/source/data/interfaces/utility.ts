// #region imports
    // #region libraries
    import {
        ActionCreatorWithPayload,
        ActionCreatorWithoutPayload,
    } from '@reduxjs/toolkit';
    // #endregion libraries
// #endregion imports



// #region module
export type DispatchAction<A> = A extends ActionCreatorWithPayload<infer P, infer T>
    ? (payload: P) => ReturnType<ActionCreatorWithPayload<P, T>>
    : void;

export type DispatchActionWithoutPayload<A> = A extends ActionCreatorWithoutPayload<infer T>
    ? () => ReturnType<ActionCreatorWithoutPayload<T>>
    : void;
// #endregion module
