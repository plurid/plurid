// #region imports
    // #region libraries
    import {
        useMemo,
    } from 'react';

    import {
        PluridApi,
        PluridState,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        encodeCameraViewpoint,
    } from '~services/logic/viewpoint';
    // #endregion external


    // #region internal
    import {
        useEngineStore,
        useEnginePubSub,
    } from '../engine';
    // #endregion internal
// #endregion imports



// #region module
/**
 * The `onReady` api, as a hook (the same `store` / `pubsub` / `getSnapshot` / `getViewpoint`) —
 * for components rendered under the application that want the escape hatch without threading a
 * ref from `onReady`. Stable across renders.
 */
export const usePluridApi = (): PluridApi => {
    const store = useEngineStore();
    const pubsub = useEnginePubSub();

    return useMemo<PluridApi>(() => ({
        store: store as any,
        pubsub: pubsub as any,
        getSnapshot: () => store.getState() as unknown as PluridState,
        getViewpoint: (options) => {
            const state = store.getState();
            const version = options?.version ?? state.configuration.space.viewpointURLVersion ?? 1;
            return encodeCameraViewpoint(state.space.camera, state.space.viewSize, version as 1 | 2);
        },
    }), [store, pubsub]);
};
// #endregion module
