import { combineReducers } from 'redux';

import pages from './modules/pages/reducers';
import configuration from './modules/configuration/reducers';
import themes from './modules/themes/reducers';



const rootReducer = combineReducers({
    configuration,
    pages,
    themes,
});


export default rootReducer;
