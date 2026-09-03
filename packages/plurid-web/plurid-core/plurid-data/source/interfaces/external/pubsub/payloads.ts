// #region imports
    // #region internal
    import {
        PluridPubSubPublishMessage,
    } from './message';
    // #endregion internal
// #endregion imports



// #region module
/**
 * Every topic's payload, derived from the publish-message union — one map keyed by the topic
 * string, so `publish` / `subscribe` can be typed per topic without a second hand-written table
 * that could drift: `PluridPubSubPayloads['space.frame']` is `PluridPubSubMessageFrame | undefined`.
 */
export type PluridPubSubPayloads = {
    [M in PluridPubSubPublishMessage as M['topic']]: M extends { data: infer D }
        ? D
        : (M extends { data?: infer D } ? D | undefined : undefined);
};

/** A topic string with a typed payload. */
export type PluridPubSubTopicName = keyof PluridPubSubPayloads;

/** The payload of one topic. */
export type PluridPubSubPayload<T extends PluridPubSubTopicName> = PluridPubSubPayloads[T];
// #endregion module
