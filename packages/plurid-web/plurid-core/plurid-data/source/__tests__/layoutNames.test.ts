// #region imports
    // #region external
    import {
        layoutNames,
        layoutName,
    } from '../constants';

    import {
        LAYOUT_TYPES,
    } from '../enumerations';

    import type {
        PluridChange,
        PluridChangeKind,
        PluridChangeValues,
        PluridPubSubMessageChanged,
        TreePlane,
    } from '../interfaces';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE TOOLBAR OFFERS WHAT THE ENGINE LAYS OUT (audit 2026-09-29 #1): it lists `layoutNames`, and
 * picking `meta` — never implemented — emptied the space.
 */
describe('the layout names', () => {
    it('names every implemented layout and not META', () => {
        expect(Object.keys(layoutNames).sort()).toEqual(['COLUMNS', 'FACE_TO_FACE', 'ROWS', 'SHEAVES', 'ZIG_ZAG']);
        expect(Object.values(layoutNames)).not.toContain('meta');
        expect(LAYOUT_TYPES.META).toBe('META');
    });

    it('layoutName shows a type without a name of its own as the columns it is laid out as', () => {
        expect(layoutName(LAYOUT_TYPES.ROWS)).toBe('rows');
        expect(layoutName(LAYOUT_TYPES.META)).toBe('columns');
        expect(layoutName('GRID')).toBe('columns');
        expect(layoutName('toString')).toBe('columns');
        expect(layoutName(undefined)).toBe('columns');
    });
});


/**
 * `space.changed` IS TYPED BY ITS KIND (audit 2026-09-29 #15), and stays assignable for what was
 * written against `value: any`. Compile-time: ts-jest fails this file on a type error.
 */
describe('the space.changed payload', () => {
    it('narrows on kind, and takes an unknown value by default', () => {
        const change = { kind: 'tree', value: [] } as PluridChange;
        const roots: TreePlane[] = change.kind === 'tree' ? change.value : [];
        expect(roots).toEqual([]);

        const one: PluridChange<'focus'> = { kind: 'focus', value: true };
        expect(one.value).toBe(true);

        // a publisher holding an `unknown` value, as the engine's own emitter does, compiles
        const emit = (kind: PluridChangeKind, value: unknown): PluridPubSubMessageChanged => ({ kind, value });
        expect(emit('loading', false).kind).toBe('loading');

        // the strict union is the permissive one with the value map given, and a subscriber typed
        // with it takes the permissive payload the bus hands out
        const strict: PluridPubSubMessageChanged<PluridChangeValues> = { kind: 'isolate', value: '' };
        const subscriber: (change: PluridChange) => unknown = (change) => change.value;
        const bus: (callback: (data: PluridPubSubMessageChanged) => unknown) => unknown = (callback) => callback(strict);
        expect(bus(subscriber)).toBe('');
    });
});
// #endregion module
