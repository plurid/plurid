import {
    pluridLinkPathDivider,
} from '../';



describe.only('pluridLinkPathDivider', () => {
    it('works', () => {
        const link = '/plane-one';
        const result = pluridLinkPathDivider(link);

        expect(result.plane.value).toEqual('plane-one');
    });
});
