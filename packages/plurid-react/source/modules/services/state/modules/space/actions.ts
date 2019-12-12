import {
    TreePage,
    SpaceLocation,
} from '@plurid/plurid-data';

import {
    SET_SPACE_LOADING,
    SetSpaceLoadingAction,

    SET_ANIMATED_TRANSFORM,
    SetAnimatedTransformAction,

    SET_SPACE_LOCATION,
    SetSpaceLocationAction,

    VIEW_CAMERA_MOVE_FORWARD,
    ViewCameraMoveForwardAction,
    VIEW_CAMERA_MOVE_BACKWARD,
    ViewCameraMoveBackwardAction,
    VIEW_CAMERA_MOVE_LEFT,
    ViewCameraMoveLeftAction,
    VIEW_CAMERA_MOVE_RIGHT,
    ViewCameraMoveRightAction,
    VIEW_CAMERA_MOVE_UP,
    ViewCameraMoveUpAction,
    VIEW_CAMERA_MOVE_DOWN,
    ViewCameraMoveDownAction,

    VIEW_CAMERA_TURN_UP,
    ViewCameraTurnUpAction,
    VIEW_CAMERA_TURN_DOWN,
    ViewCameraTurnDownAction,
    VIEW_CAMERA_TURN_LEFT,
    ViewCameraTurnLeftAction,
    VIEW_CAMERA_TURN_RIGHT,
    ViewCameraTurnRightAction,

    ROTATE_UP,
    RotateUpAction,
    ROTATE_DOWN,
    RotateDownAction,
    ROTATE_X,
    RotateXAction,
    ROTATE_X_WITH,
    RotateXWithAction,
    ROTATE_LEFT,
    RotateLeftAction,
    ROTATE_RIGHT,
    RotateRightAction,
    ROTATE_Y,
    RotateYAction,
    ROTATE_Y_WITH,
    RotateYWithAction,

    TRANSLATE_UP,
    TranslateUpAction,
    TRANSLATE_DOWN,
    TranslateDownAction,
    TRANSLATE_LEFT,
    TranslateLeftAction,
    TRANSLATE_RIGHT,
    TranslateRightAction,
    TRANSLATE_IN,
    TranslateInAction,
    TRANSLATE_OUT,
    TranslateOutAction,
    TRANSLATE_X_WITH,
    TranslateXWithAction,
    TRANSLATE_Y_WITH,
    TranslateYWithAction,

    SCALE_UP,
    ScaleUpAction,
    SCALE_DOWN,
    ScaleDownAction,
    SCALE_UP_WITH,
    ScaleUpWithAction,
    SCALE_DOWN_WITH,
    ScaleDownWithAction,

    SET_TREE,
    SetTreeAction,

    SET_ACTIVE_DOCUMENT,
    SetActiveDocumentAction,

    SPACE_RESET_TRANSFORM,
    SpaceResetTransformAction,
} from './types'



export const setSpaceLoading = (payload: boolean): SetSpaceLoadingAction => {
    return {
        type: SET_SPACE_LOADING,
        payload,
    };
}


export const setAnimatedTransform = (payload: boolean): SetAnimatedTransformAction => {
    return {
        type: SET_ANIMATED_TRANSFORM,
        payload,
    };
}


export const setSpaceLocation = (payload: SpaceLocation): SetSpaceLocationAction => {
    return {
        type: SET_SPACE_LOCATION,
        payload,
    };
}



export const viewCameraMoveForward = (): ViewCameraMoveForwardAction => {
    return {
        type: VIEW_CAMERA_MOVE_FORWARD,
    };
}

export const viewCameraMoveBackward = (): ViewCameraMoveBackwardAction => {
    return {
        type: VIEW_CAMERA_MOVE_BACKWARD,
    };
}

export const viewCameraMoveLeft = (): ViewCameraMoveLeftAction => {
    return {
        type: VIEW_CAMERA_MOVE_LEFT,
    };
}

