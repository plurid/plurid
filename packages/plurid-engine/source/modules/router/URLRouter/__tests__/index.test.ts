import URLRouter from '../';

import {
    URLRoute,
} from '../data';



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

        expect(match?.value).toBe('/one');
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

        expect(match?.value).toBe('/one/:item');
    });

    it('finds a length constrained (==) parametric route', () => {
        const routes: URLRoute[] = [
            {
                value: '/one/:item',
                parameters: {
                    item: {
                        length: 10,
                    },
                },
            },
            {
                value: '/two',
            },
        ];
        const urlRouter = new URLRouter(routes);
        const match = urlRouter.match('/one/0123456789');

        expect(match?.value).toBe('/one/:item');
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
});
