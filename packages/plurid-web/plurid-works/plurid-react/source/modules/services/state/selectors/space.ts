import { AppState } from '../store';

import {
    TreePlane,
} from '@plurid/plurid-data';



const getLoading = (state: AppState): boolean => state.space.loading;
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
    }
}
const getActiveUniverseID = (state: AppState) => state.space.activeUniverseID;

const getView = (state: AppState) => state.space.view;
const getViewSize = (state: AppState) => state.space.viewSize;
const getCulledView = (state: AppState) => state.space.culledView;


export default {
    getLoading,

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
};
