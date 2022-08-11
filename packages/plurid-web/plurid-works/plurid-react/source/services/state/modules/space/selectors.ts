// #region imports
    // #region libraries
    import {
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        AppState,
    } from '~services/state/store';
    // #endregion external
// #endregion imports



// #region module
export const getSpace = (state: AppState) => state.space;
export const getLoading = (state: AppState): boolean => state.space.loading;
export const getTransformMatrix = (state: AppState) => state.space.transform;
export const getAnimatedTransform = (state: AppState): boolean => state.space.animatedTransform;
export const getTransformTime = (state: AppState): number => state.space.transformTime;

export const getRotationX = (state: AppState): number => state.space.rotationX;
export const getRotationY = (state: AppState): number => state.space.rotationY;
export const getTranslationX = (state: AppState): number => state.space.translationX;
export const getTranslationY = (state: AppState): number => state.space.translationY;
export const getTranslationZ = (state: AppState): number => state.space.translationZ;
export const getScale = (state: AppState): number => state.space.scale;
export const getTree = (state: AppState): TreePlane[] => state.space.tree;
export const getTransform = (state: AppState) => {
    return {
        rotationX: state.space.rotationX,
        rotationY: state.space.rotationY,
        translationX: state.space.translationX,
        translationY: state.space.translationY,
        translationZ: state.space.translationZ,
        scale: state.space.scale,
    };
}
export const getActiveUniverseID = (state: AppState) => state.space.activeUniverseID;

export const getView = (state: AppState) => state.space.view;
export const getViewSize = (state: AppState) => state.space.viewSize;
export const getCulledView = (state: AppState) => state.space.culledView;

export const getActivePlaneID = (state: AppState) => state.space.activePlaneID;
export const getIsolatePlane = (state: AppState) => state.space.isolatePlane;
export const getLastClosedPlane = (state: AppState) => state.space.lastClosedPlane;
// #endregion module
