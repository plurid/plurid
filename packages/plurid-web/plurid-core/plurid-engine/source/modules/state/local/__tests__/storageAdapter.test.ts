// #region imports
    // #region external
    import {
        save,
        load,
        saveContent,
        loadContent,
    } from '../index';
    // #endregion external
// #endregion imports



// #region module
/**
 * `state.local` owns the versioned space-snapshot serialization + the opaque content blob. The
 * `storageAdapter` seam (Tier 2) lets a host redirect WHERE those bytes land without re-implementing
 * the serialization. These tests pin the round-trip + the gates + the best-effort error handling.
 */
const makeAdapter = () => {
    const map = new Map<string, string>();
    const calls = { get: 0, set: 0, remove: 0 };
    const adapter = {
        getItem: (key: string) => { calls.get++; return map.has(key) ? map.get(key)! : null; },
        setItem: (key: string, value: string) => { calls.set++; map.set(key, value); },
        removeItem: (key: string) => { calls.remove++; map.delete(key); },
    };
    return { map, calls, adapter };
}

const fakeState = () => ({
    space: {
        rotationX: 5,
        rotationY: -10,
        scale: 1.5,
        translationX: 20,
        translationY: 30,
        translationZ: 0,
        transform: 'matrix3d(...)',
        activePlaneID: '/a',
        isolatePlane: '',
        tree: [{ planeID: '/a', show: true }],
        links: [],
    },
}) as any;


describe('state.local storage adapter', () => {
    beforeEach(() => {
        if (typeof localStorage !== 'undefined') {
            localStorage.clear();
        }
    });

    it('round-trips the space snapshot through a custom adapter (NOT localStorage)', () => {
        const { adapter, map, calls } = makeAdapter();

        save('unit', fakeState(), adapter);

        expect(calls.set).toBe(1);
        expect([...map.keys()]).toContain('pluridState-unit');
        // The custom adapter is used INSTEAD of localStorage — the default backend is untouched.
        expect(localStorage.getItem('pluridState-unit')).toBeNull();

        const loaded = load('unit', true, adapter);
        expect(loaded?.space.rotationX).toBe(5);
        expect(loaded?.space.scale).toBe(1.5);
        expect(loaded?.space.tree?.length).toBe(1);
    });

    it('round-trips the opaque content blob through the adapter', () => {
        const { adapter } = makeAdapter();

        saveContent('unit', { note: 'hello', n: 3 }, adapter);
        const content = loadContent('unit', adapter);

        expect(content).toEqual({ note: 'hello', n: 3 });
    });

    it('gates the snapshot load on useLocalStorage=false', () => {
        const { adapter } = makeAdapter();
        save('unit', fakeState(), adapter);

        expect(load('unit', false, adapter)).toBeUndefined();
        expect(load('unit', true, adapter)).toBeDefined();
    });

    it('ignores a snapshot written with a mismatched version', () => {
        const { adapter, map } = makeAdapter();
        // Hand-write a blob with a wrong engine version under the snapshot key.
        map.set('pluridState-unit', JSON.stringify({ version: -1, space: { rotationX: 9 } }));

        expect(load('unit', true, adapter)).toBeUndefined();
    });

    it('falls back to localStorage when no adapter is supplied', () => {
        save('fallback', fakeState());
        expect(localStorage.getItem('pluridState-fallback')).not.toBeNull();

        const loaded = load('fallback', true);
        expect(loaded?.space.rotationX).toBe(5);
    });

    it('swallows a throwing adapter (persistence is best-effort)', () => {
        const throwing = {
            getItem: () => null,
            setItem: () => { throw new Error('quota exceeded'); },
            removeItem: () => { /* noop */ },
        };

        expect(() => save('unit', fakeState(), throwing)).not.toThrow();
        expect(() => saveContent('unit', { a: 1 }, throwing)).not.toThrow();
    });
});
// #endregion module