export const viewCameraMoveRight = (): ViewCameraMoveRightAction => {
    return {
        type: VIEW_CAMERA_MOVE_RIGHT,
    };
}

export const viewCameraMoveUp = (): ViewCameraMoveUpAction => {
    return {
        type: VIEW_CAMERA_MOVE_UP,
    };
}

export const viewCameraMoveDown = (): ViewCameraMoveDownAction => {
    return {
        type: VIEW_CAMERA_MOVE_DOWN,
    };
}


export const viewCameraTurnUp = (): ViewCameraTurnUpAction => {
    return {
        type: VIEW_CAMERA_TURN_UP,
    };
}

export const viewCameraTurnDown = (): ViewCameraTurnDownAction => {
    return {
        type: VIEW_CAMERA_TURN_DOWN,
    };
}

export const viewCameraTurnLeft = (): ViewCameraTurnLeftAction => {
    return {
        type: VIEW_CAMERA_TURN_LEFT,
    };
}

export const viewCameraTurnRight = (): ViewCameraTurnRightAction => {
    return {
        type: VIEW_CAMERA_TURN_RIGHT,
    };
}



export const rotateUp = (): RotateUpAction => {
    return {
        type: ROTATE_UP,
    };
}

export const rotateDown = (): RotateDownAction => {
    return {
        type: ROTATE_DOWN,
    };
}

export const rotateX = (payload: number): RotateXAction => {
    return {
        type: ROTATE_X,
        payload,
    };
}

export const rotateXWith = (payload: number): RotateXWithAction => {
    return {
        type: ROTATE_X_WITH,
        payload,
    };
}

export const rotateLeft = (): RotateLeftAction => {
    return {
        type: ROTATE_LEFT,
    };
}

export const rotateRight = (): RotateRightAction => {
    return {
        type: ROTATE_RIGHT,
    };
}

export const rotateY = (payload: number): RotateYAction => {
    return {
        type: ROTATE_Y,
        payload,
    };
}

export const rotateYWith = (payload: number): RotateYWithAction => {
    return {
        type: ROTATE_Y_WITH,
        payload,
    };
}


export const translateUp = (): TranslateUpAction => {
    return {
        type: TRANSLATE_UP,
    };
}

export const translateDown = (): TranslateDownAction => {
    return {
        type: TRANSLATE_DOWN,
    };
}

export const translateLeft = (): TranslateLeftAction => {
    return {
        type: TRANSLATE_LEFT,
    };
}

export const translateRight = (): TranslateRightAction => {
    return {
        type: TRANSLATE_RIGHT,
    };
}


export const translateIn = (): TranslateInAction => {
    return {
        type: TRANSLATE_IN,
    };
}

export const translateOut = (): TranslateOutAction => {
    return {
        type: TRANSLATE_OUT,
    };
}


export const translateXWith = (payload: number): TranslateXWithAction => {
    return {
        type: TRANSLATE_X_WITH,
        payload,
    };
}

export const translateYWith = (payload: number): TranslateYWithAction => {
    return {
        type: TRANSLATE_Y_WITH,
        payload,
    };
}


export const scaleUp = (): ScaleUpAction => {
    return {
        type: SCALE_UP,
    };
}

export const scaleDown = (): ScaleDownAction => {
    return {
        type: SCALE_DOWN,
    };
}


export const scaleUpWith = (value: number): ScaleUpWithAction => {
    return {
        type: SCALE_UP_WITH,
        payload: value,
    };
}

export const scaleDownWith = (value: number): ScaleDownWithAction => {
    return {
        type: SCALE_DOWN_WITH,
        payload: value,
    };
}


export const setTree = (payload: TreePage[]): SetTreeAction => {
    return {
        type: SET_TREE,
        payload,
    };
}


export const setActiveDocument = (documentID: string): SetActiveDocumentAction => {
    return {
        type: SET_ACTIVE_DOCUMENT,
        payload: documentID,
    };
}


export const spaceResetTransform = (): SpaceResetTransformAction => {
    return {
        type: SPACE_RESET_TRANSFORM,
    };
}
