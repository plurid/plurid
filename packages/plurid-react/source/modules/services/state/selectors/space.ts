import { AppState } from '../store';

import {
    TreePage,
} from '@plurid/plurid-data';



const getLoading = (state: AppState): boolean => state.space.loading;
const getRotationX = (state: AppState): number => state.space.rotationX;
const getRotationY = (state: AppState): number => state.space.rotationY;
const getTranslationX = (state: AppState): number => state.space.translationX;
const getTranslationY = (state: AppState): number => state.space.translationY;
const getTranslationZ = (state: AppState): number => state.space.translationZ;
const getScale = (state: AppState): number => state.space.scale;
const getTree = (state: AppState): TreePage[] => state.space.tree;
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
const getActiveDocumentID = (state: AppState) => state.space.activeDocumentID;

const getRotationLocked = (state: AppState) => state.space.rotationLocked;
const getTranslationLocked = (state: AppState) => state.space.translationLocked;
const getScaleLocked = (state: AppState) => state.space.scaleLocked;


export default {
    getLoading,

    getRotationX,
    getRotationY,
    getTranslationX,
    getTranslationY,
    getTranslationZ,
    getScale,
    getTransform,

    getTree,

    getActiveDocumentID,

    getRotationLocked,
    getTranslationLocked,
    getScaleLocked,
};
