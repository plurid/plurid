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
        // the type, spelled out as a RECORD: the compiler refuses one that misses a member of the
        // union or names one it lacks. An array only checked that each entry was a member, so a kind
        // added to the type and nowhere else passed (2026-10-20).
        const members: Record<PluridChangeKind, true> = {
            selection: true, tree: true, links: true, activePlane: true, isolate: true,
            layoutResolved: true, loading: true, history: true, motion: true, bookmarks: true,
            docked: true, culling: true, plane: true, refused: true, planeError: true,
            describe: true, command: true, focus: true,
        };
        expect([...listed].sort()).toEqual(Object.keys(members).sort());
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
