export interface IPluridPubSub {
    publish: (topic: string, data: any) => void;
    subscribe: (topic: string, callback: (data: any) => void) => void;
}


export interface Subscription {
    topic: string;
    callback: (data: any) => void;
}
