import {
    IPluridPubSub,
    Subscription,
} from '../../interfaces';



class PluridPubSub implements IPluridPubSub {
    private subscriptions: Subscription[] = [];

    public subscribe(topic: string, callback: any) {
        const subscription = {
            topic,
            callback
        }
        this.subscriptions.push(subscription);
    }

    public publish(topic: string, data: any) {
        this.subscriptions.map(subscription => {
            if (topic === subscription.topic) {
                subscription.callback(data);
            }
        });
    }
}


export default PluridPubSub;
