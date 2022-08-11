// #region imports
    // #region libraries
    import {
        createSlice,
        PayloadAction,
    } from '@reduxjs/toolkit';


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

        TreePlane,
        SpaceLocation,
        LinkCoordinates,
        PluridApplicationView,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        computeMatrix,
    } from '~services/logic/transform';

    import {
        generalEngine,
    } from '~services/engine';
    // #endregion external


    // #region internal
    import type {
        AppState,
    } from '~services/state/store';
    // #endregion internal
// #endregion imports



// #region module
const {
    toRadians,
} = mathematics.geometry;


export interface ViewSize {
    width: number;
    height: number;
}

export interface SpaceSize {
    width: number;
    height: number;
    depth: number;
    topCorner: {
        x: number;
        y: number;
        z: number;
    };
}

export interface Coordinates {
    x: number;
    y: number;
    z: number;
}

export interface SpaceState {
    loading: boolean;
    transform: string;
    animatedTransform: boolean;
    transformTime: number;
    scale: number;
    rotationX: number;
    rotationY: number;
    translationX: number;
    translationY: number;
    translationZ: number;
    initialTree: TreePlane[];
    tree: TreePlane[];
    activeUniverseID: string;
    camera: Coordinates;
    viewSize: ViewSize;
    spaceSize: SpaceSize;
    view: PluridApplicationView;
    culledView: PluridApplicationView;
    activePlaneID: string;
    isolatePlane: string;
    lastClosedPlane: string;
}


const initialState: SpaceState = {
    loading: true,
    transform: 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)',
    animatedTransform: false,
    transformTime: 450,
    scale: 1,
    rotationX: 0,
    rotationY: 0,
    translationX: 0,
    translationY: 0,
    translationZ: 0,
    initialTree: [],
    tree: [],
    activeUniverseID: '',
    camera: {
        x: 0,
        y: 0,
        z: 0,
    },
    viewSize: {
        width: typeof window === 'undefined' ? 1440 : window.innerWidth,
        height: typeof window === 'undefined' ? 821 : window.innerHeight,
    },
    spaceSize: {
        width: typeof window === 'undefined' ? 1440 : window.innerWidth,
        height: typeof window === 'undefined' ? 821 : window.innerHeight,
        depth: 0,
        topCorner: {
            x: 0,
            y: 0,
            z: 0,
        },
    },
    view: [],
    culledView: [],
    activePlaneID: '',
    isolatePlane: '',
    lastClosedPlane: '',
};


