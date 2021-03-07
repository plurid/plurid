// #region imports
    // #region external
    import {
        PluridPubSubTopicKeysType,
    } from '~constants/pubsub';
    // #endregion external


    // #region internal
    import {
        PluridPubSubPublishMessage,
        PluridPubSubSubscribeMessage,
    } from './message';
    // #endregion internal
// #endregion imports



// #region module
export * from './message';



export interface PluridPubSubOptions {
    debug?: boolean;
}



export interface PluridPubSub {
    publish(
        message: PluridPubSubPublishMessage,
    ): void;
    subscribe(
        message: PluridPubSubSubscribeMessage,
    ): number;
    unsubscribe(
        index: number,
        topic: PluridPubSubTopicKeysType,
    ): boolean;
}
// #endregion module
