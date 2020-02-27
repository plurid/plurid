import {
    AppState,
} from '../store';



const getGeneralTheme = (state: AppState) => state.themes.general;
const getInteractionTheme = (state: AppState) => state.themes.interaction;


const selectors = {
    getGeneralTheme,
    getInteractionTheme,
};


export default selectors;