export const space = createSlice({
    name: 'space,',
    initialState,
    reducers: {
        setSpaceField: (
            state,
            action: PayloadAction<any>,
            // action: Types.SetSpaceFieldAction,
        ) => {
            const {
                field,
                value,
            } = action.payload;

            (state as any)[field] = value;
        },
        setSpaceLoading: (
            state,
            action: PayloadAction<any>,
            // action: Types.SetSpaceLoadingAction,
        ) => {
            return {
                ...state,
                loading: action.payload,
            };
        },
        changeTransform: (
            state,
            action: PayloadAction<any>,
            // action: Types.ChangeTransformAction,
        ) => {
            const {
                type,
                kind,
                value,
            } = action.payload;

            return state;
        },
        setTransform: (
            state,
            action: PayloadAction<any>,
            // action: Types.SetTransformAction,
        ) => {
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
        },
        setAnimatedTransform: (
            state,
            action: PayloadAction<any>,
            // action: Types.SetAnimatedTransformAction,
        ) => {
            return {
                ...state,
                animatedTransform: action.payload,
            };
        },
        setTransformTime: (
            state,
            action: PayloadAction<any>,
            // action: Types.SetTransformTimeAction,
        ) => {
            return {
                ...state,
                transformTime: action.payload,
            };
        },
        setSpaceLocation: (
            state,
            action: PayloadAction<any>,
            // action: Types.SetSpaceLocationAction,
        ) => {
            return {
                ...state,
                ...action.payload,
            };
        },
        viewCameraMoveForward: (
            state,
        ) => {
            state.translationZ = state.translationZ + TRANSLATION_STEP * 6 * Math.cos(toRadians(-state.rotationY));
            state.translationX = state.translationX + TRANSLATION_STEP * 6 * Math.sin(toRadians(-state.rotationY));
            state.transform = computeMatrix(state);
        },
        viewCameraMoveBackward: (
            state,
        ) => {
            state.translationZ = state.translationZ - TRANSLATION_STEP * 6 * Math.cos(toRadians(-state.rotationY));
            state.translationX = state.translationX - TRANSLATION_STEP * 6 * Math.sin(toRadians(-state.rotationY));
            state.transform = computeMatrix(state);
        },
        viewCameraMoveLeft: (
            state,
        ) => {
            state.translationX = state.translationX + TRANSLATION_STEP * 3 * Math.cos(toRadians(state.rotationY));
            state.translationZ = state.translationZ + TRANSLATION_STEP * 3 * Math.sin(toRadians(state.rotationY));
            state.transform = computeMatrix(state);
        },
        viewCameraMoveRight: (
            state,
        ) => {
            state.translationX = state.translationX - TRANSLATION_STEP * 3 * Math.cos(toRadians(state.rotationY));
            state.translationZ = state.translationZ - TRANSLATION_STEP * 3 * Math.sin(toRadians(state.rotationY));
            state.transform = computeMatrix(state);
        },
        viewCameraMoveUp: (
            state,
        ) => {
            state.translationY = state.translationY + TRANSLATION_STEP * 3;
            state.transform = computeMatrix(state);
        },
        viewCameraMoveDown: (
            state,
        ) => {
            state.translationY = state.translationY - TRANSLATION_STEP * 3;
            state.transform = computeMatrix(state);
        },
        viewCameraTurnUp: (
            state,
        ) => {
            state.rotationX = (state.rotationX + ROTATION_STEP) % 360;
            state.transform = computeMatrix(state);
        },
        viewCameraTurnDown: (
            state,
        ) => {
            state.rotationX = (state.rotationX - ROTATION_STEP) % 360;
            state.transform = computeMatrix(state);
        },
        viewCameraTurnLeft: (
            state,
        ) => {
            state.rotationY = (state.rotationY - ROTATION_STEP) % 360;
            state.transform = computeMatrix(state);
        },
        viewCameraTurnRight: (
            state,
        ) => {
            state.rotationY = (state.rotationY + ROTATION_STEP) % 360;
            state.transform = computeMatrix(state);
        },
        rotateUp: (
            state,
        ) => {
            state.rotationX = (state.rotationX + ROTATION_STEP) % 360;
            state.transform = computeMatrix(state);
        },
        rotateDown: (
            state,
        ) => {
            state.rotationX = (state.rotationX - ROTATION_STEP) % 360;
            state.transform = computeMatrix(state);
        },
        rotateX: (
            state,
            action: PayloadAction<any>,
            // action: Types.RotateXAction,
        ) => {
            state.rotationX = action.payload;
            state.transform = computeMatrix(state);
        },
        rotateXWith: (
            state,
            action: PayloadAction<any>,
            // action: Types.RotateXWithAction,
        ) => {
            state.rotationX = state.rotationX + action.payload;
            state.transform = computeMatrix(state);
        },
        rotateLeft: (
            state,
        ) => {
            state.rotationY = (state.rotationY + ROTATION_STEP) % 360;
            state.transform = computeMatrix(state);
        },
        rotateRight: (
            state,
        ) => {
            state.rotationY = (state.rotationY - ROTATION_STEP) % 360;
            state.transform = computeMatrix(state);
        },
        rotateY: (
            state,
            action: PayloadAction<any>,
            // action: Types.RotateYAction,
        ) => {
            state.rotationY = action.payload;
            state.transform = computeMatrix(state);
        },
        rotateYWith: (
            state,
            action: PayloadAction<any>,
            // action: Types.RotateYWithAction,
        ) => {
            state.rotationY = state.rotationY + action.payload;
            state.transform = computeMatrix(state);
        },
        translateUp: (
            state,
        ) => {
            state.translationY = state.translationY - TRANSLATION_STEP;
            state.transform = computeMatrix(state);
        },
        translateDown: (
            state,
        ) => {
            state.translationY = state.translationY + TRANSLATION_STEP;
            state.transform = computeMatrix(state);
        },
        translateLeft: (
            state,
        ) => {
            state.translationX = state.translationX - TRANSLATION_STEP * Math.cos(toRadians(state.rotationY));
            state.translationZ = state.translationZ - TRANSLATION_STEP * Math.sin(toRadians(state.rotationY));
            state.transform = computeMatrix(state);
        },
        translateRight: (
            state,
        ) => {
            state.translationX = state.translationX + TRANSLATION_STEP * Math.cos(toRadians(state.rotationY));
            state.translationZ = state.translationZ + TRANSLATION_STEP * Math.sin(toRadians(state.rotationY));
            state.transform = computeMatrix(state);
        },
        translateIn: (
            state,
        ) => {
            state.translationZ = state.translationZ - TRANSLATION_STEP * 3 * Math.cos(toRadians(-state.rotationY));
            state.translationX = state.translationX - TRANSLATION_STEP * 3 * Math.sin(toRadians(-state.rotationY));
            state.transform = computeMatrix(state);
        },
        translateOut: (
            state,
        ) => {
            state.translationZ = state.translationZ + TRANSLATION_STEP * 3 * Math.cos(toRadians(-state.rotationY));
            state.translationX = state.translationX + TRANSLATION_STEP * 3 * Math.sin(toRadians(-state.rotationY));
            state.transform = computeMatrix(state);
        },
        translateXWith: (
            state,
            action: PayloadAction<any>,
            // action: Types.TranslateXWithAction,
        ) => {
            state.translationX = state.translationX +  action.payload * Math.cos(toRadians(state.rotationY));
            state.translationZ = state.translationZ +  action.payload * Math.sin(toRadians(state.rotationY));
            state.transform = computeMatrix(state);
        },
        translateYWith: (
            state,
            action: PayloadAction<any>,
            // action: Types.TranslateYWithAction,
        ) => {
            state.translationY = state.translationY + action.payload;
            state.transform = computeMatrix(state);
        },
        translateZWith: (
            state,
            action: PayloadAction<any>,
            // action: Types.TranslateZWithAction,
        ) => {
            state.translationZ = state.translationZ + action.payload;
            state.transform = computeMatrix(state);
        },
        scaleUp: (
            state,
        ) => {
            const computedScale = state.scale + SCALE_STEP;
            const scale = computedScale < SCALE_UPPER_LIMIT
                ? computedScale
                : SCALE_UPPER_LIMIT;

            state.scale = scale;
            state.transform = computeMatrix(state);
        },
        scaleDown: (
            state,
        ) => {
            const computedScale = state.scale - SCALE_STEP;
            const scale = computedScale > SCALE_LOWER_LIMIT
                ? computedScale
                : SCALE_LOWER_LIMIT;

            state.scale = scale;
            state.transform = computeMatrix(state);
        },
        scaleUpWith: (
            state,
            action: PayloadAction<any>,
            // action: Types.ScaleUpWithAction,
        ) => {
            const computedScale = state.scale + Math.abs(action.payload);
            const scale = computedScale < SCALE_UPPER_LIMIT
                ? computedScale
                : SCALE_UPPER_LIMIT;

            state.scale = scale;
            state.transform = computeMatrix(state);
        },
        scaleDownWith: (
            state,
            action: PayloadAction<any>,
            // action: Types.ScaleDownWithAction,
        ) => {
            const computedScale = state.scale - Math.abs(action.payload);
            const scale = computedScale > SCALE_LOWER_LIMIT
                ? computedScale
                : SCALE_LOWER_LIMIT;

            state.scale = scale;
            state.transform = computeMatrix(state);
        },
        setInitialTree: (
            state,
            action: PayloadAction<any>,
            // action: Types.SetInitialTreeAction,
        ) => {
            return {
                ...state,
                initialTree: [
                    ...action.payload,
                ],
            };
        },
        setTree: (
            state,
            action: PayloadAction<any>,
            // action: Types.SetTreeAction,
        ) => {
            return {
                ...state,
                tree: [
                    ...action.payload,
                ],
            };
        },
        setActiveUniverse: (
            state,
            action: PayloadAction<any>,
            // action: Types.SetActiveUniverseAction,
        ) => {
            return {
                ...state,
                activeUniverseID: action.payload,
            };
        },
        spaceResetTransform: (
            state,
        ) => {
            state.scale = 1;
            state.rotationX = 0;
            state.rotationY = 0;
            state.translationX = 0;
            state.translationY = 0;
            state.translationZ = 0;
            state.transform = computeMatrix(state);
        },
        setViewSize: (
            state,
            action: PayloadAction<any>,
            // action: Types.SetViewSizeAction,
        ) => {
            return {
                ...state,
                viewSize: {
                    ...action.payload,
                },
            };
        },
        setSpaceSize: (
            state,
            action: PayloadAction<any>,
            // action: Types.SetSpaceSizeAction,
        ) => {
            return {
                ...state,
                spaceSize: {
                    ...action.payload,
                },
            };
        },
        updateSpaceTreePlane: (
            state,
            action: PayloadAction<any>,
            // action: Types.UpdateSpaceTreePlaneAction,
        ) => {
            const updatedTree = generalEngine.tree.updateTreePlane(state.tree, action.payload);

            return {
                ...state,
                tree: updatedTree,
            };
        },
        updateSpaceLinkCoordinates: (
            state,
            action: PayloadAction<any>,
            // action: Types.UpdateSpaceLinkCoordinatesAction,
        ) => {
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
        },
        spaceSetView: (
            state,
            action: PayloadAction<any>,
            // action: Types.SpaceSetViewAction,
        ) => {
            state.view = action.payload;
        },
        spaceSetCulledView: (
            state,
            action: PayloadAction<any>,
            // action: Types.SpaceSetCulledViewAction,
        ) => {
            state.culledView = action.payload;
        },
    },
});
// #endregion module



