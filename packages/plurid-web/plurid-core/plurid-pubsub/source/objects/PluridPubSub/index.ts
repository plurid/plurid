// #region imports
    // #region libraries
    import {
        PluridPubSub as IPluridPubSub,
        PluridPubSubOptions,
        PluridPubSubCallback,
        PluridPubSubPublishMessage,
        PluridPubSubSubscribeMessage,
        PluridPubSubTopic,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
class PluridPubSub implements IPluridPubSub {
    private subscriptions: Map<any, PluridPubSubCallback[] | undefined> = new Map();
    private options: PluridPubSubOptions | undefined;


    constructor(
        options?: PluridPubSubOptions,
    ) {
        this.options = options;
    }


    public publish(
        message: PluridPubSubPublishMessage,
    ) {
        const {
            topic,
            data,
        } = message;

        const subscriptions = this.subscriptions.get(topic);

        if (!subscriptions) {
            return;
        }

        for (const subscription of subscriptions) {
            try {
                subscription(data);
            } catch (error) {
                if (this.options?.debug) {
                    console.log(
                        `Plurid Publish/Subscribe Error on '${topic}'`,
                        error,
                    );
                }

                continue;
            }
        }
    }

    public subscribe(
        message: PluridPubSubSubscribeMessage,
    ) {
        const {
            topic,
            callback,
        } = message;

        if (this.subscriptions.has(topic)) {
            const subscriptions = this.subscriptions.get(topic);
            subscriptions?.push(callback);
            this.subscriptions.set(
                topic,
                subscriptions,
            );

            return (subscriptions?.length || 1) - 1;
        }

        this.subscriptions.set(
            topic,
            [callback],
        );

        return 0;
    }

    public unsubscribe(
        index: number,
        topic: PluridPubSubTopic,
    ) {
        let unsubscribed = false;

        if (this.subscriptions.has(topic)) {
            const updatedTopic = this.subscriptions.get(topic)?.filter(
                (_, idx) => {
                    if (idx === index) {
                        unsubscribed = true;
                        return false;
                    }

                    return true;
                },
            );

            this.subscriptions.set(
                topic,
                updatedTopic,
            );
        }

        return unsubscribed;
    }
}
// #endregion module



// #region exports
export default PluridPubSub;
// #endregion exports
