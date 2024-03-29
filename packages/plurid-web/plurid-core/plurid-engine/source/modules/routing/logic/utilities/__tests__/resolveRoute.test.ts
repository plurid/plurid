// #region imports
    // #region external
    import {
        resolveRoute,
    } from '../';
    // #endregion external
// #endregion imports



// #region module
xdescribe('resolveRoute', () => {
    it('handles plane', () => {
        const link = '/plane-one';
        const result = resolveRoute(link);

        expect(result?.route).toEqual('/plane-one');
    });

    // it('handles static path', () => {
    //     const link = 'http://localhost:3000://static';
    //     const result = resolveRoute(link);

    //     expect(result?.route).toEqual('http://localhost:3000://static');
    // });
});
// #endregion module
