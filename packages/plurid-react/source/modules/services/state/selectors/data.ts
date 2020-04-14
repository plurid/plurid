import { AppState } from '../store';



const getUniverses = (state: AppState) => state.data.universes;


export default {
    getUniverses,
};