// #region exports
export const actions = space.actions;


export const getSpace = (state: AppState) => state.space;
const getLoading = (state: AppState): boolean => state.space.loading;
const getTransformMatrix = (state: AppState) => state.space.transform;
const getAnimatedTransform = (state: AppState): boolean => state.space.animatedTransform;
const getTransformTime = (state: AppState): number => state.space.transformTime;

const getRotationX = (state: AppState): number => state.space.rotationX;
const getRotationY = (state: AppState): number => state.space.rotationY;
const getTranslationX = (state: AppState): number => state.space.translationX;
const getTranslationY = (state: AppState): number => state.space.translationY;
const getTranslationZ = (state: AppState): number => state.space.translationZ;
const getScale = (state: AppState): number => state.space.scale;
const getInitialTree = (state: AppState): TreePlane[] => state.space.initialTree;
const getTree = (state: AppState): TreePlane[] => state.space.tree;
const getTransform = (state: AppState) => {
    return {
        rotationX: state.space.rotationX,
        rotationY: state.space.rotationY,
        translationX: state.space.translationX,
        translationY: state.space.translationY,
        translationZ: state.space.translationZ,
        scale: state.space.scale,
    };
}
const getActiveUniverseID = (state: AppState) => state.space.activeUniverseID;

const getView = (state: AppState) => state.space.view;
const getViewSize = (state: AppState) => state.space.viewSize;
const getCulledView = (state: AppState) => state.space.culledView;

const getActivePlaneID = (state: AppState) => state.space.activePlaneID;
const getIsolatePlane = (state: AppState) => state.space.isolatePlane;
const getLastClosedPlane = (state: AppState) => state.space.lastClosedPlane;


export const selectors = {
    getSpace,

    getLoading,

    getTransformMatrix,
    getAnimatedTransform,
    getTransformTime,

    getRotationX,
    getRotationY,
    getTranslationX,
    getTranslationY,
    getTranslationZ,
    getScale,
    getTransform,

    getInitialTree,
    getTree,

    getActiveUniverseID,

    getView,
    getViewSize,
    getCulledView,

    getActivePlaneID,
    getIsolatePlane,
    getLastClosedPlane,
};


export const reducer = space.reducer;
// #endregion exports
