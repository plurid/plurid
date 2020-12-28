import {
    pluridLinkPathDivider,
} from '../';



describe('pluridLinkPathDivider', () => {
    it('handles plane', () => {
        const link = '/plane-one';
        const result = pluridLinkPathDivider(link);

        expect(result.plane.value).toEqual('plane-one');
    });
});
