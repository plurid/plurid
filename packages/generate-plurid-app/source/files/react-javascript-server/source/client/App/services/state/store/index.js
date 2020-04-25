import environment from '../../utilities/environment';

import storeProduction from './store.production';
import storeDevelopment from './store.development';



const store = environment.production
    ? storeProduction
    : storeDevelopment;


export default store;
