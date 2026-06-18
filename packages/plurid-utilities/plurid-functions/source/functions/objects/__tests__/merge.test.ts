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
});
// #endregion module
