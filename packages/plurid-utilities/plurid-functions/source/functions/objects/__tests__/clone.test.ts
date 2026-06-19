// #region imports
    // #region external
    import {
        clone,
    } from '../index';
    // #endregion external
// #endregion imports



// #region module
describe('clone', () => {
    it('deep-clones plain objects (default)', () => {
        const data = { a: 1, b: { c: [1, 2, 3] } };
        const cloned = clone(data);

        expect(cloned).toEqual(data);
        expect(cloned).not.toBe(data);
        expect(cloned.b).not.toBe(data.b);
        expect(cloned.b.c).not.toBe(data.b.c);
    });

    it('does not throw on undefined / null / primitives', () => {
        expect(clone(undefined as any)).toBeUndefined();
        expect(clone(null as any)).toBeNull();
        expect(clone(42 as any)).toBe(42);
        expect(clone('x' as any)).toBe('x');
    });

    it('does not throw on cyclic input (default)', () => {
        const a: any = { name: 'a' };
        a.self = a;

        const cloned = clone(a);
        expect(cloned.name).toBe('a');
        expect(cloned.self).toBe(cloned); // cycle preserved, not crashed
    });

    it('json type falls back safely on cyclic input', () => {
        const a: any = { name: 'a' };
        a.self = a;

        // Old behavior threw "Converting circular structure to JSON".
        expect(() => clone(a, 'json')).not.toThrow();
    });

    it('preserves Date with the default clone', () => {
        const d = new Date(1234567890);
        const cloned = clone({ when: d });
        expect(cloned.when instanceof Date).toBe(true);
        expect(cloned.when.getTime()).toBe(d.getTime());
        expect(cloned.when).not.toBe(d);
    });
});
// #endregion module
