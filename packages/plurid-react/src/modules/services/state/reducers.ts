import { combineReducers } from 'redux';

import pages from './modules/pages/reducers';
import themes from './modules/themes/reducers';



const rootReducer = combineReducers({
    pages,
    themes,
});


export default rootReducer;
