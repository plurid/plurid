import configuration from './configuration';
import data from './data';
import shortcuts from './shortcuts';
import * as space from '../modules/space';
import themes from './themes';
import ui from './ui';



export default {
    configuration,
    data,
    shortcuts,
    space: space.actions,
    themes,
    ui,
};
