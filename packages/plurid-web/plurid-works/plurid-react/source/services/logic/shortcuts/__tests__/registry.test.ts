// #region imports
    // #region libraries
    import {
        PLURID_SHORTCUTS,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        describeShortcuts,
        resolveShortcutCode,
        resolveHoldShortcuts,
        isShortcutDisabled,
        labelForCode,
    } from '../registry';
    import {
        SHORTCUTS,
    } from '../index';
    // #endregion external
// #endregion imports



// #region module
describe('shortcut registry', () => {
    it('every shortcut has a label, a group, and a way to be shown', () => {
        for (const definition of PLURID_SHORTCUTS) {
            expect(definition.label.length).toBeGreaterThan(0);
            expect(definition.group.length).toBeGreaterThan(0);
            expect(!!definition.code || !!definition.keys).toBe(true);
        }
        const ids = PLURID_SHORTCUTS.map((definition) => definition.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('generates the help groups with the keymap applied and disabled ids removed', () => {
        const groups = describeShortcuts({
            keymap: { grabMode: 'KeyH' },
            disabled: ['help'],
        });
        const navigate = groups.find((group) => group.id === 'navigate');
        expect(navigate).toBeDefined();
        const grab = navigate!.items.find((item) => item.id === 'grabMode');
        expect(grab!.keys).toEqual(['H']);
        expect(groups.find((group) => group.id === 'help')).toBeUndefined();
        expect(groups.find((group) => group.id === 'pointer')).toBeDefined();
    });

    it('the fly keys, grab-hold and ? are part of the disable / remap system', () => {
        expect(resolveShortcutCode('flyForward')).toBe('KeyW');
        expect(resolveShortcutCode('grabHold')).toBe('Space');
        expect(resolveShortcutCode('help')).toBe('Slash');
        expect(resolveShortcutCode('flyForward', { keymap: { flyForward: 'ArrowUp' } })).toBe('ArrowUp');
        expect(isShortcutDisabled('grabHold', { disabled: true })).toBe(true);
        expect(isShortcutDisabled('grabHold', { disabled: ['grabHold'] })).toBe(true);
        expect(isShortcutDisabled('grabHold', { disabled: ['help'] })).toBe(false);
        const hold = resolveHoldShortcuts({ disabled: ['flySprint'] });
        expect(hold.map((entry) => entry.id)).toContain('flyForward');
        expect(hold.map((entry) => entry.id)).not.toContain('flySprint');
    });

    it('labels codes as chips', () => {
        expect(labelForCode('KeyG')).toBe('G');
        expect(labelForCode('Digit0')).toBe('0');
        expect(labelForCode('Period')).toBe('.');
        expect(labelForCode('ShiftLeft')).toBe('Shift');
    });

describe('the dispatcher and the data table', () => {
    it('every dispatcher binding is in the table with the same code, and a `when` marks the presentation-only ones', () => {
        const table = new Map(PLURID_SHORTCUTS.map((definition) => [definition.id, definition]));
        for (const binding of SHORTCUTS) {
            const definition = table.get(binding.id);
            expect({ id: binding.id, code: definition?.code }).toEqual({ id: binding.id, code: binding.code });
        }
        // `dock` (Escape) applies in both presentations since 2026-09-06 (a docked plane reveals in the space)
        expect(table.get('dock')!.when).toBeUndefined();
    });

    it('the help is described for a presentation: the page-only bindings show on a page, not in the space', () => {
        const ids = (context: Parameters<typeof describeShortcuts>[1]) => describeShortcuts(undefined, context).flatMap((group) => group.items.map((item) => item.id));
        expect(ids({ presentation: 'page' })).toContain('dock');
        expect(ids({ presentation: 'space' })).toContain('dock');
        expect(ids({ presentation: 'space', grabMode: false })).not.toContain('exitGrabMode');
        expect(ids({})).toContain('dock');
    });
});

});
// #endregion module
