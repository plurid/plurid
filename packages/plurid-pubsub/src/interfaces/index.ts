export interface IPluridPubSub {
    publish: (topic: string, data: any) => any;
    subscribe: (topic: string, callback: any) => any;
}
