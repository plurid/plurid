// #region imports
    // #region internal
    import {
        modeOf,
        MODE_LABEL,
        MODE_HINT,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
describe('modeOf', () => {
    it('names the one mode the space is in, fly over grab over a transform mode', () => {
        expect(modeOf({ transformMode: 'ALL' }, false)).toBeUndefined();
        expect(modeOf(undefined, false)).toBeUndefined();
        expect(modeOf({ transformMode: 'ROTATION' }, false)).toBe('rotate');
        expect(modeOf({ transformMode: 'TRANSLATION' }, false)).toBe('translate');
        expect(modeOf({ transformMode: 'SCALE' }, false)).toBe('scale');
        expect(modeOf({ transformMode: 'ALL' }, true)).toBe('grab');
        expect(modeOf({ transformMode: 'ROTATION' }, true)).toBe('grab');
        expect(modeOf({ transformMode: 'ROTATION', firstPerson: true }, true)).toBe('fly');
    });

    it('every mode has a name and a way out, in the product voice', () => {
        for (const mode of ['rotate', 'translate', 'scale', 'grab', 'fly'] as const) {
            expect(MODE_LABEL[mode]).toMatch(/^[a-z ]+$/);
            expect(MODE_HINT[mode]).toMatch(/^[a-z ]+$/);
        }
    });
});
// #endregion module
