// #region imports
    // #region external
    import {
        PluridShortcutID,
    } from '../../interfaces/external/configuration';
    // #endregion external
// #endregion imports



// #region module
export type PluridShortcutKind =
    | 'press'
    | 'hold';

export type PluridShortcutGroup =
    | 'navigate'
    | 'fly'
    | 'transform'
    | 'planes'
    | 'roots'
    | 'help';

export interface PluridShortcutModifiers {
    shift?: boolean;
    alt?: boolean;
    ctrlOrMeta?: boolean;
}

/**
 * One engine keyboard shortcut — THE single table the dispatcher, the help overlay and the toolbar
 * drawer are generated from, so they cannot drift. `code` is the default `event.code` a
 * `shortcuts.keymap` entry remaps; `keys` are the display chips when the code alone does not tell
 * the story (an `Alt+Digit` range, a key-character like `?`).
 */
export interface PluridShortcutDefinition {
    id: PluridShortcutID;
    code?: string;
    keys?: string[];
    modifiers?: PluridShortcutModifiers;
    kind: PluridShortcutKind;
    group: PluridShortcutGroup;
    label: string;
    /** Only active in this mode. */
    when?: 'firstPerson' | 'grabMode' | 'page';
}


export const PLURID_SHORTCUTS: PluridShortcutDefinition[] = [
    // navigate
    { id: 'grabMode', code: 'KeyG', kind: 'press', group: 'navigate', label: 'Grab once: the next drag orbits anywhere (the release ends it; G again or Esc cancels)' },
    { id: 'grabHold', code: 'Space', kind: 'hold', group: 'navigate', label: 'Hold to navigate (orbit anywhere)' },
    { id: 'exitGrabMode', code: 'Escape', kind: 'press', group: 'navigate', label: 'Exit grab mode', when: 'grabMode' },
    { id: 'dock', code: 'Escape', kind: 'press', group: 'navigate', label: 'Back to the page: from the space, dock; on a spawned page, its parent', when: 'page' },
    { id: 'fitToView', code: 'Digit0', keys: ['0'], kind: 'press', group: 'navigate', label: 'Frame everything' },
    { id: 'home', code: 'Home', kind: 'press', group: 'navigate', label: 'Home viewpoint' },
    { id: 'navigateLeft', code: 'ArrowLeft', kind: 'press', group: 'navigate', label: 'Go to the plane on the left' },
    { id: 'navigateRight', code: 'ArrowRight', kind: 'press', group: 'navigate', label: 'Go to the plane on the right' },
    { id: 'navigateUp', code: 'ArrowUp', kind: 'press', group: 'navigate', label: 'Go to the plane above' },
    { id: 'navigateDown', code: 'ArrowDown', kind: 'press', group: 'navigate', label: 'Go to the plane below' },
    { id: 'frameActive', code: 'Enter', kind: 'press', group: 'navigate', label: 'Frame the active plane' },
    { id: 'selectAll', code: 'KeyA', modifiers: { ctrlOrMeta: true }, kind: 'press', group: 'navigate', label: 'Select every plane' },
    { id: 'invertSelection', code: 'KeyI', modifiers: { ctrlOrMeta: true }, kind: 'press', group: 'navigate', label: 'Invert the selection' },
    { id: 'duplicateSelection', code: 'KeyD', modifiers: { ctrlOrMeta: true }, kind: 'press', group: 'navigate', label: 'Duplicate the selected planes' },
    { id: 'frameSelection', code: 'Period', keys: ['.'], kind: 'press', group: 'navigate', label: 'Frame the selection' },
    { id: 'undo', code: 'KeyZ', modifiers: { ctrlOrMeta: true }, kind: 'press', group: 'navigate', label: 'Undo (+ Shift: redo)' },
    { id: 'clearSelection', code: 'Escape', kind: 'press', group: 'navigate', label: 'Clear the selection' },

    // fly
    { id: 'toggleFirstPerson', code: 'KeyF', kind: 'press', group: 'fly', label: 'Toggle fly (first-person) mode' },
    { id: 'flyForward', code: 'KeyW', kind: 'hold', group: 'fly', label: 'Fly forward', when: 'firstPerson' },
    { id: 'flyBack', code: 'KeyS', kind: 'hold', group: 'fly', label: 'Fly back', when: 'firstPerson' },
    { id: 'flyLeft', code: 'KeyA', kind: 'hold', group: 'fly', label: 'Strafe left', when: 'firstPerson' },
    { id: 'flyRight', code: 'KeyD', kind: 'hold', group: 'fly', label: 'Strafe right', when: 'firstPerson' },
    { id: 'flyUp', code: 'KeyE', kind: 'hold', group: 'fly', label: 'Ascend', when: 'firstPerson' },
    { id: 'flyDown', code: 'KeyQ', kind: 'hold', group: 'fly', label: 'Descend', when: 'firstPerson' },
    { id: 'flySprint', code: 'ShiftLeft', keys: ['Shift'], kind: 'hold', group: 'fly', label: 'Sprint', when: 'firstPerson' },

    // transform
    { id: 'modeRotation', code: 'KeyR', kind: 'press', group: 'transform', label: 'Rotate mode (drag / wheel rotates)' },
    { id: 'modeTranslation', code: 'KeyT', kind: 'press', group: 'transform', label: 'Translate mode (drag / wheel pans)' },
    { id: 'modeScale', code: 'KeyS', kind: 'press', group: 'transform', label: 'Scale mode (drag / wheel zooms)' },
    { id: 'transformNudge', keys: ['Shift / Alt / \u2318', '\u2190\u2192\u2191\u2193'], kind: 'press', group: 'transform', label: 'Rotate / translate / scale by a step' },

    // planes
    { id: 'focusPlane', code: 'KeyF', modifiers: { alt: true }, kind: 'press', group: 'planes', label: 'Frame the active plane' },
    { id: 'focusParent', code: 'KeyB', modifiers: { alt: true }, kind: 'press', group: 'planes', label: 'Frame the parent plane' },
    { id: 'isolatePlane', code: 'KeyE', modifiers: { alt: true }, kind: 'press', group: 'planes', label: 'Isolate the active plane' },
    { id: 'refreshPlane', code: 'KeyR', modifiers: { alt: true }, kind: 'press', group: 'planes', label: 'Refresh the active plane' },
    { id: 'closePlane', code: 'KeyW', modifiers: { alt: true }, kind: 'press', group: 'planes', label: 'Close the active plane' },
    { id: 'openClosedPlane', code: 'KeyT', modifiers: { alt: true, shift: true }, kind: 'press', group: 'planes', label: 'Reopen the last closed plane' },

    // roots
    { id: 'focusPreviousRoot', code: 'KeyA', modifiers: { alt: true }, kind: 'press', group: 'roots', label: 'Previous root' },
    { id: 'focusNextRoot', code: 'KeyD', modifiers: { alt: true }, kind: 'press', group: 'roots', label: 'Next root' },
    { id: 'cycleRoot', code: 'Tab', modifiers: { alt: true }, kind: 'press', group: 'roots', label: 'Cycle roots (+ Shift: backwards)' },
    { id: 'focusRootIndex', keys: ['Alt', '1\u20139'], kind: 'press', group: 'roots', label: 'Jump to a root by index' },

    // help
    { id: 'help', code: 'Slash', keys: ['?'], modifiers: { shift: true }, kind: 'press', group: 'help', label: 'Toggle the shortcuts panel' },
];


