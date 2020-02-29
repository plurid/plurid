import Router from '../';

import {
    Route,
} from '../../interfaces';



describe('Router', () => {
    it('simple route', () => {
        const routes: Route<any>[] = [
            {
                location: '/one',
                view: 'one',
            },
            {
                location: '/two',
                view: 'two',
            },
        ];
        const router = new Router(routes);
        const response = router.match('/one');

        expect(response?.pathname).toBe('/one');
    });

    it.only('simple route cached', () => {
        const routes: Route<any>[] = [
            {
                location: '/one',
                view: 'one',
            },
            {
                location: '/two',
                view: 'two',
            },
        ];
        const router = new Router(routes);
        const responseOne = router.match('/one');

        const responseTwo = router.match('/one');

        expect(responseOne?.pathname).toBe('/one');
    });

    it('simple route - parametric', () => {
        const routes: Route<any>[] = [
            {
                location: '/one/:element',
                view: 'one',
            },
            {
                location: '/two',
                view: 'two',
            },
        ];
        const router = new Router(routes);
        const response = router.match('/one/asd');

        expect(response?.pathname).toBe('/one/asd');
    });

    it('simple route - query', () => {
        const routes: Route<any>[] = [
            {
                location: '/one',
                view: 'one',
            },
            {
                location: '/two',
                view: 'two',
            },
        ];
        const router = new Router(routes);
        const response = router.match('/one?q=true');

        expect(response?.pathname).toBe('/one');

        const query = {
            q: 'true',
        };
        expect(response?.query).toStrictEqual(query);
    });

    it('simple route - fragment', () => {
        const routes: Route<any>[] = [
            {
                location: '/one',
                view: 'one',
            },
            {
                location: '/two',
                view: 'two',
            },
        ];
        const router = new Router(routes);
        const response = router.match('/two#:~:text=start');

        expect(response?.pathname).toBe('/two');

        const fragmentsTexts = [
            { type: 'text', start: 'start', end: '', occurence: 0 },
        ];
        expect(response?.fragments.texts).toStrictEqual(fragmentsTexts);
    });
});
