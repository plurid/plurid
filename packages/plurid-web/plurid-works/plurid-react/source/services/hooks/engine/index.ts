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
const selectorHook = createSelectorHook(StateContext as any);
const dispatchHook = createDispatchHook(StateContext as any);
const storeHook = createStoreHook(StateContext as any);

/**
 * OUTSIDE AN APPLICATION, SAID PLAINLY. react-redux's own error ("could not find react-redux context
 * value; please ensure the component is wrapped in a <Provider>") sent a host to wrap its tree in a
 * `<Provider>`, which cannot help: the engine's store is private to each application.
 */
const requireApplication = () => {
    if (!useContext(StateContext as any)) {
        throw new Error(
            '[plurid] a plurid hook (useCamera, useSelection, usePluridPlane, usePluridHistory, usePluridApi, useLook, …) was called outside a <PluridApplication>. The engine\'s state lives inside each application: call the hook from plane content, a render slot (renderToolbar …) or a component rendered under the application. A react-redux <Provider> does not provide it.',
        );
    }
};

export const useEngineSelector = (<T,>(
    selector: (state: AppState) => T,
    equalityFn?: (a: T, b: T) => boolean,
): T => {
    requireApplication();
    return selectorHook(selector as any, equalityFn as any) as T;
});

export const useEngineDispatch = (): ThunkDispatch<AppState, unknown, AnyAction> => {
    requireApplication();
    return dispatchHook() as ThunkDispatch<AppState, unknown, AnyAction>;
};

export const useEngineStore = (): {
    getState: () => AppState;
    dispatch: ThunkDispatch<AppState, unknown, AnyAction>;
    subscribe: (listener: () => void) => () => void;
} => {
    requireApplication();
    return storeHook() as any;
};


/** The instance pubsub bus (the one `onReady` hands back), or `undefined` outside an application. */
export const useEnginePubSub = (): IPluridPubSub | undefined => {
    const context = useContext(Context);
    return useMemo(() => context?.defaultPubSub, [context?.defaultPubSub]);
};
// #endregion module
