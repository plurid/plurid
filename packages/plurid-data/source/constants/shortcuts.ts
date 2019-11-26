import {
    SHORTCUTS,
    KEY_MODIFIERS,
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
    TOGGLE_ROTATE: {
        name: 'toggle rotate',
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
    TOGGLE_TRANSLATE: {
        name: 'toggle translate',
    },

    SCALE_UP: {
        name: 'scale up',
    },
    SCALE_DOWN: {
        name: 'scale down',
    },
    TOGGLE_SCALE: {
        name: 'toggle scale',
    },
};


export const defaultShortcuts = [
    {
        type: SHORTCUTS.ROTATE_UP,
        key: 'ArrowUp',
        modifier: KEY_MODIFIERS.SHIFT
    },
    {
        type: SHORTCUTS.ROTATE_DOWN,
        key: 'ArrowDown',
        modifier: KEY_MODIFIERS.SHIFT
    },
    {
        type: SHORTCUTS.ROTATE_LEFT,
        key: 'ArrowLeft',
        modifier: KEY_MODIFIERS.SHIFT
    },
    {
        type: SHORTCUTS.ROTATE_RIGHT,
        key: 'ArrowRight',
        modifier: KEY_MODIFIERS.SHIFT
    },
    {
        type: SHORTCUTS.TOGGLE_ROTATE,
        key: 'r',
    },

    {
        type: SHORTCUTS.TRANSLATE_UP,
        key: 'ArrowUp',
        modifier: KEY_MODIFIERS.ALT,
    },
    {
        type: SHORTCUTS.TRANSLATE_DOWN,
        key: 'ArrowDown',
        modifier: KEY_MODIFIERS.ALT
    },
    {
        type: SHORTCUTS.TRANSLATE_LEFT,
        key: 'ArrowLeft',
        modifier: KEY_MODIFIERS.ALT
    },
    {
        type: SHORTCUTS.TRANSLATE_RIGHT,
        key: 'ArrowRight',
        modifier: KEY_MODIFIERS.ALT
    },
    {
        type: SHORTCUTS.TOGGLE_TRANSLATE,
        key: 't',
    },

    {
        type: SHORTCUTS.SCALE_UP,
        key: 'ArrowUp',
        modifier: KEY_MODIFIERS.META,
    },
    {
        type: SHORTCUTS.SCALE_DOWN,
        key: 'ArrowDown',
        modifier: KEY_MODIFIERS.META
    },
    {
        type: SHORTCUTS.TOGGLE_SCALE,
        key: 's',
    },
];
