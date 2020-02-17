import * as configuration from '../modules/configuration';
import * as data from '../modules/data';
import * as shortcuts from '../modules/shortcuts';
import * as space from '../modules/space';
import * as themes from '../modules/themes';
import * as ui from '../modules/ui';



export default {
    configuration: configuration.actions,
    data: data.actions,
    shortcuts: shortcuts.actions,
    space: space.actions,
    themes: themes.actions,
    ui: ui.actions,
};
