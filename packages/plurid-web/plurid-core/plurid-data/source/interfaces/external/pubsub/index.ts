// #region imports
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
    ): string;
    unsubscribe(
        selector: string,
    ): boolean;
}
// #endregion module
