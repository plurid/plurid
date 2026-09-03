// #region imports
    // #region libraries
    import {
        useContext,
        useMemo,
    } from 'react';

    import {
        createSelectorHook,
        createDispatchHook,
        createStoreHook,
    } from 'react-redux';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';

    import {
        PluridPubSub as IPluridPubSub,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import Context from '~services/context';
    import StateContext from '~services/state/context';
    import { AppState } from '~services/state/store';
    // #endregion external
// #endregion imports



// #region module
/**
 * The engine's private react-redux context, as hooks: every `use*` seam below reads the store the
 * enclosing `PluridApplication` provides (never the host's own Redux), so they work anywhere under
 * an application — plane content, a render-slot, a custom overlay.
 */
export const useEngineSelector = createSelectorHook(StateContext as any) as <T>(
    selector: (state: AppState) => T,
    equalityFn?: (a: T, b: T) => boolean,
) => T;

export const useEngineDispatch = createDispatchHook(StateContext as any) as () => ThunkDispatch<AppState, unknown, AnyAction>;

export const useEngineStore = createStoreHook(StateContext as any) as () => {
    getState: () => AppState;
    dispatch: ThunkDispatch<AppState, unknown, AnyAction>;
    subscribe: (listener: () => void) => () => void;
};


/** The instance pubsub bus (the one `onReady` hands back), or `undefined` outside an application. */
export const useEnginePubSub = (): IPluridPubSub | undefined => {
    const context = useContext(Context);
    return useMemo(() => context?.defaultPubSub, [context?.defaultPubSub]);
};
// #endregion module
