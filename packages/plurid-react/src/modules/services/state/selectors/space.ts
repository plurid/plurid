import { AppState } from '../store';



const getSpaceScale = (state: AppState): number => state.space.scale;


export default {
    getSpaceScale,
};
