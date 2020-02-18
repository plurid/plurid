import {
    TreePage,
    SpaceLocation,
    PluridView,
} from '@plurid/plurid-data';

import * as Types from './types'



export const setSpaceLoading = (
    payload: boolean,
): Types.SetSpaceLoadingAction => {
    return {
        type: Types.SET_SPACE_LOADING,
        payload,
    };
}


export const setAnimatedTransform = (
    payload: boolean,
): Types.SetAnimatedTransformAction => {
    return {
        type: Types.SET_ANIMATED_TRANSFORM,
        payload,
    };
}


export const setSpaceLocation = (
    payload: SpaceLocation,
): Types.SetSpaceLocationAction => {
    return {
        type: Types.SET_SPACE_LOCATION,
        payload,
    };
}



export const viewCameraMoveForward = (
): Types.ViewCameraMoveForwardAction => {
    return {
        type: Types.VIEW_CAMERA_MOVE_FORWARD,
    };
}

export const viewCameraMoveBackward = (
): Types.ViewCameraMoveBackwardAction => {
    return {
        type: Types.VIEW_CAMERA_MOVE_BACKWARD,
    };
}

export const viewCameraMoveLeft = (
): Types.ViewCameraMoveLeftAction => {
    return {
        type: Types.VIEW_CAMERA_MOVE_LEFT,
    };
}

export const viewCameraMoveRight = (
): Types.ViewCameraMoveRightAction => {
    return {
        type: Types.VIEW_CAMERA_MOVE_RIGHT,
    };
}

export const viewCameraMoveUp = (
): Types.ViewCameraMoveUpAction => {
    return {
        type: Types.VIEW_CAMERA_MOVE_UP,
    };
}

export const viewCameraMoveDown = (
): Types.ViewCameraMoveDownAction => {
    return {
        type: Types.VIEW_CAMERA_MOVE_DOWN,
    };
}


export const viewCameraTurnUp = (
): Types.ViewCameraTurnUpAction => {
    return {
        type: Types.VIEW_CAMERA_TURN_UP,
    };
}

export const viewCameraTurnDown = (
): Types.ViewCameraTurnDownAction => {
    return {
        type: Types.VIEW_CAMERA_TURN_DOWN,
    };
}

export const viewCameraTurnLeft = (
): Types.ViewCameraTurnLeftAction => {
    return {
        type: Types.VIEW_CAMERA_TURN_LEFT,
    };
}

export const viewCameraTurnRight = (
): Types.ViewCameraTurnRightAction => {
    return {
        type: Types.VIEW_CAMERA_TURN_RIGHT,
    };
}



export const rotateUp = (
): Types.RotateUpAction => {
    return {
        type: Types.ROTATE_UP,
    };
}

export const rotateDown = (
): Types.RotateDownAction => {
    return {
        type: Types.ROTATE_DOWN,
    };
}

export const rotateX = (
    payload: number,
): Types.RotateXAction => {
    return {
        type: Types.ROTATE_X,
        payload,
    };
}

export const rotateXWith = (
    payload: number,
): Types.RotateXWithAction => {
    return {
        type: Types.ROTATE_X_WITH,
        payload,
    };
}

export const rotateLeft = (
): Types.RotateLeftAction => {
    return {
        type: Types.ROTATE_LEFT,
    };
}

export const rotateRight = (
): Types.RotateRightAction => {
    return {
        type: Types.ROTATE_RIGHT,
    };
}

export const rotateY = (
    payload: number,
): Types.RotateYAction => {
    return {
        type: Types.ROTATE_Y,
        payload,
    };
}

export const rotateYWith = (
    payload: number,
): Types.RotateYWithAction => {
    return {
        type: Types.ROTATE_Y_WITH,
        payload,
    };
}


export const translateUp = (
): Types.TranslateUpAction => {
    return {
        type: Types.TRANSLATE_UP,
    };
}

export const translateDown = (
): Types.TranslateDownAction => {
    return {
        type: Types.TRANSLATE_DOWN,
    };
}

export const translateLeft = (
): Types.TranslateLeftAction => {
    return {
        type: Types.TRANSLATE_LEFT,
    };
}

export const translateRight = (
): Types.TranslateRightAction => {
    return {
        type: Types.TRANSLATE_RIGHT,
    };
}


export const translateIn = (
): Types.TranslateInAction => {
    return {
        type: Types.TRANSLATE_IN,
    };
}

export const translateOut = (
): Types.TranslateOutAction => {
    return {
        type: Types.TRANSLATE_OUT,
    };
}


export const translateXWith = (
    payload: number,
): Types.TranslateXWithAction => {
    return {
        type: Types.TRANSLATE_X_WITH,
        payload,
    };
}

export const translateYWith = (
    payload: number,
): Types.TranslateYWithAction => {
    return {
        type: Types.TRANSLATE_Y_WITH,
        payload,
    };
}


export const scaleUp = (
): Types.ScaleUpAction => {
    return {
        type: Types.SCALE_UP,
    };
}

export const scaleDown = (
): Types.ScaleDownAction => {
    return {
        type: Types.SCALE_DOWN,
    };
}


export const scaleUpWith = (
    value: number,
): Types.ScaleUpWithAction => {
    return {
        type: Types.SCALE_UP_WITH,
        payload: value,
    };
}

export const scaleDownWith = (
    value: number,
): Types.ScaleDownWithAction => {
    return {
        type: Types.SCALE_DOWN_WITH,
        payload: value,
    };
}


export const setTree = (
    payload: TreePage[],
): Types.SetTreeAction => {
    return {
        type: Types.SET_TREE,
        payload,
    };
}


export const setActiveDocument = (
    documentID: string,
): Types.SetActiveDocumentAction => {
    return {
        type: Types.SET_ACTIVE_DOCUMENT,
        payload: documentID,
    };
}


export const spaceResetTransform = (
): Types.SpaceResetTransformAction => {
    return {
        type: Types.SPACE_RESET_TRANSFORM,
    };
}


export const setViewSize = (
    payload: Types.ViewSize,
): Types.SetViewSizeAction => {
    return {
        type: Types.SET_VIEW_SIZE,
        payload,
    };
}


export const setSpaceSize = (
    payload: Types.SpaceSize,
): Types.SetSpaceSizeAction => {
    return {
        type: Types.SET_SPACE_SIZE,
        payload,
    };
}



export const updateSpaceTreePage = (
    payload: TreePage,
): Types.UpdateSpaceTreePageAction => {
    return {
        type: Types.UPDATE_SPACE_TREE_PAGE,
        payload,
    };
}


export const updateSpaceLinkCoordinates = (
    payload: Types.UpdateSpaceLinkCoordinatesPayload,
): Types.UpdateSpaceLinkCoordinatesAction => {
    return {
        type: Types.UPDATE_SPACE_LINK_COORDINATES,
        payload,
    };
}


export const spaceSetView = (
    payload: string[] | PluridView[],
): Types.SpaceSetViewAction => {
    return {
        type: Types.SPACE_SET_VIEW,
        payload,
    };
}
