import { combineReducers } from 'redux';

import data from '../modules/data/reducers';
import configuration from '../modules/configuration/reducers';
import shortcuts from '../modules/shortcuts/reducers';
import * as space from '../modules/space';
import * as themes from '../modules/themes';
import * as ui from '../modules/ui';



const rootReducer = combineReducers({
    configuration,
    data,
    shortcuts,
    space: space.reducer,
    themes: themes.reducer,
    ui: ui.reducer,
});


export default rootReducer;
