// #region imports
    // #region libraries
    import {
        PluridPubSub as IPluridPubSub,
        PluridPubSubOptions,
        PluridPubSubCallback,
        PluridPubSubPublishMessage,
        PluridPubSubSubscribeMessage,
        PluridPubSubTopicKeysType,
        PLURID_PUBSUB_EMITTED_TOPICS,
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
/** Development unless a bundler or Node says production (a bare browser has no `process`). */
const development = (): boolean => {
    try {
        return typeof process === 'undefined' || process.env?.NODE_ENV !== 'production';
    } catch {
        return true;
    }
};


class PluridPubSub implements IPluridPubSub {
    private subscriptions: Map<any, Record<string, PluridPubSubCallback> | undefined> = new Map();
    private options: PluridPubSubOptions | undefined;
    /** The topics already warned about: once per topic. */
    private dropped: Set<string> = new Set();


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
        const callbacks = subscriptions ? Object.values(subscriptions) : [];
        if (callbacks.length === 0) {
            // THE READINESS CONTRACT: no subscriber, the message is dropped — never buffered
            this.guard(topic, () => this.drop(String(topic)));
            return;
        }

        for (const subscription of callbacks) {
            this.guard(topic, () => subscription(data));
        }
    }

    /** A throwing subscriber (or drop hook) never breaks the publish; `debug` logs it. */
    private guard(
        topic: PluridPubSubPublishMessage['topic'],
        call: () => void,
    ) {
        try {
            call();
        } catch (error) {
            if (this.options?.debug) {
                console.log(
                    `Plurid Publish/Subscribe Error on '${topic}'`,
                    error,
                );
            }
        }
    }

    /**
     * A dropped publish: the host's `onDrop` when set (`null` silences), else — in development, once
     * per topic, never for a topic the engine emits — a warning naming the topic.
     */
    private drop(
        topic: string,
    ) {
        const onDrop = this.options?.onDrop;
        if (onDrop === null) {
            return;
        }
        if (onDrop) {
            onDrop(topic);
            return;
        }
        if (!development() || PLURID_PUBSUB_EMITTED_TOPICS.includes(topic) || this.dropped.has(topic)) {
            return;
        }
        this.dropped.add(topic);
        console.warn(
            `[plurid] '${topic}' was published with no subscriber and dropped: commands are taken from onReady on, in both modes, and never buffered. The bus's onDrop option reports (a function) or silences (null) this.`,
        );
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
