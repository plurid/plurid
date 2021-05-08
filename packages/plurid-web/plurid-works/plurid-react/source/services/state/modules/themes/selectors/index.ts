import { AppState } from '~services/state/store';



const getGeneralTheme = (state: AppState) => state.themes.general;
const getInteractionTheme = (state: AppState) => state.themes.interaction;


export default {
    getGeneralTheme,
    getInteractionTheme,
};
