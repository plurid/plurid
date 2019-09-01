import { combineReducers } from 'redux';

import data from './modules/data/reducers';
import configuration from './modules/configuration/reducers';
import themes from './modules/themes/reducers';



const rootReducer = combineReducers({
    configuration,
    data,
    themes,
});


export default rootReducer;