export const PLURID_SHORTCUT_GROUP_TITLES: Record<PluridShortcutGroup, string> = {
    navigate: 'Navigate',
    fly: 'Fly mode',
    transform: 'Transform',
    planes: 'Planes',
    roots: 'Roots',
    help: 'Help',
};


/** The pointer vocabulary (not remappable through `keymap`; `gestures.buttonMap` does that). */
export const PLURID_POINTER_GESTURES: { keys: string[]; label: string }[] = [
    { keys: ['drag'], label: 'Orbit (on empty space; anywhere in grab mode)' },
    { keys: ['right', 'drag'], label: 'Pan' },
    { keys: ['middle', 'drag'], label: 'Pan' },
    { keys: ['Shift', 'drag'], label: 'Pan' },
    { keys: ['Alt', 'drag'], label: 'Dolly (move closer / further)' },
    { keys: ['wheel'], label: 'Zoom at the cursor (content scrolls first over a scrollable plane)' },
    { keys: ['\u2318 / Ctrl', 'wheel'], label: 'Zoom at the cursor, always' },
    { keys: ['double click'], label: 'Frame the plane (or everything)' },
    { keys: ['pinch'], label: 'Zoom (touch / trackpad)' },
    { keys: ['two fingers', 'drag'], label: 'Pan (touch)' },
];
// #endregion module
