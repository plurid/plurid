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
        SUBSCRIPTION_PREFIX,
        SELECTOR_SEPARATOR,
    } from './data';
    // #endregion internal
// #endregion imports



// #region module
class PluridPubSub implements IPluridPubSub {
    private subscriptions: Map<any, Record<string, PluridPubSubCallback> | undefined> = new Map();
    private options: PluridPubSubOptions | undefined;


    constructor(
        options?: PluridPubSubOptions,
    ) {
        this.options = options;
    }


    private createSelector(
        topic: PluridPubSubTopicKeysType,
        value: string,
    ) {
        return topic + SELECTOR_SEPARATOR + value;
    }

    private parseSelector(
        selector: string,
    ) {
        const [
            topic,
            index,
        ] = selector.split(SELECTOR_SEPARATOR) as [PluridPubSubTopicKeysType, string];

        if (!topic || !index) {
            return;
        }

        return {
            topic,
            index,
        };
    }

    private composeIndex(
        value: number,
    ) {
        return SUBSCRIPTION_PREFIX + value;
    }

    private getNextIndex(
        subscriptions: Record<string, PluridPubSubCallback<any>>,
    ) {
        const index = Object.keys(subscriptions).length !== 0
            ? Math.max(
                ...Object.keys(subscriptions).map(
                    (val) => parseInt(val.replace(SUBSCRIPTION_PREFIX, '')),
                ),
            ) + 1 : 0;

        return this.composeIndex(index);
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

        for (const subscription of Object.values(subscriptions)) {
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

        const subscriptions = this.subscriptions.get(topic) || {};
        const index = this.getNextIndex(subscriptions);

        subscriptions[index] = callback;
        this.subscriptions.set(
            topic,
            subscriptions,
        );

        return this.createSelector(topic, index);
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
            const subscriptions = this.subscriptions.get(topic);
            if (!subscriptions) {
                return unsubscribed;
            }

            delete subscriptions[index];
            unsubscribed = true;

            this.subscriptions.set(
                topic,
                subscriptions,
            );
        }

        return unsubscribed;
    }
}
// #endregion module



// #region exports
export default PluridPubSub;
// #endregion exports
