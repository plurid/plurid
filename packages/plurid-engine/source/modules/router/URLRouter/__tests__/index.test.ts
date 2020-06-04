import URLRouter from '../';



describe('URLRouter', () => {
    it('finds a basic route', () => {
        const routes = [
            {
                route: '/one',
            },
            {
                route: '/two',
            },
        ];
        const urlRouter = new URLRouter(routes);
        const match = urlRouter.match('/one');

        expect(match?.route).toBe('/one');
    });

    it('does not find a basic route', () => {
        const routes = [
            {
                route: '/one',
            },
            {
                route: '/two',
            },
        ];
        const urlRouter = new URLRouter(routes);
        const match = urlRouter.match('/three');

        expect(match).toBe(undefined);
    });

    it('finds a parametric route', () => {
        const routes = [
            {
                route: '/one/:item',
            },
            {
                route: '/two',
            },
        ];
        const urlRouter = new URLRouter(routes);
        const match = urlRouter.match('/one/an-item');
        console.log('match', match);

        expect(match?.route).toBe('/one/:item');
    });
});
