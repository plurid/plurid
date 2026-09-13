/**
 * @jest-environment jsdom
 */

// #region imports
    // #region internal
    import {
        loadState,
        saveState,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
/**
 * `storage` is how the engine's persistence survives a reload. Every failure here is DELIBERATELY
 * silent — a browser with storage disabled, a quota that is full, a value someone else wrote — so
 * the contract is "never throws, answers `undefined` when it cannot", and nothing asserted that
 * until 2026-09-13.
 */
describe('local storage', () => {
    beforeEach(() => localStorage.clear());

    it('round-trips whatever JSON holds', () => {
        for (const value of [
            { camera: { yaw: 30, pitch: -10 }, bookmarks: { home: 'v3:…' } },
            [1, 2, 3],
            'a string',
            42,
            true,
            null,
        ]) {
            saveState(value, 'plurid');
            expect(loadState('plurid')).toEqual(value);
        }
    });

    it('a name nothing was ever saved under is `undefined`, not a throw', () => {
        expect(loadState('never-written')).toBeUndefined();
    });

    it('SOMETHING ELSE WROTE THERE: unparseable text is `undefined`, not a crash', () => {
        localStorage.setItem('plurid', 'not json at all');
        expect(loadState('plurid')).toBeUndefined();

        localStorage.setItem('plurid', '{"half":');
        expect(loadState('plurid')).toBeUndefined();
    });

    it('a value JSON cannot hold is DROPPED, silently — a save is never worth a crash', () => {
        const circular: Record<string, unknown> = {};
        circular.self = circular;

        expect(() => saveState(circular, 'plurid')).not.toThrow();
        expect(loadState('plurid')).toBeUndefined();
    });

    it('A STORAGE THAT REFUSES (private mode, a full quota) is survivable both ways', () => {
        const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('QuotaExceededError');
        });
        const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('SecurityError');
        });

        try {
            expect(() => saveState({ a: 1 }, 'plurid')).not.toThrow();
            expect(loadState('plurid')).toBeUndefined();
        } finally {
            setItem.mockRestore();
            getItem.mockRestore();
        }
    });

    it('each name is its own: saving one does not disturb another', () => {
        saveState({ which: 'first' }, 'one');
        saveState({ which: 'second' }, 'two');

        expect(loadState('one')).toEqual({ which: 'first' });
        expect(loadState('two')).toEqual({ which: 'second' });
    });
});
// #endregion module
