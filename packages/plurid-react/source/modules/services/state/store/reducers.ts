import { combineReducers } from 'redux';

import data from '../modules/data/reducers';
import configuration from '../modules/configuration/reducers';
import shortcuts from '../modules/shortcuts/reducers';
import space from '../modules/space/reducers';
import themes from '../modules/themes/reducers';
import ui from '../modules/ui/reducers';



const rootReducer = combineReducers({
    configuration,
    data,
    shortcuts,
    space,
    themes,
    ui,
});


export default rootReducer;
