// #region module
export interface IPluridPubSub {
    publish: (
        topic: string,
        data: any,
    ) => void;
    subscribe: (
        topic: string,
        callback: (data: any) => number,
    ) => void;
    unsubscribe: (
        index: number,
        topic: string,
    ) => boolean;
}


export interface Subscription {
    topic: string;
    callback: (
        data: any,
    ) => void;
}

export type Callback = (
    data: any,
) => void;
// #endregion module
