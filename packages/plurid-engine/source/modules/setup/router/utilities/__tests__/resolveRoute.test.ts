import {
    resolveRoute,
} from '..';



describe('resolveRoute', () => {
    it('handles plane', () => {
        const link = '/plane-one';
        const result = resolveRoute(link);

        expect(result?.route).toEqual('http://localhost://p://s://u://c://plane-one');
    });

    it('handles static path', () => {
        const link = 'http://localhost:3000://static';
        const result = resolveRoute(link);

        expect(result?.route).toEqual('http://localhost:3000://static');
    });
});
