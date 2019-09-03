import { AppState } from '../store';



const getScale = (state: AppState): number => state.space.scale;
const getRotationX = (state: AppState): number => state.space.rotationX;
const getRotationY = (state: AppState): number => state.space.rotationY;


export default {
    getScale,
    getRotationX,
    getRotationY,
};
