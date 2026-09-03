// #region imports
    // #region libraries
    import {
        useEffect,
        useRef,
    } from 'react';

    import {
        PluridPubSubTopicName,
        PluridPubSubPayloads,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region internal
    import {
        useEnginePubSub,
    } from '../engine';
    // #endregion internal
// #endregion imports



// #region module
/**
 * Subscribe to one topic of the instance bus for the life of the component. Typed per topic
 * (`usePluridPubSub('space.changed', ({ kind, value }) => …)`); the latest callback is always the
 * one called, without re-subscribing on every render.
 */
export const usePluridPubSub = <T extends PluridPubSubTopicName>(
    topic: T,
    callback: (data: PluridPubSubPayloads[T]) => void,
) => {
    const pubsub = useEnginePubSub();
    const latest = useRef(callback);
    latest.current = callback;

    useEffect(() => {
        if (!pubsub) {
            return;
        }
        const selector = pubsub.subscribe({
            topic,
            callback: (data: PluridPubSubPayloads[T]) => {
                latest.current(data);
            },
        } as any);

        return () => {
            pubsub.unsubscribe(selector);
        };
    }, [
        pubsub,
        topic,
    ]);
};
// #endregion module
