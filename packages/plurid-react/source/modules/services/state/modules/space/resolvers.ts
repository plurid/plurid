import {
    /** constants */
    ROTATION_STEP,
    TRANSLATION_STEP,
    SCALE_STEP,
    SCALE_LOWER_LIMIT,
    SCALE_UPPER_LIMIT,
} from '@plurid/plurid-data';

import {
    mathematics,
} from '@plurid/plurid-functions';

import * as Types from './types';

import {
    updateTreePage,
    updateTreeByPlaneIDWithLinkCoordinates,
} from '../../../logic/tree';



const {
    toRadians,
} = mathematics.geometry;



export const setSpaceLoading = (
    state: Types.State,
    action: Types.SetSpaceLoadingAction,
): Types.State => {
    return {
        ...state,
        loading: action.payload,
    };
}


export const setAnimatedTransform = (
    state: Types.State,
    action: Types.SetAnimatedTransformAction,
): Types.State => {
    return {
        ...state,
        animatedTransform: action.payload,
    };
}


export const setSpaceLocation = (
    state: Types.State,
    action: Types.SetSpaceLocationAction,
): Types.State => {
    return {
        ...state,
        ...action.payload,
    };
}


export const viewCameraMoveForward = (
    state: Types.State,
): Types.State => {
    const translationZ = state.translationZ + TRANSLATION_STEP * 6 * Math.cos(toRadians(-state.rotationY));
    const translationX = state.translationX + TRANSLATION_STEP * 6 * Math.sin(toRadians(-state.rotationY));
    return {
        ...state,
        translationX,
        translationZ,
    };
}


export const viewCameraMoveBackward = (
    state: Types.State,
): Types.State => {
    const translationZ = state.translationZ - TRANSLATION_STEP * 6 * Math.cos(toRadians(-state.rotationY));
    const translationX = state.translationX - TRANSLATION_STEP * 6 * Math.sin(toRadians(-state.rotationY));
    return {
        ...state,
        translationX,
        translationZ,
    };
}


export const viewCameraMoveLeft = (
    state: Types.State,
): Types.State => {
    const translationX = state.translationX + TRANSLATION_STEP * 3 * Math.cos(toRadians(state.rotationY));
    const translationZ = state.translationZ + TRANSLATION_STEP * 3 * Math.sin(toRadians(state.rotationY));
    return {
        ...state,
        translationX,
        translationZ,
    };
}


export const viewCameraMoveRight = (
    state: Types.State,
): Types.State => {
    const translationX = state.translationX - TRANSLATION_STEP * 3 * Math.cos(toRadians(state.rotationY));
    const translationZ = state.translationZ - TRANSLATION_STEP * 3 * Math.sin(toRadians(state.rotationY));
    return {
        ...state,
        translationX,
        translationZ,
    };
}


export const viewCameraMoveUp = (
    state: Types.State,
): Types.State => {
    const translationY = state.translationY + TRANSLATION_STEP * 3;
    return {
        ...state,
        translationY,
    };
}


export const viewCameraMoveDown = (
    state: Types.State,
): Types.State => {
    const translationY = state.translationY - TRANSLATION_STEP * 3;
    return {
        ...state,
        translationY,
    };
}


export const viewCameraTurnUp = (
    state: Types.State,
): Types.State => {
    const rotationX = (state.rotationX + ROTATION_STEP) % 360;
    return {
        ...state,
        rotationX,
    };
}


export const viewCameraTurnDown = (
    state: Types.State,
): Types.State => {
    const rotationX = (state.rotationX - ROTATION_STEP) % 360;
    return {
        ...state,
        rotationX,
    };
}


export const viewCameraTurnLeft = (
    state: Types.State,
): Types.State => {
    const rotationY = (state.rotationY - ROTATION_STEP) % 360;
    return {
        ...state,
        rotationY,
    };
}


export const viewCameraTurnRight = (
    state: Types.State,
): Types.State => {
    const rotationY = (state.rotationY + ROTATION_STEP) % 360;
    return {
        ...state,
        rotationY,
    };
}


export const rotateUp = (
    state: Types.State,
): Types.State => {
    const rotationX = (state.rotationX + ROTATION_STEP) % 360;
    return {
        ...state,
        rotationX,
    };
}


export const rotateDown = (
    state: Types.State,
): Types.State => {
    const rotationX = (state.rotationX - ROTATION_STEP) % 360;
    return {
        ...state,
        rotationX,
    };
}


export const rotateX = (
    state: Types.State,
    action: Types.RotateXAction,
): Types.State => {
    return {
        ...state,
        rotationX: action.payload,
    };
}


export const rotateXWith = (
    state: Types.State,
    action: Types.RotateXWithAction,
): Types.State => {
    const rotationX = state.rotationX + action.payload;
    return {
        ...state,
        rotationX,
    };
}


export const rotateLeft = (
    state: Types.State,
): Types.State => {
    const rotationY = (state.rotationY + ROTATION_STEP) % 360;
    return {
        ...state,
        rotationY,
    };
}


