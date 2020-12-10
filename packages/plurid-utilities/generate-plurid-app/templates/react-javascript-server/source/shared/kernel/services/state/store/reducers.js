import {
    combineReducers,
} from 'redux';

import * as themes from '../modules/themes';



const rootReducer = combineReducers({
    themes: themes.reducer,
});


export default rootReducer;
