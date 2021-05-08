import { AppState } from '../store';



const getToolbarScrollPosition = (state: AppState) => state.ui.toolbarScrollPosition


export default {
    getToolbarScrollPosition,
};
