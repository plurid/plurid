// #region imports
    // #region external
    import {
        pluridLinkPathDivider,
    } from '../';
    // #endregion external
// #endregion imports



// #region module
describe('pluridLinkPathDivider', () => {
    it('handles plane', () => {
        const link = '/plane-one';
        const result = pluridLinkPathDivider(link);

        expect(result.plane.value).toEqual('plane-one');
    });
});
// #endregion module
