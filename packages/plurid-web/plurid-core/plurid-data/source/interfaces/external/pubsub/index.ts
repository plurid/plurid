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
    /**
     * THE READINESS CONTRACT: a publish that finds no subscriber is dropped, not buffered — a
     * command sent before the engine mounted, or after it unmounted, goes nowhere. When nothing
     * else is set the bus warns once per topic in development (the engine's own emit topics,
     * `PLURID_PUBSUB_EMITTED_TOPICS`, excepted: nobody has to listen to them). A function replaces
     * the warning with the host's own report; `null` silences it.
     */
    onDrop?: ((topic: string) => void) | null;
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
