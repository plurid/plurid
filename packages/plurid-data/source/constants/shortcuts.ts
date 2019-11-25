import {
    KEY_MODIFIERS,
} from './keys';

import {
    SHORTCUTS,
} from '../enumerations';



export const shortcutsNames: any = {
    ROTATE_UP: {
        name: 'rotate up',
    },
    ROTATE_DOWN: {
        name: 'rotate down',
    },
    ROTATE_LEFT: {
        name: 'rotate left',
    },
    ROTATE_RIGHT: {
        name: 'rotate left',
    },
    TRANSLATE_UP: {
        name: 'translate up',
    },
    TRANSLATE_DOWN: {
        name: 'translate down',
    },
    TRANSLATE_LEFT: {
        name: 'translate left',
    },
    TRANSLATE_RIGHT: {
        name: 'translate left',
    },
    SCALE_UP: {
        name: 'scale up',
    },
    SCALE_DOWN: {
        name: 'scale down',
    },
};


export const defaultShortcuts = [
    {
        type: SHORTCUTS.ROTATE_UP,
        key: '',
        modifier: KEY_MODIFIERS.SHIFT
    },

];
