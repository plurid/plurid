import {
    ROTATION_STEP,
    TRANSLATION_STEP,
    SCALE_STEP,
    SCALE_LOWER_LIMIT,
    SCALE_UPPER_LIMIT,
} from '@plurid/plurid-data';

import {
    toRadians,
} from '../../../utilities/geometry';

import {
    SpaceState,

    SetSpaceLoadingAction,
    SetAnimatedTransformAction,
    SetSpaceLocationAction,

    RotateXAction,
    RotateXWithAction,
    RotateYAction,
    RotateYWithAction,

    TranslateXWithAction,
    TranslateYWithAction,

    ScaleUpWithAction,
    ScaleDownWithAction,

    SetTreeAction,
    SetActiveDocumentAction,

    SetViewSizeAction,
} from './types';



export const setSpaceLoading = (
    state: SpaceState,
    action: SetSpaceLoadingAction,
): SpaceState => {
    return {
        ...state,
        loading: action.payload,
    };
}


export const setAnimatedTransform = (
    state: SpaceState,
    action: SetAnimatedTransformAction,
): SpaceState => {
    return {
        ...state,
        animatedTransform: action.payload,
    };
}


export const setSpaceLocation = (
    state: SpaceState,
    action: SetSpaceLocationAction,
): SpaceState => {
    return {
        ...state,
        ...action.payload,
    };
}


export const viewCameraMoveForward = (
    state: SpaceState,
): SpaceState => {
    const translationZ = state.translationZ + TRANSLATION_STEP * 6 * Math.cos(toRadians(-state.rotationY));
    const translationX = state.translationX + TRANSLATION_STEP * 6 * Math.sin(toRadians(-state.rotationY));
    return {
        ...state,
        translationX,
        translationZ,
    };
}


export const viewCameraMoveBackward = (
    state: SpaceState,
): SpaceState => {
    const translationZ = state.translationZ - TRANSLATION_STEP * 6 * Math.cos(toRadians(-state.rotationY));
    const translationX = state.translationX - TRANSLATION_STEP * 6 * Math.sin(toRadians(-state.rotationY));
    return {
        ...state,
        translationX,
        translationZ,
    };
}


export const viewCameraMoveLeft = (
    state: SpaceState,
): SpaceState => {
    const translationX = state.translationX + TRANSLATION_STEP * 3 * Math.cos(toRadians(state.rotationY));
    const translationZ = state.translationZ + TRANSLATION_STEP * 3 * Math.sin(toRadians(state.rotationY));
    return {
        ...state,
        translationX,
        translationZ,
    };
}


export const viewCameraMoveRight = (
    state: SpaceState,
): SpaceState => {
    const translationX = state.translationX - TRANSLATION_STEP * 3 * Math.cos(toRadians(state.rotationY));
    const translationZ = state.translationZ - TRANSLATION_STEP * 3 * Math.sin(toRadians(state.rotationY));
    return {
        ...state,
        translationX,
        translationZ,
    };
}


export const viewCameraMoveUp = (
    state: SpaceState,
): SpaceState => {
    const translationY = state.translationY + TRANSLATION_STEP * 3;
    return {
        ...state,
        translationY,
    };
}


export const viewCameraMoveDown = (
    state: SpaceState,
): SpaceState => {
    const translationY = state.translationY - TRANSLATION_STEP * 3;
    return {
        ...state,
        translationY,
    };
}


export const viewCameraTurnUp = (
    state: SpaceState,
): SpaceState => {
    const rotationX = (state.rotationX + ROTATION_STEP) % 360;
    return {
        ...state,
        rotationX,
    };
}


export const viewCameraTurnDown = (
    state: SpaceState,
): SpaceState => {
    const rotationX = (state.rotationX - ROTATION_STEP) % 360;
    return {
        ...state,
        rotationX,
    };
}


export const viewCameraTurnLeft = (
    state: SpaceState,
): SpaceState => {
    const rotationY = (state.rotationY - ROTATION_STEP) % 360;
    return {
        ...state,
        rotationY,
    };
}


export const viewCameraTurnRight = (
    state: SpaceState,
): SpaceState => {
    const rotationY = (state.rotationY + ROTATION_STEP) % 360;
    return {
        ...state,
        rotationY,
    };
}


export const rotateUp = (
    state: SpaceState,
): SpaceState => {
    const rotationX = (state.rotationX + ROTATION_STEP) % 360;
    return {
        ...state,
        rotationX,
    };
}


export const rotateDown = (
    state: SpaceState,
): SpaceState => {
    const rotationX = (state.rotationX - ROTATION_STEP) % 360;
    return {
        ...state,
        rotationX,
    };
}


export const rotateX = (
    state: SpaceState,
    action: RotateXAction,
): SpaceState => {
    return {
        ...state,
        rotationX: action.payload,
    };
}


export const rotateXWith = (
    state: SpaceState,
    action: RotateXWithAction,
): SpaceState => {
    const rotationX = state.rotationX + action.payload;
    return {
        ...state,
        rotationX,
    };
}


