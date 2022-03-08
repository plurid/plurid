// #region imports
    // #region libraries
    import {
        mathematics,
        objects,
    } from '@plurid/plurid-functions';

    import {
        /** constants */
        ROTATION_STEP,
        TRANSLATION_STEP,
        SCALE_STEP,
        SCALE_LOWER_LIMIT,
        SCALE_UPPER_LIMIT,
    } from '@plurid/plurid-data';

    import {
        general as generalEngine,
    } from '@plurid/plurid-engine';
    // #endregion libraries


    // #region external
    import * as Types from '../types';

    import {
        computeMatrix,
    } from '~services/logic/transform';
    // #endregion external
// #endregion imports



// #region module
const {
    toRadians,
} = mathematics.geometry;



const getNewState = (
    state: Types.State,
) => objects.clone(state, 'any');


export const setSpaceField = (
    state: Types.State,
    action: Types.SetSpaceFieldAction,
): Types.State => {
    const {
        field,
        value,
    } = action.payload;

    const newState = getNewState(state);
    (newState as any)[field] = value;

    return {
        ...state,
    };
}


export const setSpaceLoading = (
    state: Types.State,
    action: Types.SetSpaceLoadingAction,
): Types.State => {
    return {
        ...state,
        loading: action.payload,
    };
}


