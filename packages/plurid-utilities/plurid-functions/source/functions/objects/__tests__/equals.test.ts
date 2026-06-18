// #region imports
    // #region external
    import {
        equals,
    } from '../index';
    // #endregion external
// #endregion imports



// #region module
describe('equals', () => {
    const jestConsole = console;
    beforeEach(() => {
        global.console = require('console');
    });
    afterEach(() => {
        global.console = jestConsole;
    });


    it('basic equals', () => {
        const one = {
            b: {
                c: {
                    d: 'e',
                    f: 1,
                    g: true,
                },
                h: {
                    i: -1.1,
                },
            },
            i: 'j',
        };

        const two = {
            b: {
                c: {
                    d: 'e',
                    f: 1,
                    g: true,
                },
                h: {
                    i: -1.1,
                },
            },
            i: 'j',
        };

        const equal = equals(one, two);
        expect(equal).toBe(true);
    });


    it('basic not equals', () => {
        const one = {
            b: {
                c: {
                    d: 'e',
                    f: 1,
                    g: true,
                    k: 'changed',
                },
                h: {
                    i: -1.1,
                },
            },
            i: 'j',
        };

        const two = {
            b: {
                c: {
                    d: 'e',
                    f: 1,
                    g: true,
                },
                h: {
                    i: -1.1,
                },
            },
            i: 'j',
        };

        const notEqual = equals(one, two);
        expect(notEqual).toBe(false);
    });
});
// #endregion module
