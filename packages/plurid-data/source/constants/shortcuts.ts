import {
    SHORTCUTS,
    KEY_MODIFIERS,
} from '../enumerations';

import {
    keyModifiers,
} from './keys';



export const shortcutsNames: any = {
    TOGGLE_FIRST_PERSON: {
        name: 'toggle first person',
        key: 'f',
    },
    MOVE_FORWARD: {
        name: 'move forward',
        key: 'w',
    },
    MOVE_BACKWARD: {
        name: 'move backward',
        key: 's',
    },
    MOVE_LEFT: {
        name: 'move left',
        key: 'a',
    },
    MOVE_RIGHT: {
        name: 'move right',
        key: 'd',
    },
    MOVE_UP: {
        name: 'move up',
        key: 'e',
    },
    MOVE_DOWN: {
        name: 'move down',
        key: 'c',
    },
    TURN_LEFT: {
        name: 'turn left',
        key: 'a',
        modifier: keyModifiers.SHIFT,
    },
    TURN_RIGHT: {
        name: 'turn right',
        key: 'd',
        modifier: keyModifiers.SHIFT,
    },
    TURN_UP: {
        name: 'turn up',
        key: 'q',
    },
    TURN_DOWN: {
        name: 'turn down',
        key: 'z',
    },

    ROTATE_UP: {
        name: 'rotate up',
        key: '↑ or scroll up',
        modifier: keyModifiers.SHIFT,
    },
    ROTATE_DOWN: {
        name: 'rotate down',
        key: '↓ or scroll down',
        modifier: keyModifiers.SHIFT,
    },
    ROTATE_LEFT: {
        name: 'rotate left',
        key: '← or scroll left',
        modifier: keyModifiers.SHIFT,
    },
    ROTATE_RIGHT: {
        name: 'rotate right',
        key: '→ or scroll right',
        modifier: keyModifiers.SHIFT,
    },
    TOGGLE_ROTATE: {
        name: 'toggle rotate',
        key: 'r',
    },

    TRANSLATE_UP: {
        name: 'translate up',
        key: '↑ or scroll up',
        modifier: keyModifiers.ALT,
    },
    TRANSLATE_DOWN: {
        name: 'translate down',
        key: '↓ or scroll down',
        modifier: keyModifiers.ALT,
    },
    TRANSLATE_LEFT: {
        name: 'translate left',
        key: '← or scroll left',
        modifier: keyModifiers.ALT,
    },
    TRANSLATE_RIGHT: {
        name: 'translate right',
        key: '→ or scroll right',
        modifier: keyModifiers.ALT,
    },
    TRANSLATE_IN: {
        name: 'translate in',
        key: '↑ or scroll up',
        modifier: [keyModifiers.SHIFT, keyModifiers.ALT],
    },
    TRANSLATE_OUT: {
        name: 'translate out',
        key: '↓ or scroll down',
        modifier: [keyModifiers.SHIFT, keyModifiers.ALT],
    },
    TOGGLE_TRANSLATE: {
        name: 'toggle translate',
        key: 't',
    },

    SCALE_UP: {
        name: 'scale up',
        key: '↑ or scroll up',
        modifier: keyModifiers.CTRLMETA,
    },
    SCALE_DOWN: {
        name: 'scale down',
        key: '↓ or scroll down',
        modifier: keyModifiers.CTRLMETA,
    },
    TOGGLE_SCALE: {
        name: 'toggle scale',
        key: 's',
    },
};


export const defaultShortcuts = [
    {
        type: SHORTCUTS.TOGGLE_FIRST_PERSON,
        key: 'f',
    },
    {
        type: SHORTCUTS.MOVE_FORWARD,
        key: 'w',
    },
    {
        type: SHORTCUTS.MOVE_BACKWARD,
        key: 's',
    },
    {
        type: SHORTCUTS.MOVE_LEFT,
        key: 'a',
    },
    {
        type: SHORTCUTS.MOVE_RIGHT,
        key: 'd',
    },
    {
        type: SHORTCUTS.MOVE_UP,
        key: 'e',
    },
    {
        type: SHORTCUTS.MOVE_DOWN,
        key: 'c',
    },
    {
        type: SHORTCUTS.TURN_LEFT,
        key: 'a',
        modifier: KEY_MODIFIERS.SHIFT,
    },
    {
        type: SHORTCUTS.TURN_RIGHT,
        key: 'd',
        modifier: KEY_MODIFIERS.SHIFT,
    },
    {
        type: SHORTCUTS.TURN_UP,
        key: 'q',
    },
    {
        type: SHORTCUTS.TURN_DOWN,
        key: 'z',
    },

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
        type: SHORTCUTS.TRANSLATE_IN,
        key: 'ArrowUp',
        modifier: [KEY_MODIFIERS.SHIFT, KEY_MODIFIERS.ALT],
    },
    {
        type: SHORTCUTS.TRANSLATE_OUT,
        key: 'ArrowDown',
        modifier: [KEY_MODIFIERS.SHIFT, KEY_MODIFIERS.ALT],
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
