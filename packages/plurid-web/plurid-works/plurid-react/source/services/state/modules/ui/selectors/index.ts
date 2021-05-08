import { AppState } from '~services/state/store';



const getToolbarScrollPosition = (state: AppState) => state.ui.toolbarScrollPosition


export default {
    getToolbarScrollPosition,
};
