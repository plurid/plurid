// #region module
export interface PluridPubSubOptions {
    debug?: boolean;
}


export interface IPluridPubSub {
    publish: <D = any>(
        topic: string,
        data: D,
    ) => void;
    subscribe: (
        topic: string,
        callback: Callback,
    ) => number;
    unsubscribe: (
        index: number,
        topic: string,
    ) => boolean;
}


export type Callback = <D = any>(
    data: D,
) => void;
// #endregion module
