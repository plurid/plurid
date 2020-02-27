import environment from '../../utilities/environment';

import storeProduction, {
    AppState as AppStateProduction,
} from './store.production';
import storeDevelopment, {
    AppState as AppStateDeveloment,
} from './store.development';



export type AppState = AppStateProduction | AppStateDeveloment;

const store = environment.production
    ? storeProduction
    : storeDevelopment;


export default store;
