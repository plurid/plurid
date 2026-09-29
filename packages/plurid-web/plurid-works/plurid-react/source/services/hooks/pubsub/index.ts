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


    // #region external
    import {
        warnOnce,
    } from '~services/logic/development/warn';
    // #endregion external


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
            // outside an application there is no bus to hear: said, where it used to subscribe to nothing
            warnOnce(
                'pubsub-hook-outside:' + String(topic),
                `usePluridPubSub('${String(topic)}') is outside a <PluridApplication>, so it hears nothing: call it from plane content or a render slot, or subscribe on the api's bus (onReady).`,
            );
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
