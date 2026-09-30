// #region imports
    // #region external
    import {
        merge,
    } from '../index';
    // #endregion external
// #endregion imports



// #region module
describe('merge', () => {
    const jestConsole = console;
    beforeEach(() => {
        global.console = require('console');
    });
    afterEach(() => {
        global.console = jestConsole;
    });


    it('basic merge', () => {
        const one = {
            a: {
                b: {
                    c: 'd',
                    e: 1,
                    f: true,
                },
                g: {
                    h: -1,
                },
            },
            i: true,
        };

        const two = {
            a: {
                b: {
                    c: 'changed',
                },
            },
        };

        const three = merge(
            one,
            two,
        );

        expect(three.a.b.c).toEqual('changed');
    });


    it('merge with resolver', () => {
        const one = {
            a: {
                b: {
                    c: 'd',
                    e: 1,
                    f: true,
                },
                g: {
                    h: -1,
                },
            },
            i: true,
        };

        const two = {
            a: {
                b: {
                    c: 'changed',
                },
            },
        };

        const three = merge(
            one,
            two,
            {
                'a.b.e': () => {
                    return 'changed';
                },
            },
        );

        expect(three.a.b.c).toEqual('changed');
        expect(three.a.b.e).toEqual('changed');
    });


    it('keeps target-only keys (not present in object)', () => {
        const base = {
            a: 1,
            b: { c: 2 },
        };

        const target = {
            a: 10,
            b: { c: 20, d: 30 },
            extra: 'x',
        };

        const merged = merge(base, target as any) as any;

        expect(merged.a).toEqual(10);
        expect(merged.b.c).toEqual(20);
        // Previously dropped because merge iterated only `base`'s keys.
        expect(merged.b.d).toEqual(30);
        expect(merged.extra).toEqual('x');
    });


    it('preserves function (and Date) leaf values by reference', () => {
        const fn = () => 'kept';
        const date = new Date(0);
        const base = { handler: undefined as any, when: undefined as any };
        const target = { handler: fn, when: date };

        const merged = merge(base, target as any) as any;

        expect(merged.handler).toBe(fn);
        expect(merged.when).toBe(date);
    });


    it('honors falsy resolver values', () => {
        const base = { a: 1 };
        const merged = merge(base, {}, { 'a': 0 } as any) as any;
        expect(merged.a).toEqual(0);
    });


    // A defined non-object replaces a plain object (2026-09-29): it used to be dropped there, so a
    // configuration could never switch `{ url: { param } }` off with `{ url: false }`.
    it('a defined scalar, null or array in target replaces a plain object', () => {
        const base = {
            docking: { url: { param: 'p' }, motion: 'swing' },
            detach: { mode: 'retain', delay: 300 },
            list: { a: 1 },
            cleared: { a: 1 },
        };
        const merged = merge(base, {
            docking: { url: false },
            detach: 'unmount',
            list: [1, 2],
            cleared: null,
        } as any) as any;

        expect(merged.docking).toEqual({ url: false, motion: 'swing' });
        expect(merged.detach).toBe('unmount');
        expect(merged.list).toEqual([1, 2]);
        expect(merged.cleared).toBeNull();
    });

    it('undefined is no value; an object replaces a scalar; the root stays an object', () => {
        const base = { a: { b: 1 }, c: 1 };
        expect(merge(base, { a: undefined } as any)).toEqual(base);
        expect(merge(base, { c: { d: 2 } } as any)).toEqual({ a: { b: 1 }, c: { d: 2 } });
        expect(merge(base, 'x' as any)).toEqual(base);
        expect(merge(base, null as any)).toEqual(base);
    });

    it('a resolver still runs where target has nothing, and not where target replaced the branch', () => {
        const base = { global: { theme: 'a', look: 'b' } };
        const resolved = merge(base, { other: 1 } as any, { 'global.theme': () => 'resolved' } as any) as any;
        expect(resolved.global).toEqual({ theme: 'resolved', look: 'b' });
        const replaced = merge(base, { global: 'flat' } as any, { 'global.theme': () => 'resolved' } as any) as any;
        expect(replaced.global).toBe('flat');
    });
});
// #endregion module
