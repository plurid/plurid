// #region module
export interface PluridPubSubOptions {
    debug?: boolean;
}


export interface PluridPubSub {
    publish: <D = any>(
        topic: string,
        data: D,
    ) => void;
    subscribe: (
        topic: string,
        callback: PluridPubSubCallback,
    ) => number;
    unsubscribe: (
        index: number,
        topic: string,
    ) => boolean;
}


export type PluridPubSubCallback = <D = any>(
    data: D,
) => void;
// #endregion module
