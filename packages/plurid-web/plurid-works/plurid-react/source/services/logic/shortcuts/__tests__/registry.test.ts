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
});
// #endregion module
