// #region imports
    // #region external
    import {
        PLURID_PUBSUB_TOPIC,
    } from '~constants/pubsub';

    import {
        PluridPartialConfiguration,
    } from '~interfaces/external/configuration';
    // #endregion external
// #endregion imports



// #region module
export type PluridPubSubCallback<D = any> = (
    data: D,
) => void;



export interface PluridPubSubDataValueNumber {
    value: number;
}

export interface PluridPubSubDataValueString {
    value: string;
}




export interface PluridPubSubPublishMessageConfiguration {
    topic: typeof PLURID_PUBSUB_TOPIC.CONFIGURATION;
    data: PluridPartialConfiguration;
}
export interface PluridPubSubSubscribeMessageConfiguration {
    topic: typeof PLURID_PUBSUB_TOPIC.CONFIGURATION;
    callback: PluridPubSubCallback<PluridPartialConfiguration>;
}

export interface PluridPubSubPublishMessageSpaceAnimatedTransform {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ANIMATED_TRANSFORM;
    data?: any;
}
export interface PluridPubSubSubscribeMessageSpaceAnimatedTransform {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ANIMATED_TRANSFORM;
    callback: PluridPubSubCallback<any>;
}



export interface PluridPubSubPublishMessageSpaceRotateUp {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_UP;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubPublishMessageSpaceRotateDown {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_DOWN;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubPublishMessageSpaceRotateLeft {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_LEFT;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubPublishMessageSpaceRotateRight {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_RIGHT;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubSubscribeMessageSpaceRotateUp {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_UP;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}
export interface PluridPubSubSubscribeMessageSpaceRotateDown {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_DOWN;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}
export interface PluridPubSubSubscribeMessageSpaceRotateLeft {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_LEFT;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}
export interface PluridPubSubSubscribeMessageSpaceRotateRight {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_RIGHT;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}

export interface PluridPubSubPublishMessageSpaceRotateXWith {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_X_WITH;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubPublishMessageSpaceRotateYWith {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_Y_WITH;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubSubscribeMessageSpaceRotateXWith {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_X_WITH;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}
export interface PluridPubSubSubscribeMessageSpaceRotateYWith {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_Y_WITH;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}

export interface PluridPubSubPublishMessageSpaceRotateXTo {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_X_TO;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubPublishMessageSpaceRotateYTo {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_Y_TO;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubSubscribeMessageSpaceRotateXTo {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_X_TO;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}
export interface PluridPubSubSubscribeMessageSpaceRotateYTo {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_Y_TO;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}



export interface PluridPubSubPublishMessageSpaceTranslateUp {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_UP;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubPublishMessageSpaceTranslateDown {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_DOWN;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubPublishMessageSpaceTranslateLeft {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_LEFT;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubPublishMessageSpaceTranslateRight {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_RIGHT;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubSubscribeMessageSpaceTranslateUp {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_UP;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}
export interface PluridPubSubSubscribeMessageSpaceTranslateDown {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_DOWN;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}
export interface PluridPubSubSubscribeMessageSpaceTranslateLeft {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_LEFT;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}
export interface PluridPubSubSubscribeMessageSpaceTranslateRight {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_RIGHT;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}

export interface PluridPubSubPublishMessageSpaceTranslateXWith {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_X_WITH;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubPublishMessageSpaceTranslateYWith {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Y_WITH;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubPublishMessageSpaceTranslateZWith {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Z_WITH;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubSubscribeMessageSpaceTranslateXWith {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_X_WITH;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}
export interface PluridPubSubSubscribeMessageSpaceTranslateYWith {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Y_WITH;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}
export interface PluridPubSubSubscribeMessageSpaceTranslateZWith {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Z_WITH;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}

export interface PluridPubSubPublishMessageSpaceTranslateXTo {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_X_TO;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubPublishMessageSpaceTranslateYTo {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Y_TO;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubPublishMessageSpaceTranslateZTo {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Z_TO;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubSubscribeMessageSpaceTranslateXTo {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_X_TO;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}
export interface PluridPubSubSubscribeMessageSpaceTranslateYTo {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Y_TO;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}
export interface PluridPubSubSubscribeMessageSpaceTranslateZTo {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Z_TO;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}



export interface PluridPubSubPublishMessageSpaceScaleUp {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_SCALE_UP;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubPublishMessageSpaceScaleDown {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_SCALE_DOWN;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubPublishMessageSpaceScaleWith {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_SCALE_WITH;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubSubscribeMessageSpaceScaleUp {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_SCALE_UP;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}
export interface PluridPubSubSubscribeMessageSpaceScaleDown {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_SCALE_DOWN;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}
export interface PluridPubSubSubscribeMessageSpaceScaleWith {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_SCALE_WITH;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}



export interface PluridPubSubPublishMessageSpaceTransform {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSFORM;
    data?: any;
}
export interface PluridPubSubSubscribeMessageSpaceTransform {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSFORM;
    callback: PluridPubSubCallback<any>;
}


export interface PluridPubSubMessageViewAddPlaneData {
    plane: string;
}
export interface PluridPubSubPublishMessageViewAddPlane {
    topic: typeof PLURID_PUBSUB_TOPIC.VIEW_ADD_PLANE;
    data: PluridPubSubMessageViewAddPlaneData;
}
export interface PluridPubSubSubscribeMessageViewAddPlane {
    topic: typeof PLURID_PUBSUB_TOPIC.VIEW_ADD_PLANE;
    callback: PluridPubSubCallback<PluridPubSubMessageViewAddPlaneData>;
}

export interface PluridPubSubPublishMessageViewSetPlanes {
    topic: typeof PLURID_PUBSUB_TOPIC.VIEW_SET_PLANES;
    data?: any;
}
export interface PluridPubSubSubscribeMessageViewSetPlanes {
    topic: typeof PLURID_PUBSUB_TOPIC.VIEW_SET_PLANES;
    callback: PluridPubSubCallback<any>;
}

export interface PluridPubSubMessageViewRemovePlaneData {
    plane: string;
}
export interface PluridPubSubPublishMessageViewRemovePlane {
    topic: typeof PLURID_PUBSUB_TOPIC.VIEW_REMOVE_PLANE;
    data: PluridPubSubMessageViewRemovePlaneData;
}
export interface PluridPubSubSubscribeMessageViewRemovePlane {
    topic: typeof PLURID_PUBSUB_TOPIC.VIEW_REMOVE_PLANE;
    callback: PluridPubSubCallback<PluridPubSubMessageViewRemovePlaneData>;
}

export interface PluridPubSubMessageNavigateToPlane {
    id: string;
}
export interface PluridPubSubPublishMessageNavigateToPlane {
    topic: typeof PLURID_PUBSUB_TOPIC.NAVIGATE_TO_PLANE;
    data: PluridPubSubMessageNavigateToPlane;
}
export interface PluridPubSubSubscribeMessageNavigateToPlane {
    topic: typeof PLURID_PUBSUB_TOPIC.NAVIGATE_TO_PLANE;
    callback: PluridPubSubCallback<PluridPubSubMessageNavigateToPlane>;
}

export interface PluridPubSubMessageRefreshPlane {
    id: string;
}
export interface PluridPubSubPublishMessageRefreshPlane {
    topic: typeof PLURID_PUBSUB_TOPIC.REFRESH_PLANE;
    data: PluridPubSubMessageRefreshPlane;
}
export interface PluridPubSubSubscribeMessageRefreshPlane {
    topic: typeof PLURID_PUBSUB_TOPIC.REFRESH_PLANE;
    callback: PluridPubSubCallback<PluridPubSubMessageRefreshPlane>;
}

export interface PluridPubSubMessageIsolatePlane {
    id: string;
}
export interface PluridPubSubPublishMessageIsolatePlane {
    topic: typeof PLURID_PUBSUB_TOPIC.ISOLATE_PLANE;
    data: PluridPubSubMessageIsolatePlane;
}
export interface PluridPubSubSubscribeMessageIsolatePlane {
    topic: typeof PLURID_PUBSUB_TOPIC.ISOLATE_PLANE;
    callback: PluridPubSubCallback<PluridPubSubMessageIsolatePlane>;
}

export interface PluridPubSubPublishMessageOpenClosedPlane {
    topic: typeof PLURID_PUBSUB_TOPIC.OPEN_CLOSED_PLANE;
    data?: any;
}
export interface PluridPubSubSubscribeMessageOpenClosedPlane {
    topic: typeof PLURID_PUBSUB_TOPIC.OPEN_CLOSED_PLANE;
    callback: PluridPubSubCallback<any>;
}

export interface PluridPubSubMessageClosePlane {
    id: string;
}
export interface PluridPubSubPublishMessageClosePlane {
    topic: typeof PLURID_PUBSUB_TOPIC.CLOSE_PLANE;
    data: PluridPubSubMessageClosePlane;
}
export interface PluridPubSubSubscribeMessageClosePlane {
    topic: typeof PLURID_PUBSUB_TOPIC.CLOSE_PLANE;
    callback: PluridPubSubCallback<PluridPubSubMessageClosePlane>;
}


export type PluridPubSubPublishMessage =
    | PluridPubSubPublishMessageConfiguration
    | PluridPubSubPublishMessageSpaceAnimatedTransform
    | PluridPubSubPublishMessageSpaceRotateUp
    | PluridPubSubPublishMessageSpaceRotateDown
    | PluridPubSubPublishMessageSpaceRotateLeft
    | PluridPubSubPublishMessageSpaceRotateRight
    | PluridPubSubPublishMessageSpaceRotateXWith
    | PluridPubSubPublishMessageSpaceRotateYWith
    | PluridPubSubPublishMessageSpaceRotateXTo
    | PluridPubSubPublishMessageSpaceRotateYTo
    | PluridPubSubPublishMessageSpaceTranslateUp
    | PluridPubSubPublishMessageSpaceTranslateDown
    | PluridPubSubPublishMessageSpaceTranslateLeft
    | PluridPubSubPublishMessageSpaceTranslateRight
    | PluridPubSubPublishMessageSpaceTranslateXWith
    | PluridPubSubPublishMessageSpaceTranslateYWith
    | PluridPubSubPublishMessageSpaceTranslateZWith
    | PluridPubSubPublishMessageSpaceTranslateXTo
    | PluridPubSubPublishMessageSpaceTranslateYTo
    | PluridPubSubPublishMessageSpaceTranslateZTo
    | PluridPubSubPublishMessageSpaceScaleUp
    | PluridPubSubPublishMessageSpaceScaleDown
    | PluridPubSubPublishMessageSpaceScaleWith
    | PluridPubSubPublishMessageSpaceTransform
    | PluridPubSubPublishMessageViewAddPlane
    | PluridPubSubPublishMessageViewSetPlanes
    | PluridPubSubPublishMessageViewRemovePlane
    | PluridPubSubPublishMessageNavigateToPlane
    | PluridPubSubPublishMessageRefreshPlane
    | PluridPubSubPublishMessageIsolatePlane
    | PluridPubSubPublishMessageOpenClosedPlane
    | PluridPubSubPublishMessageClosePlane
    ;


export type PluridPubSubSubscribeMessage =
    | PluridPubSubSubscribeMessageConfiguration
    | PluridPubSubSubscribeMessageSpaceAnimatedTransform
    | PluridPubSubSubscribeMessageSpaceRotateUp
    | PluridPubSubSubscribeMessageSpaceRotateDown
    | PluridPubSubSubscribeMessageSpaceRotateLeft
    | PluridPubSubSubscribeMessageSpaceRotateRight
    | PluridPubSubSubscribeMessageSpaceRotateXWith
    | PluridPubSubSubscribeMessageSpaceRotateYWith
    | PluridPubSubSubscribeMessageSpaceRotateXTo
    | PluridPubSubSubscribeMessageSpaceRotateYTo
    | PluridPubSubSubscribeMessageSpaceTranslateUp
    | PluridPubSubSubscribeMessageSpaceTranslateDown
    | PluridPubSubSubscribeMessageSpaceTranslateLeft
    | PluridPubSubSubscribeMessageSpaceTranslateRight
    | PluridPubSubSubscribeMessageSpaceTranslateXWith
    | PluridPubSubSubscribeMessageSpaceTranslateYWith
    | PluridPubSubSubscribeMessageSpaceTranslateZWith
    | PluridPubSubSubscribeMessageSpaceTranslateXTo
    | PluridPubSubSubscribeMessageSpaceTranslateYTo
    | PluridPubSubSubscribeMessageSpaceTranslateZTo
    | PluridPubSubSubscribeMessageSpaceScaleUp
    | PluridPubSubSubscribeMessageSpaceScaleDown
    | PluridPubSubSubscribeMessageSpaceScaleWith
    | PluridPubSubSubscribeMessageSpaceTransform
    | PluridPubSubSubscribeMessageViewAddPlane
    | PluridPubSubSubscribeMessageViewSetPlanes
    | PluridPubSubSubscribeMessageViewRemovePlane
    | PluridPubSubSubscribeMessageNavigateToPlane
    | PluridPubSubSubscribeMessageRefreshPlane
    | PluridPubSubSubscribeMessageIsolatePlane
    | PluridPubSubSubscribeMessageOpenClosedPlane
    | PluridPubSubSubscribeMessageClosePlane
    ;
// #endregion module
