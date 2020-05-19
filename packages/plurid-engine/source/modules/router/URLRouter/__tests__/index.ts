import URLRouter from '../';



describe.only('URLRouter', () => {
    it('finds a basic path', () => {
        const paths = [
            '/one',
            '/two',
        ];
        const urlRouter = new URLRouter(paths);
        const match = urlRouter.match('/one');

        expect(match?.path).toBe('/one');
    });

    it('does not find a basic path', () => {
        const paths = [
            '/one',
            '/two',
        ];
        const urlRouter = new URLRouter(paths);
        const match = urlRouter.match('/three');

        expect(match).toBe(undefined);
    });

    it('finds a parametric path', () => {
        const paths = [
            '/one/:item',
            '/two',
        ];
        const urlRouter = new URLRouter(paths);
        const match = urlRouter.match('/one/an-item');

        expect(match?.path).toBe('/one/an-item');
    });
});
