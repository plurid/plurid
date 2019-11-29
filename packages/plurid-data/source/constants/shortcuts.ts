import {
    SHORTCUTS,
    KEY_MODIFIERS,
} from '../enumerations';



export const shortcutsNames: any = {
    TOGGLE_FIRST_PERSON: {
        name: 'toggle first person',
    },
    MOVE_FORWARD: {
        name: 'move forward',
    },
    MOVE_BACKWARD: {
        name: 'move backward',
    },
    MOVE_LEFT: {
        name: 'move left',
    },
    MOVE_RIGHT: {
        name: 'move right',
    },
    MOVE_UP: {
        name: 'move up',
    },
    MOVE_DOWN: {
        name: 'move down',
    },
    TURN_LEFT: {
        name: 'turn left',
    },
    TURN_RIGHT: {
        name: 'turn right',
    },
    TURN_UP: {
        name: 'turn up',
    },
    TURN_DOWN: {
        name: 'turn down',
    },

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
