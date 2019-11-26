import {
    IPluridPubSub,
    Subscription,
} from '../../interfaces';



class PluridPubSub implements IPluridPubSub {
    private subscriptions: Subscription[] = [];

    public subscribe(topic: string, callback: any) {
        const subscription = {
            topic,
            callback,
        };
        this.subscriptions.push(subscription);
    }

    public publish(topic: string, data: any) {
        this.subscriptions.map(subscription => {
            if (topic === subscription.topic) {
                subscription.callback(data);
            }
        });
    }

    public unsubscribe(topic: string) {
        let unsubscribed = false;

        this.subscriptions = this.subscriptions.filter(subscription => {
            if (topic === subscription.topic) {
                unsubscribed = true;
                return false;
            }

            return subscription;
        });

        return unsubscribed;
    }
}


export default PluridPubSub;