export const rotateRight = (
    state: Types.State,
): Types.State => {
    const rotationY = (state.rotationY - ROTATION_STEP) % 360;
    return {
        ...state,
        rotationY,
    };
}


export const rotateY = (
    state: Types.State,
    action: Types.RotateYAction,
): Types.State => {
    return {
        ...state,
        rotationY: action.payload,
    };
}


export const rotateYWith = (
    state: Types.State,
    action: Types.RotateYWithAction,
): Types.State => {
    const rotationY = state.rotationY + action.payload;
    return {
        ...state,
        rotationY,
    };
}


export const translateUp = (
    state: Types.State,
): Types.State => {
    const translationY = state.translationY - TRANSLATION_STEP;
    return {
        ...state,
        translationY,
    };
}


export const translateDown = (
    state: Types.State,
): Types.State => {
    const translationY = state.translationY + TRANSLATION_STEP;
    return {
        ...state,
        translationY,
    };
}


export const translateLeft = (
    state: Types.State,
): Types.State => {
    const translationX = state.translationX - TRANSLATION_STEP * Math.cos(toRadians(state.rotationY));
    const translationZ = state.translationZ - TRANSLATION_STEP * Math.sin(toRadians(state.rotationY));
    return {
        ...state,
        translationX,
        translationZ,
    };
}


export const translateRight = (
    state: Types.State,
): Types.State => {
    const translationX = state.translationX + TRANSLATION_STEP * Math.cos(toRadians(state.rotationY));
    const translationZ = state.translationZ + TRANSLATION_STEP * Math.sin(toRadians(state.rotationY));
    return {
        ...state,
        translationX,
        translationZ,
    };
}


export const translateIn = (
    state: Types.State,
): Types.State => {
    const translationZ = state.translationZ - TRANSLATION_STEP * 3 * Math.cos(toRadians(-state.rotationY));
    const translationX = state.translationX - TRANSLATION_STEP * 3 * Math.sin(toRadians(-state.rotationY));
    return {
        ...state,
        translationX,
        translationZ,
    };
}


export const translateOut = (
    state: Types.State,
): Types.State => {
    const translationZ = state.translationZ + TRANSLATION_STEP * 3 * Math.cos(toRadians(-state.rotationY));
    const translationX = state.translationX + TRANSLATION_STEP * 3 * Math.sin(toRadians(-state.rotationY));
    return {
        ...state,
        translationX,
        translationZ,
    };
}


export const translateXWith = (
    state: Types.State,
    action: Types.TranslateXWithAction,
): Types.State => {
    const translationX = state.translationX +  action.payload * Math.cos(toRadians(state.rotationY));
    const translationZ = state.translationZ +  action.payload * Math.sin(toRadians(state.rotationY));
    return {
        ...state,
        translationX,
        translationZ,
    };
}


export const translateYWith = (
    state: Types.State,
    action: Types.TranslateYWithAction,
): Types.State => {
    const translationY = state.translationY + action.payload;
    return {
        ...state,
        translationY,
    };
}


export const scaleUp = (
    state: Types.State,
): Types.State => {
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
    state: Types.State,
): Types.State => {
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
    state: Types.State,
    action: Types.ScaleUpWithAction,
): Types.State => {
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
    state: Types.State,
    action: Types.ScaleDownWithAction,
): Types.State => {
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
    state: Types.State,
    action: Types.SetTreeAction,
): Types.State => {
    return {
        ...state,
        tree: [
            ...action.payload,
        ],
    };
}


export const setActiveDocument = (
    state: Types.State,
    action: Types.SetActiveDocumentAction,
): Types.State => {
    return {
        ...state,
        activeDocumentID: action.payload,
    };
}


export const spaceResetTransform = (
    state: Types.State,
): Types.State => {
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
    state: Types.State,
    action: Types.SetViewSizeAction,
): Types.State => {
    return {
        ...state,
        viewSize: {
            ...action.payload,
        },
    };
}


export const setSpaceSize = (
    state: Types.State,
    action: Types.SetSpaceSizeAction,
): Types.State => {
    return {
        ...state,
        spaceSize: {
            ...action.payload,
        },
    };
}


export const updateSpaceTreePage = (
    state: Types.State,
    action: Types.UpdateSpaceTreePageAction,
): Types.State => {
    const updatedTree = updateTreePage(state.tree, action.payload);

    return {
        ...state,
        tree: updatedTree,
    };
}


export const updateSpaceLinkCoordinates = (
    state: Types.State,
    action: Types.UpdateSpaceLinkCoordinatesAction,
): Types.State => {
    const {
        planeID,
        linkCoordinates,
    } = action.payload;

    const updatedTree = updateTreeByPlaneIDWithLinkCoordinates(
        state.tree,
        planeID,
        linkCoordinates,
    );

    return {
        ...state,
        tree: updatedTree,
    };
}


export const spaceSetView = (
    state: Types.State,
    action: Types.SpaceSetViewAction,
): Types.State => {
    return {
        ...state,
        view: action.payload,
    };
}
