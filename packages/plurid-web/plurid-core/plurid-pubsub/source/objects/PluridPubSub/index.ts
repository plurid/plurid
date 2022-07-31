// #region imports
    // #region libraries
    import {
        PluridPubSub as IPluridPubSub,
        PluridPubSubOptions,
        PluridPubSubCallback,
        PluridPubSubPublishMessage,
        PluridPubSubSubscribeMessage,
        PluridPubSubTopicKeysType,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region internal
    import {
        SELECTOR_SEPARATOR,
    } from './data';
    // #endregion internal
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


    private createSelector(
        topic: PluridPubSubTopicKeysType,
        value: number,
    ) {
        return topic + SELECTOR_SEPARATOR + value;
    }

    private parseSelector(
        selector: string,
    ) {
        const [topic, idx] = selector.split(SELECTOR_SEPARATOR) as [PluridPubSubTopicKeysType, string];
        const index = parseInt(idx);

        if (!topic || typeof index !== 'number') {
            return;
        }

        return {
            topic,
            index,
        };
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

            const value = (subscriptions?.length || 1) - 1;

            return this.createSelector(topic, value);
        }

        this.subscriptions.set(
            topic,
            [callback],
        );

        return this.createSelector(topic, 0);
    }

    public unsubscribe(
        selector: string,
    ) {
        const parsedSelector = this.parseSelector(selector);
        if (!parsedSelector) {
            return false;
        }

        const {
            topic,
            index,
        } = parsedSelector;

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
