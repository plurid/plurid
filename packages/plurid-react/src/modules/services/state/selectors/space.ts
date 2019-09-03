import { AppState } from '../store';



const getScale = (state: AppState): number => state.space.scale;
const getRotationX = (state: AppState): number => state.space.rotationX;
const getRotationY = (state: AppState): number => state.space.rotationY;
const getTranslationX = (state: AppState): number => state.space.translationX;
const getTranslationY = (state: AppState): number => state.space.translationY;


export default {
    getScale,
    getRotationX,
    getRotationY,
    getTranslationX,
    getTranslationY,
};
