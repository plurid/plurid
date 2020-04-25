import {
    resolveAbsolutePluridLinkPath,
} from '../';



describe('resolveAbsolutePluridLinkPath', () => {
    it('handles plane', () => {
        const link = '/plane-one';
        const result = resolveAbsolutePluridLinkPath(link);

        expect(result?.resolvedPath).toEqual('http://localhost://p://s://u://c://plane-one');
    });

    it('handles static path', () => {
        const link = 'http://localhost:3000://static';
        const result = resolveAbsolutePluridLinkPath(link);

        expect(result?.resolvedPath).toEqual('http://localhost:3000://static');
    });
});
