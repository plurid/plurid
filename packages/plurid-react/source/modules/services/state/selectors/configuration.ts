import { AppState } from '../store';



const getConfiguration = (state: AppState) => state.configuration;


export default {
    getConfiguration,
};
