import {
    TreePage,
    SpaceLocation,
} from '@plurid/plurid-data';

import {
    SET_SPACE_LOADING,
    SetSpaceLoadingAction,
    SET_SPACE_LOCATION,
    SetSpaceLocationAction,

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
    TRANSLATE_X_WITH,
    TranslateXWithAction,
    TRANSLATE_Y_WITH,
    TranslateYWithAction,

    SCALE_UP,
    ScaleUpAction,
    SCALE_DOWN,
    ScaleDownAction,

    SET_TREE,
    SetTreeAction,

    TOGGLE_ROTATION_LOCKED,
    ToggleRotationLockedAction,
    TOGGLE_TRANSLATION_LOCKED,
    ToggleTranslationLockedAction,
    TOGGLE_SCALE_LOCKED,
    ToggleScaleLockedAction,

    SET_ACTIVE_DOCUMENT,
    SetActiveDocumentAction,
} from './types'



export const setSpaceLoading = (payload: boolean): SetSpaceLoadingAction => {
    return {
        type: SET_SPACE_LOADING,
        payload,
    };
}

export const setSpaceLocation = (payload: SpaceLocation): SetSpaceLocationAction => {
    return {
        type: SET_SPACE_LOCATION,
        payload,
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


export const setTree = (payload: TreePage[]): SetTreeAction => {
    return {
        type: SET_TREE,
        payload,
    };
}


export const toggleRotationLocked = (): ToggleRotationLockedAction => {
    return {
        type: TOGGLE_ROTATION_LOCKED,
    };
}


export const toggleTranslationLocked = (): ToggleTranslationLockedAction => {
    return {
        type: TOGGLE_TRANSLATION_LOCKED,
    };
}


export const toggleScaleLocked = (): ToggleScaleLockedAction => {
    return {
        type: TOGGLE_SCALE_LOCKED,
    };
}


export const setActiveDocument = (documentID: string): SetActiveDocumentAction => {
    return {
        type: SET_ACTIVE_DOCUMENT,
        payload: documentID,
    };
}
