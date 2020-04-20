import {
    resolveAbsolutePluridLinkPath,
} from '../';



describe('resolveAbsolutePluridLinkPath', () => {
    it('works', () => {
        const link = '/plane-one';
        const result = resolveAbsolutePluridLinkPath(link);

        expect(result).toEqual('plane-one');
    });
});
