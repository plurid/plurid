// #region imports
    // #region libraries
    import {
        useEffect,
    } from 'react';

    import {
        PLURID_PUBSUB_TOPIC,

        PluridPubSub as IPluridPubSub,
        PluridChangeKind,
    } from '@plurid/plurid-data';

    import { AppState } from '~services/state/store';
    // #endregion libraries
// #endregion imports



// #region module
export interface UseEngineEventsParameters {
    /** The instance pubsub (the one `onReady` hands back + the View's topics ride). */
    pubsub: IPluridPubSub | undefined;
    state: AppState;
}


/**
 * The engine→host OBSERVE channel. One effect per watched slice publishes `space.changed`
 * `{ kind, value }` when that slice's reference changes — so a host subscribes ONCE and reacts to
 * selection / tree / links / active-plane / isolate / layout / loading, instead of diffing snapshots
 * off `onReady`'s `store.subscribe`. Camera/viewpoint is intentionally NOT here (it changes per orbit
 * frame) — use the debounced `onViewpointChange` callback / `getViewpoint()` for that. Publishing to a
 * topic with no subscriber is free, so this is always on (the host observes only if it cares).
 */
export const useEngineEvents = (
    {
        pubsub,
        state,
    }: UseEngineEventsParameters,
) => {
    const space = state.space;

    const emit = (kind: PluridChangeKind, value: unknown) => {
        if (pubsub) {
            pubsub.publish({
                topic: PLURID_PUBSUB_TOPIC.CHANGED,
                data: { kind, value },
            });
        }
    };

    useEffect(() => {
        emit('selection', space.selectedPlaneIDs);
    }, [pubsub, space.selectedPlaneIDs]);

    useEffect(() => {
        emit('tree', space.tree);
    }, [pubsub, space.tree]);

    useEffect(() => {
        emit('links', space.links);
    }, [pubsub, space.links]);

    useEffect(() => {
        emit('activePlane', space.activePlaneID);
    }, [pubsub, space.activePlaneID]);

    useEffect(() => {
        emit('isolate', space.isolatePlane);
    }, [pubsub, space.isolatePlane]);

    useEffect(() => {
        emit('layoutResolved', space.resolvedLayout);
    }, [pubsub, space.resolvedLayout]);

    useEffect(() => {
        emit('loading', space.loading);
    }, [pubsub, space.loading]);
}
// #endregion module



// #region exports
export default useEngineEvents;
// #endregion exports
