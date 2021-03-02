// #region imports
    // #region external
    import {
        IPluridPubSub,
        Callback,
    } from '../../interfaces';
    // #endregion external
// #endregion imports



// #region module
class PluridPubSub implements IPluridPubSub {
    private subscriptions: Record<string, Callback[] | undefined> = {};


    public subscribe(
        topic: string,
        callback: Callback,
    ) {
        if (this.subscriptions[topic]) {
            this.subscriptions[topic]?.push(callback);

            return (this.subscriptions[topic]?.length || 1) - 1;
        }

        this.subscriptions[topic] = [
            callback,
        ];

        return 0;
    }

    public publish(
        topic: string,
        data: any,
    ) {
        const subscriptions = this.subscriptions[topic];

        if (!subscriptions) {
            return;
        }

        for (const subscription of subscriptions) {
            try {
                subscription(data);
            } catch (error) {
                continue;
            }
        }
    }

    public unsubscribe(
        index: number,
        topic: string,
    ) {
        let unsubscribed = false;

        if (this.subscriptions[topic]) {
            this.subscriptions[topic] = this.subscriptions[topic]?.filter((_, idx) => {
                if (idx === index) {
                    unsubscribed = true;
                    return false;
                }

                return true;
            });
        }

        return unsubscribed;
    }
}
// #endregion module



// #region exports
export default PluridPubSub;
// #endregion exports
