// #region imports
    // #region external
    import URLRouter from '../';

    import {
        URLRoute,
    } from '../data';
    // #endregion external
// #endregion imports



// #region module
describe('URLRouter', () => {
    it('finds a basic route', () => {
        const routes: URLRoute[] = [
            {
                value: '/one',
            },
            {
                value: '/two',
            },
        ];
        const urlRouter = new URLRouter(routes);
        const match = urlRouter.match('/one');

        expect(match?.target).toBe('/one');
    });

    it('does not find a basic route', () => {
        const routes: URLRoute[] = [
            {
                value: '/one',
            },
            {
                value: '/two',
            },
        ];
        const urlRouter = new URLRouter(routes);
        const match = urlRouter.match('/three');

        expect(match).toBe(undefined);
    });

    it('finds a parametric route', () => {
        const routes: URLRoute[] = [
            {
                value: '/one/:item',
            },
            {
                value: '/two',
            },
        ];
        const urlRouter = new URLRouter(routes);
        const match = urlRouter.match('/one/an-item');

        expect(match?.target).toBe('/one/:item');
    });

    it('finds a length constrained (==) parametric route', () => {
        const routes: URLRoute[] = [
            {
                value: '/one/:item',
                parameters: {
                    item: {
                        length: 10,
                        lengthType: '==',
                    },
                },
            },
            {
                value: '/two',
            },
        ];
        const urlRouter = new URLRouter(routes);
        const match = urlRouter.match('/one/0123456789');

        expect(match?.target).toBe('/one/:item');
    });

    it('does not find a length constrained (==) parametric route', () => {
        const routes: URLRoute[] = [
            {
                value: '/one/:item',
                parameters: {
                    item: {
                        length: 10,
                        lengthType: '==',
                    },
                },
            },
            {
                value: '/two',
            },
        ];
        const urlRouter = new URLRouter(routes);
        const match = urlRouter.match('/one/012345678');

        expect(match).toBe(undefined);
    });

    it('finds a length constrained (>) parametric route', () => {
        const routes: URLRoute[] = [
            {
                value: '/one/:item',
                parameters: {
                    item: {
                        length: 10,
                        lengthType: '>',
                    },
                },
            },
            {
                value: '/two',
            },
        ];
        const urlRouter = new URLRouter(routes);
        const match = urlRouter.match('/one/0123456789123');

        expect(match?.target).toBe('/one/:item');
    });

    it('handles query', () => {
        const routes: URLRoute[] = [
            {
                value: '/one',
            },
        ];
        const urlRouter = new URLRouter(routes);
        const match = urlRouter.match('/one?q=one');

        expect(match?.elements.query).toBe('q=one');
    });
});
// #endregion module