export const rotateLeft = (
    state: SpaceState,
): SpaceState => {
    const rotationY = (state.rotationY + ROTATION_STEP) % 360;
    return {
        ...state,
        rotationY,
    };
}


export const rotateRight = (
    state: SpaceState,
): SpaceState => {
    const rotationY = (state.rotationY - ROTATION_STEP) % 360;
    return {
        ...state,
        rotationY,
    };
}


export const rotateY = (
    state: SpaceState,
    action: RotateYAction,
): SpaceState => {
    return {
        ...state,
        rotationY: action.payload,
    };
}


export const rotateYWith = (
    state: SpaceState,
    action: RotateYWithAction,
): SpaceState => {
    const rotationY = state.rotationY + action.payload;
    return {
        ...state,
        rotationY,
    };
}


export const translateUp = (
    state: SpaceState,
): SpaceState => {
    const translationY = state.translationY - TRANSLATION_STEP;
    return {
        ...state,
        translationY,
    };
}


export const translateDown = (
    state: SpaceState,
): SpaceState => {
    const translationY = state.translationY + TRANSLATION_STEP;
    return {
        ...state,
        translationY,
    };
}


export const translateLeft = (
    state: SpaceState,
): SpaceState => {
    const translationX = state.translationX - TRANSLATION_STEP * Math.cos(toRadians(state.rotationY));
    const translationZ = state.translationZ - TRANSLATION_STEP * Math.sin(toRadians(state.rotationY));
    return {
        ...state,
        translationX,
        translationZ,
    };
}


export const translateRight = (
    state: SpaceState,
): SpaceState => {
    const translationX = state.translationX + TRANSLATION_STEP * Math.cos(toRadians(state.rotationY));
    const translationZ = state.translationZ + TRANSLATION_STEP * Math.sin(toRadians(state.rotationY));
    return {
        ...state,
        translationX,
        translationZ,
    };
}


export const translateIn = (
    state: SpaceState,
): SpaceState => {
    const translationZ = state.translationZ - TRANSLATION_STEP * 3 * Math.cos(toRadians(-state.rotationY));
    const translationX = state.translationX - TRANSLATION_STEP * 3 * Math.sin(toRadians(-state.rotationY));
    return {
        ...state,
        translationX,
        translationZ,
    };
}


export const translateOut = (
    state: SpaceState,
): SpaceState => {
    const translationZ = state.translationZ + TRANSLATION_STEP * 3 * Math.cos(toRadians(-state.rotationY));
    const translationX = state.translationX + TRANSLATION_STEP * 3 * Math.sin(toRadians(-state.rotationY));
    return {
        ...state,
        translationX,
        translationZ,
    };
}


export const translateXWith = (
    state: SpaceState,
    action: TranslateXWithAction,
): SpaceState => {
    const translationX = state.translationX + action.payload;
    return {
        ...state,
        translationX,
    };
}


export const translateYWith = (
    state: SpaceState,
    action: TranslateYWithAction,
): SpaceState => {
    const translationY = state.translationY + action.payload;
    return {
        ...state,
        translationY,
    };
}


export const scaleUp = (
    state: SpaceState,
): SpaceState => {
    const computedScale = state.scale + SCALE_STEP;
    const scale = computedScale < SCALE_UPPER_LIMIT
        ? computedScale
        : SCALE_UPPER_LIMIT;
    return {
        ...state,
        scale,
    };
}


export const scaleDown = (
    state: SpaceState,
): SpaceState => {
    const computedScale = state.scale - SCALE_STEP;
    const scale = computedScale > SCALE_LOWER_LIMIT
        ? computedScale
        : SCALE_LOWER_LIMIT;
    return {
        ...state,
        scale,
    };
}


export const scaleUpWith = (
    state: SpaceState,
    action: ScaleUpWithAction,
): SpaceState => {
    const computedScale = state.scale + Math.abs(action.payload);
    const scale = computedScale < SCALE_UPPER_LIMIT
        ? computedScale
        : SCALE_UPPER_LIMIT;

    return {
        ...state,
        scale,
    };
}



export const scaleDownWith = (
    state: SpaceState,
    action: ScaleDownWithAction,
): SpaceState => {
    const computedScale = state.scale - Math.abs(action.payload);
    const scale = computedScale > SCALE_LOWER_LIMIT
        ? computedScale
        : SCALE_LOWER_LIMIT;

    return {
        ...state,
        scale,
    };
}



export const setTree = (
    state: SpaceState,
    action: SetTreeAction,
): SpaceState => {
    return {
        ...state,
        tree: [
            ...action.payload,
        ],
    };
}


export const setActiveDocument = (
    state: SpaceState,
    action: SetActiveDocumentAction,
): SpaceState => {
    return {
        ...state,
        activeDocumentID: action.payload,
    };
}


export const spaceResetTransform = (
    state: SpaceState,
): SpaceState => {
    return {
        ...state,
        scale: 1,
        rotationX: 0,
        rotationY: 0,
        translationX: 0,
        translationY: 0,
        translationZ: 0,
    };
}


export const setViewSize = (
    state: SpaceState,
    action: SetViewSizeAction,
): SpaceState => {
    return {
        ...state,
        viewSize: action.payload,
    };
}
