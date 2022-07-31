// #region imports
    // #region libraries
    import {
        PLURID_PUBSUB_TOPIC,

        PluridPubSub as IPluridPubSub,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    // #endregion external
// #endregion imports



// #region module
export const refreshActivePlane = (
    state: AppState,
    pubsub: IPluridPubSub,
) => {
    const {
        activePlaneID: id,
    } = state.space;

    if (!id) {
        return;
    }

    pubsub.publish({
        topic: PLURID_PUBSUB_TOPIC.REFRESH_PLANE,
        data: {
            id,
        },
    });
}


export const isolateActivePlane = (
    state: AppState,
    pubsub: IPluridPubSub,
) => {
    const {
        activePlaneID: id,
        isolatePlane,
    } = state.space;

    if (isolatePlane) {
        pubsub.publish({
            topic: PLURID_PUBSUB_TOPIC.ISOLATE_PLANE,
            data: {
                id: '',
            },
        });
        return;
    }

    if (!id) {
        return;
    }

    pubsub.publish({
        topic: PLURID_PUBSUB_TOPIC.ISOLATE_PLANE,
        data: {
            id,
        },
    });
}


export const openClosedPlane = (
    pubsub: IPluridPubSub,
) => {
    pubsub.publish({
        topic: PLURID_PUBSUB_TOPIC.OPEN_CLOSED_PLANE,
    });
}


export const closeActivePlane = (
    state: AppState,
    pubsub: IPluridPubSub,
) => {
    const {
        activePlaneID: id,
    } = state.space;

    if (!id) {
        return;
    }

    pubsub.publish({
        topic: PLURID_PUBSUB_TOPIC.CLOSE_PLANE,
        data: {
            id,
        },
    });
}
// #endregion module
