import configuration from './configuration';
import data from './data';
import * as shortcuts from '../modules/shortcuts';
import * as space from '../modules/space';
import * as themes from '../modules/themes';
import * as ui from '../modules/ui';



export default {
    configuration,
    data,
    shortcuts: shortcuts.actions,
    space: space.actions,
    themes: themes.actions,
    ui: ui.actions,
};
