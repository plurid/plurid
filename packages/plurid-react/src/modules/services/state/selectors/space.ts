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


export default {
    getLoading,

    getRotationX,
    getRotationY,
    getTranslationX,
    getTranslationY,
    getTranslationZ,
    getScale,
    getTree,
};
