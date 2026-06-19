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
});
// #endregion module
