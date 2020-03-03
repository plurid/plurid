import {
    SHORTCUTS,
    KEY_MODIFIERS,
} from '../enumerations';

import {
    ShortcutNames,
} from '../interfaces/internal/shortcuts';

import {
    fields as internationalizationFields,
} from './internationalization';

import {
    keyModifiers,
} from './keys';



export const shortcutsNames: ShortcutNames = {
    TOGGLE_FIRST_PERSON: {
        name: internationalizationFields.toolbarDrawerShortcutsToggleFirstPerson,
        key: 'f',
    },
    MOVE_FORWARD: {
        name: internationalizationFields.toolbarDrawerShortcutsMoveForward,
        key: 'w',
    },
    MOVE_BACKWARD: {
        name: internationalizationFields.toolbarDrawerShortcutsMoveBackward,
        key: 's',
    },
    MOVE_LEFT: {
        name: internationalizationFields.toolbarDrawerShortcutsMoveLeft,
        key: 'a',
    },
    MOVE_RIGHT: {
        name: internationalizationFields.toolbarDrawerShortcutsMoveRight,
        key: 'd',
    },
    MOVE_UP: {
        name: internationalizationFields.toolbarDrawerShortcutsMoveUp,
        key: 'e',
    },
    MOVE_DOWN: {
        name: internationalizationFields.toolbarDrawerShortcutsMoveDown,
        key: 'c',
    },
    TURN_LEFT: {
        name: internationalizationFields.toolbarDrawerShortcutsTurnLeft,
        key: 'a',
        modifier: keyModifiers.SHIFT,
    },
    TURN_RIGHT: {
        name: internationalizationFields.toolbarDrawerShortcutsTurnRight,
        key: 'd',
        modifier: keyModifiers.SHIFT,
    },
    TURN_UP: {
        name: internationalizationFields.toolbarDrawerShortcutsTurnUp,
        key: 'q',
    },
    TURN_DOWN: {
        name: internationalizationFields.toolbarDrawerShortcutsTurnDown,
        key: 'z',
    },

    ROTATE_UP: {
        name: internationalizationFields.toolbarDrawerShortcutsRotateUp,
        internationalizedKey: true,
        key: internationalizationFields.toolbarDrawerShortcutsArrowOrScrollUp,
        modifier: keyModifiers.SHIFT,
    },
    ROTATE_DOWN: {
        name: internationalizationFields.toolbarDrawerShortcutsRotateDown,
        internationalizedKey: true,
        key: internationalizationFields.toolbarDrawerShortcutsArrowOrScrollDown,
        modifier: keyModifiers.SHIFT,
    },
    ROTATE_LEFT: {
        name: internationalizationFields.toolbarDrawerShortcutsRotateLeft,
        internationalizedKey: true,
        key: internationalizationFields.toolbarDrawerShortcutsArrowOrScrollLeft,
        modifier: keyModifiers.SHIFT,
    },
    ROTATE_RIGHT: {
        name: internationalizationFields.toolbarDrawerShortcutsRotateRight,
        internationalizedKey: true,
        key: internationalizationFields.toolbarDrawerShortcutsArrowOrScrollRight,
        modifier: keyModifiers.SHIFT,
    },
    TOGGLE_ROTATE: {
        name: internationalizationFields.toolbarDrawerShortcutsToggleRotate,
        key: 'r',
    },

    TRANSLATE_UP: {
        name: internationalizationFields.toolbarDrawerShortcutsTranslateUp,
        internationalizedKey: true,
        key: internationalizationFields.toolbarDrawerShortcutsArrowOrScrollUp,
        modifier: keyModifiers.ALT,
    },
    TRANSLATE_DOWN: {
        name: internationalizationFields.toolbarDrawerShortcutsTranslateDown,
        internationalizedKey: true,
        key: internationalizationFields.toolbarDrawerShortcutsArrowOrScrollDown,
        modifier: keyModifiers.ALT,
    },
    TRANSLATE_LEFT: {
        name: internationalizationFields.toolbarDrawerShortcutsTranslateLeft,
        internationalizedKey: true,
        key: internationalizationFields.toolbarDrawerShortcutsArrowOrScrollLeft,
        modifier: keyModifiers.ALT,
    },
    TRANSLATE_RIGHT: {
        name: internationalizationFields.toolbarDrawerShortcutsTranslateRight,
        internationalizedKey: true,
        key: internationalizationFields.toolbarDrawerShortcutsArrowOrScrollRight,
        modifier: keyModifiers.ALT,
    },
    TRANSLATE_IN: {
        name: internationalizationFields.toolbarDrawerShortcutsTranslateIn,
        internationalizedKey: true,
        key: internationalizationFields.toolbarDrawerShortcutsArrowOrScrollUp,
        modifier: [keyModifiers.SHIFT, keyModifiers.ALT],
    },
    TRANSLATE_OUT: {
        name: internationalizationFields.toolbarDrawerShortcutsTranslateOut,
        internationalizedKey: true,
        key: internationalizationFields.toolbarDrawerShortcutsArrowOrScrollDown,
        modifier: [keyModifiers.SHIFT, keyModifiers.ALT],
    },
    TOGGLE_TRANSLATE: {
        name: internationalizationFields.toolbarDrawerShortcutsToggleTranslate,
        key: 't',
    },

    SCALE_UP: {
        name: internationalizationFields.toolbarDrawerShortcutsScaleUp,
        internationalizedKey: true,
        key: internationalizationFields.toolbarDrawerShortcutsArrowOrScrollUp,
        modifier: keyModifiers.CTRLMETA,
    },
    SCALE_DOWN: {
        name: internationalizationFields.toolbarDrawerShortcutsScaleDown,
        internationalizedKey: true,
        key: internationalizationFields.toolbarDrawerShortcutsArrowOrScrollDown,
        modifier: keyModifiers.CTRLMETA,
    },
    TOGGLE_SCALE: {
        name: internationalizationFields.toolbarDrawerShortcutsToggleScale,
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
