import {
    TreePage,
} from '../../../../data/interfaces';

import {
    SET_SPACE_LOADING,
    SetSpaceLoadingAction,
    SET_SPACE_LOCATION,
    SetSpaceLocationAction,
    SpaceLocation,

    ROTATE_UP,
    RotateUpAction,
    ROTATE_DOWN,
    RotateDownAction,
    ROTATE_LEFT,
    RotateLeftAction,
    ROTATE_RIGHT,
    RotateRightAction,

    TRANSLATE_UP,
    TranslateUpAction,
    TRANSLATE_DOWN,
    TranslateDownAction,
    TRANSLATE_LEFT,
    TranslateLeftAction,
    TRANSLATE_RIGHT,
    TranslateRightAction,

    SCALE_UP,
    ScaleUpAction,
    SCALE_DOWN,
    ScaleDownAction,

    SET_TREE,
    SetTreeAction,
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
