// #region imports
    // #region external
    import {
        updateNested,
    } from '../';
    // #endregion external
// #endregion imports



// #region module
describe('updateNested', () => {
    it('basic update', () => {
        const obj = {
            a: {
                b: {
                    c: {
                        d: 0,
                    },
                },
            },
        };

        const newObj = updateNested(
            obj,
            'a.b.c.d',
            1,
        );

        expect(newObj?.a.b.c.d).toEqual(1);
    });
});
// #endregion module
