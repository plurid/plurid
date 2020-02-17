import configuration from './configuration';
import data from './data';
import shortcuts from './shortcuts';
import * as space from '../modules/space';
import * as themes from '../modules/themes';
import ui from './ui';



export default {
    configuration,
    data,
    shortcuts,
    space: space.actions,
    themes: themes.actions,
    ui,
};
