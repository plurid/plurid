// #region module
export interface ShortcutItem {
    /** Each entry renders as its own <kbd> chip; multiple entries = a combo. */
    keys: string[];
    label: string;
}

export interface ShortcutGroup {
    title: string;
    items: ShortcutItem[];
}

/**
 * The engine's full keyboard/pointer vocabulary, grouped for the help overlay.
 * Keep in sync with `services/logic/shortcuts` + the View gesture effects.
 */
export const SHORTCUT_GROUPS: ShortcutGroup[] = [
    {
        title: 'Navigate',
        items: [
            { keys: ['G'], label: 'Toggle grab / orbit mode' },
            { keys: ['drag'], label: 'Orbit (while grabbing)' },
            { keys: ['Shift', 'drag'], label: 'Pan' },
            { keys: ['middle', 'drag'], label: 'Pan (any mode)' },
            { keys: ['scroll'], label: 'Zoom to cursor (grab)' },
            { keys: ['⌘', 'scroll'], label: 'Zoom to cursor (any mode)' },
            { keys: ['0'], label: 'Fit all to view' },
            { keys: ['Home'], label: 'Fit all to view' },
        ],
    },
    {
        title: 'Fly mode',
        items: [
            { keys: ['F'], label: 'Toggle fly (first-person)' },
            { keys: ['W', 'A', 'S', 'D'], label: 'Move' },
            { keys: ['E', 'Space'], label: 'Ascend' },
            { keys: ['Q', 'Shift'], label: 'Descend' },
            { keys: ['drag'], label: 'Look around' },
            { keys: ['click'], label: 'Lock pointer · Esc releases' },
        ],
    },
    {
        title: 'Transform',
        items: [
            { keys: ['R'], label: 'Rotate mode' },
            { keys: ['T'], label: 'Translate mode' },
            { keys: ['S'], label: 'Scale mode' },
            { keys: ['Shift', '←→↑↓'], label: 'Rotate' },
            { keys: ['Alt', '←→↑↓'], label: 'Translate' },
            { keys: ['⌘', '↑↓'], label: 'Scale' },
        ],
    },
    {
        title: 'Planes',
        items: [
            { keys: ['Alt', 'F'], label: 'Focus plane' },
            { keys: ['Alt', 'B'], label: 'Focus parent plane' },
            { keys: ['Alt', 'E'], label: 'Isolate plane' },
            { keys: ['Alt', 'R'], label: 'Refresh plane' },
            { keys: ['Alt', 'W'], label: 'Close plane' },
            { keys: ['Alt', 'Shift', 'T'], label: 'Reopen closed plane' },
        ],
    },
    {
        title: 'Roots',
        items: [
            { keys: ['Alt', 'A'], label: 'Previous root' },
            { keys: ['Alt', 'D'], label: 'Next root' },
            { keys: ['Alt', 'Tab'], label: 'Cycle roots' },
            { keys: ['Alt', '1–9'], label: 'Jump to root' },
        ],
    },
    {
        title: 'Help',
        items: [
            { keys: ['?'], label: 'Toggle this panel' },
            { keys: ['Esc'], label: 'Close · exit mode' },
        ],
    },
];
// #endregion module
