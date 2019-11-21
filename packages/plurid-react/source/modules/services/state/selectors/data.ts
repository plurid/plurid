import { AppState } from '../store';



const getViewSize = (state: AppState) => state.data.viewSize;


export default {
    getViewSize,
};
