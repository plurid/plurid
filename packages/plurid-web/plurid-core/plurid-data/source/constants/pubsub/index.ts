// #region module
export const PLURID_PUBSUB_TOPIC = {
    CONFIGURATION: 'configuration',

    SPACE_ANIMATED_TRANSFORM: 'space.animatedTransform',

    SPACE_ROTATE_UP: 'space.rotateUp',
    SPACE_ROTATE_DOWN: 'space.rotateDown',
    SPACE_ROTATE_LEFT: 'space.rotateLeft',
    SPACE_ROTATE_RIGHT: 'space.rotateRight',

    SPACE_ROTATE_X_WITH: 'space.rotateXWith',
    SPACE_ROTATE_Y_WITH: 'space.rotateYWith',

    SPACE_ROTATE_X_TO: 'space.rotateXTo',
    SPACE_ROTATE_Y_TO: 'space.rotateYTo',

    SPACE_TRANSLATE_UP: 'space.translateUp',
    SPACE_TRANSLATE_DOWN: 'space.translateDown',
    SPACE_TRANSLATE_LEFT: 'space.translateLeft',
    SPACE_TRANSLATE_RIGHT: 'space.translateRight',

    SPACE_TRANSLATE_X_WITH: 'space.translateXWith',
    SPACE_TRANSLATE_Y_WITH: 'space.translateYWith',
    SPACE_TRANSLATE_Z_WITH: 'space.translateZWith',

    SPACE_TRANSLATE_X_TO: 'space.translateXTo',
    SPACE_TRANSLATE_Y_TO: 'space.translateYTo',
    SPACE_TRANSLATE_Z_TO: 'space.translateZTo',

    SPACE_SCALE_UP: 'space.scaleUp',
    SPACE_SCALE_DOWN: 'space.scaleDown',
    SPACE_SCALE_WITH: 'space.scaleWith',

    SPACE_TRANSFORM: 'space.transform',

    VIEW_ADD_PLANE: 'view.addPlane',
    VIEW_SET_PLANES: 'view.setPlanes',
    VIEW_REMOVE_PLANE: 'view.removePlane',

    NAVIGATE_TO_PLANE: 'space.navigateToPlane',
    REFRESH_PLANE: 'space.refreshPlane',
    ISOLATE_PLANE: 'space.isolatePlane',
    OPEN_CLOSED_PLANE: 'space.openClosedPlane',
    CLOSE_PLANE: 'space.closePlane',
    PREVIOUS_ROOT: 'space.previousRoot',
    NEXT_ROOT: 'space.nextRoot',
    NAVIGATE_TO_ROOT: 'space.navigateToRoot',
} as const;


export type PluridPubSubTopic = typeof PLURID_PUBSUB_TOPIC;
export type PluridPubSubTopicKeys = keyof typeof PLURID_PUBSUB_TOPIC;
export type PluridPubSubTopicKeysType = typeof PLURID_PUBSUB_TOPIC[PluridPubSubTopicKeys];
// #endregion module
