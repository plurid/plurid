import { combineReducers } from 'redux';

import data from '../modules/data/reducers';
import configuration from '../modules/configuration/reducers';
import shortcuts from '../modules/shortcuts/reducers';
import * as space from '../modules/space';
import * as themes from '../modules/themes';
import ui from '../modules/ui/reducers';



const rootReducer = combineReducers({
    configuration,
    data,
    shortcuts,
    space: space.reducer,
    themes: themes.reducer,
    ui,
});


export default rootReducer;
