// #region imports
    // #region internal
    import {
        PluridPubSubPublishMessage,
        PluridPubSubSubscribeMessage,
        PluridPubSubCallback,
    } from './message';

    import {
        PluridPubSubPayloads,
        PluridPubSubTopicName,
    } from './payloads';
    // #endregion internal
// #endregion imports



// #region module
export * from './message';
export * from './payloads';


export interface PluridPubSubOptions {
    debug?: boolean;
}


/**
 * The instance bus. `publish` / `subscribe` are typed PER TOPIC through {@link PluridPubSubPayloads}
 * (a topic string narrows its `data` / callback argument); the untyped message-union signatures
 * remain for hosts that pass messages built elsewhere.
 */
export interface PluridPubSub {
    publish<T extends PluridPubSubTopicName>(
        message: { topic: T; data?: PluridPubSubPayloads[T] },
    ): void;
    publish(
        message: PluridPubSubPublishMessage,
    ): void;
    subscribe<T extends PluridPubSubTopicName>(
        message: { topic: T; callback: PluridPubSubCallback<PluridPubSubPayloads[T]> },
    ): string;
    subscribe(
        message: PluridPubSubSubscribeMessage,
    ): string;
    unsubscribe(
        selector: string,
    ): boolean;
}
// #endregion module
