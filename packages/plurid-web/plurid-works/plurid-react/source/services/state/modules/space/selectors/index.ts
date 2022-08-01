// #region imports
    // #region libraries
    import {
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    // #endregion external
// #endregion imports



// #region module
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
// #endregion module



// #region exports
export default {
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
// #endregion exports
