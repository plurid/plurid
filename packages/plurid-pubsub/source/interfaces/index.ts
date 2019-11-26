export interface IPluridPubSub {
    publish: (topic: string, data: any) => void;
    subscribe: (topic: string, callback: (data: any) => void) => void;
    unsubscribe: (topic: string) => boolean;
}


export interface Subscription {
    topic: string;
    callback: (data: any) => void;
}