export const setTransform = (
    state: Types.State,
    action: Types.SetTransformAction,
): Types.State => {
    const {
        translationX,
        translationY,
        translationZ,
        rotationX,
        rotationY,
        scale,
    } = action.payload;

    const resolvedTranslationX = translationX ?? state.translationX;
    const resolvedTranslationY = translationY ?? state.translationY;
    const resolvedTranslationZ = translationZ ?? state.translationZ;
    const resolvedRotationX = rotationX ?? state.rotationX;
    const resolvedRotationY = rotationY ?? state.rotationY;
    const resolvedScale = scale ?? state.scale;

    return {
        ...state,
        translationX: resolvedTranslationX,
        translationY: resolvedTranslationY,
        translationZ: resolvedTranslationZ,
        rotationX: resolvedRotationX,
        rotationY: resolvedRotationY,
        scale: resolvedScale,
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


export const setTransformTime = (
    state: Types.State,
    action: Types.SetTransformTimeAction,
): Types.State => {
    return {
        ...state,
        transformTime: action.payload,
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
    const newState = getNewState(state);
    newState.translationZ = state.translationZ + TRANSLATION_STEP * 6 * Math.cos(toRadians(-state.rotationY));
    newState.translationX = state.translationX + TRANSLATION_STEP * 6 * Math.sin(toRadians(-state.rotationY));
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const viewCameraMoveBackward = (
    state: Types.State,
): Types.State => {
    const newState = getNewState(state);
    newState.translationZ = state.translationZ - TRANSLATION_STEP * 6 * Math.cos(toRadians(-state.rotationY));
    newState.translationX = state.translationX - TRANSLATION_STEP * 6 * Math.sin(toRadians(-state.rotationY));
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const viewCameraMoveLeft = (
    state: Types.State,
): Types.State => {
    const newState = getNewState(state);
    newState.translationX = state.translationX + TRANSLATION_STEP * 3 * Math.cos(toRadians(state.rotationY));
    newState.translationZ = state.translationZ + TRANSLATION_STEP * 3 * Math.sin(toRadians(state.rotationY));
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const viewCameraMoveRight = (
    state: Types.State,
): Types.State => {
    const newState = getNewState(state);
    newState.translationX = state.translationX - TRANSLATION_STEP * 3 * Math.cos(toRadians(state.rotationY));
    newState.translationZ = state.translationZ - TRANSLATION_STEP * 3 * Math.sin(toRadians(state.rotationY));
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const viewCameraMoveUp = (
    state: Types.State,
): Types.State => {
    const newState = getNewState(state);
    newState.translationY = state.translationY + TRANSLATION_STEP * 3;
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const viewCameraMoveDown = (
    state: Types.State,
): Types.State => {
    const newState = getNewState(state);
    newState.translationY = state.translationY - TRANSLATION_STEP * 3;
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const viewCameraTurnUp = (
    state: Types.State,
): Types.State => {
    const newState = getNewState(state);
    newState.rotationX = (state.rotationX + ROTATION_STEP) % 360;
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const viewCameraTurnDown = (
    state: Types.State,
): Types.State => {
    const newState = getNewState(state);
    newState.rotationX = (state.rotationX - ROTATION_STEP) % 360;
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const viewCameraTurnLeft = (
    state: Types.State,
): Types.State => {
    const newState = getNewState(state);
    newState.rotationY = (state.rotationY - ROTATION_STEP) % 360;
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const viewCameraTurnRight = (
    state: Types.State,
): Types.State => {
    const newState = getNewState(state);
    newState.rotationY = (state.rotationY + ROTATION_STEP) % 360;
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const rotateUp = (
    state: Types.State,
): Types.State => {
    const newState = getNewState(state);
    newState.rotationX = (state.rotationX + ROTATION_STEP) % 360;
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const rotateDown = (
    state: Types.State,
): Types.State => {
    const newState = getNewState(state);
    newState.rotationX = (state.rotationX - ROTATION_STEP) % 360;
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const rotateX = (
    state: Types.State,
    action: Types.RotateXAction,
): Types.State => {
    const newState = getNewState(state);
    newState.rotationX = action.payload;
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const rotateXWith = (
    state: Types.State,
    action: Types.RotateXWithAction,
): Types.State => {
    const newState = getNewState(state);
    newState.rotationX = state.rotationX + action.payload;
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const rotateLeft = (
    state: Types.State,
): Types.State => {
    const newState = getNewState(state);
    newState.rotationY = (state.rotationY + ROTATION_STEP) % 360;
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const rotateRight = (
    state: Types.State,
): Types.State => {
    const newState = getNewState(state);
    newState.rotationY = (state.rotationY - ROTATION_STEP) % 360;
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const rotateY = (
    state: Types.State,
    action: Types.RotateYAction,
): Types.State => {
    const newState = getNewState(state);
    newState.rotationY = action.payload;
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const rotateYWith = (
    state: Types.State,
    action: Types.RotateYWithAction,
): Types.State => {
    const newState = getNewState(state);
    newState.rotationY = state.rotationY + action.payload;
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const translateUp = (
    state: Types.State,
): Types.State => {
    const newState = getNewState(state);
    newState.translationY = state.translationY - TRANSLATION_STEP;
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const translateDown = (
    state: Types.State,
): Types.State => {
    const newState = getNewState(state);
    newState.translationY = state.translationY + TRANSLATION_STEP;
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const translateLeft = (
    state: Types.State,
): Types.State => {
    const newState = getNewState(state);
    newState.translationX = state.translationX - TRANSLATION_STEP * Math.cos(toRadians(state.rotationY));
    newState.translationZ = state.translationZ - TRANSLATION_STEP * Math.sin(toRadians(state.rotationY));
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const translateRight = (
    state: Types.State,
): Types.State => {
    const newState = getNewState(state);
    newState.translationX = state.translationX + TRANSLATION_STEP * Math.cos(toRadians(state.rotationY));
    newState.translationZ = state.translationZ + TRANSLATION_STEP * Math.sin(toRadians(state.rotationY));
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const translateIn = (
    state: Types.State,
): Types.State => {
    const newState = getNewState(state);
    newState.translationZ = state.translationZ - TRANSLATION_STEP * 3 * Math.cos(toRadians(-state.rotationY));
    newState.translationX = state.translationX - TRANSLATION_STEP * 3 * Math.sin(toRadians(-state.rotationY));
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const translateOut = (
    state: Types.State,
): Types.State => {
    const newState = getNewState(state);
    newState.translationZ = state.translationZ + TRANSLATION_STEP * 3 * Math.cos(toRadians(-state.rotationY));
    newState.translationX = state.translationX + TRANSLATION_STEP * 3 * Math.sin(toRadians(-state.rotationY));
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const translateXWith = (
    state: Types.State,
    action: Types.TranslateXWithAction,
): Types.State => {
    const newState = getNewState(state);
    newState.translationX = state.translationX +  action.payload * Math.cos(toRadians(state.rotationY));
    newState.translationZ = state.translationZ +  action.payload * Math.sin(toRadians(state.rotationY));
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const translateYWith = (
    state: Types.State,
    action: Types.TranslateYWithAction,
): Types.State => {
    const newState = getNewState(state);
    newState.translationY = state.translationY + action.payload;
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const scaleUp = (
    state: Types.State,
): Types.State => {
    const computedScale = state.scale + SCALE_STEP;
    const scale = computedScale < SCALE_UPPER_LIMIT
        ? computedScale
        : SCALE_UPPER_LIMIT;

    const newState = getNewState(state);
    newState.scale = scale;
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const scaleDown = (
    state: Types.State,
): Types.State => {
    const computedScale = state.scale - SCALE_STEP;
    const scale = computedScale > SCALE_LOWER_LIMIT
        ? computedScale
        : SCALE_LOWER_LIMIT;

    const newState = getNewState(state);
    newState.scale = scale;
    newState.transform = computeMatrix(state);

    return {
        ...newState,
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

    const newState = getNewState(state);
    newState.scale = scale;
    newState.transform = computeMatrix(state);

    return {
        ...newState,
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

    const newState = getNewState(state);
    newState.scale = scale;
    newState.transform = computeMatrix(state);

    return {
        ...newState,
    };
}


export const setInitialTree = (
    state: Types.State,
    action: Types.SetInitialTreeAction,
): Types.State => {
    return {
        ...state,
        initialTree: [
            ...action.payload,
        ],
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


export const setActiveUniverse = (
    state: Types.State,
    action: Types.SetActiveUniverseAction,
): Types.State => {
    return {
        ...state,
        activeUniverseID: action.payload,
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


export const updateSpaceTreePlane = (
    state: Types.State,
    action: Types.UpdateSpaceTreePlaneAction,
): Types.State => {
    const updatedTree = generalEngine.tree.updateTreePlane(state.tree, action.payload);

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

    const updatedTree = generalEngine.tree.updateTreeByPlaneIDWithLinkCoordinates(
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


export const spaceSetCulledView = (
    state: Types.State,
    action: Types.SpaceSetCulledViewAction,
): Types.State => {
    return {
        ...state,
        culledView: action.payload,
    };
}
// #endregion module
