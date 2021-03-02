// #region module
export interface IPluridPubSub {
    publish: (
        topic: string,
        data: any,
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
