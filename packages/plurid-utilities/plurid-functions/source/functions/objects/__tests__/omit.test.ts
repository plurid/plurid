// #region imports
    // #region external
    import {
        omit,
    } from '../index';
    // #endregion external
// #endregion imports



// #region module
describe('omit', () => {
    const jestConsole = console;
    beforeEach(() => {
        global.console = require('console');
    });
    afterEach(() => {
        global.console = jestConsole;
    });


    it('basic omit', () => {
        const obj = {
            one: 'true',
            two: true,
            three: {
                four: 5,
            },
        };

        const newObj = omit(
            obj,
            [
                'one',
            ],
        );

        expect((newObj as any).one).toBe(undefined);
    });


    it('nested omit', () => {
        const obj = {
            one: 'true',
            two: true,
            three: {
                four: 5,
                six: 'seven',
            },
        };

        const newObj = omit(
            obj,
            [
                'one',
                'three.four',
            ],
        );
        // newObj

        const newObj2 = omit(
            obj,
            'three.six',
        );
        // newObj2

        expect((newObj as any).one).toBe(undefined);
        expect((newObj as any).three.four).toBe(undefined);
    });
});
// #endregion module
