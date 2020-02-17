import { combineReducers } from 'redux';

import configuration from '../modules/configuration/reducers';
import * as data from '../modules/data';
import * as shortcuts from '../modules/shortcuts';
import * as space from '../modules/space';
import * as themes from '../modules/themes';
import * as ui from '../modules/ui';



const rootReducer = combineReducers({
    configuration,
    data: data.reducer,
    shortcuts: shortcuts.reducer,
    space: space.reducer,
    themes: themes.reducer,
    ui: ui.reducer,
});


export default rootReducer;
