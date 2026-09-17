// #region imports
    // #region external
    import {
        PLURID_CHANGE_KINDS,
    } from '../constants';

    import type {
        PluridChangeKind,
    } from '../interfaces';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE LIST AND THE TYPE ARE ONE: `PLURID_CHANGE_KINDS` (what the docs are generated from) names
 * exactly the members of `PluridChangeKind`. A kind added to one and not the other fails here.
 */
describe('the change kinds', () => {
    it('lists every kind of the type, each once, with a note', () => {
        const listed = PLURID_CHANGE_KINDS.map(([kind]) => kind);
        // the type, spelled out: adding a member here without a row above is the test's point
        const members: PluridChangeKind[] = [
            'selection', 'tree', 'links', 'activePlane', 'isolate', 'layoutResolved', 'loading',
            'history', 'motion', 'bookmarks', 'docked', 'culling', 'plane', 'describe', 'command', 'focus',
        ];
        expect([...listed].sort()).toEqual([...members].sort());
        expect(new Set(listed).size).toBe(listed.length);
        for (const [, note] of PLURID_CHANGE_KINDS) {
            expect(note.length).toBeGreaterThan(8);
        }
    });

    it('is typed as the kinds it lists', () => {
        const kind: PluridChangeKind = PLURID_CHANGE_KINDS[0][0];
        expect(kind).toBe('selection');
    });
});
// #endregion module
