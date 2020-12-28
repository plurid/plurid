import {
    PluridRoute,
} from '@plurid/plurid-data';

import Router from '..';



describe('Router', () => {
    it('simple route', () => {
        const routes: PluridRoute[] = [
            {
                value: '/',
                // path: '/',
                // view: 'index',
            },
            {
                value: '/one',
                // path: '/one',
                // view: 'one',
            },
            {
                value: '/two',
                // path: '/two',
                // view: 'two',
            },
        ];
        const router = new Router(routes);
        const response = router.match('/');

        expect(response?.pathname).toBe('/');
    });

    it.only('simple route cached', () => {
        const routes: PluridRoute[] = [
            {
                value: '/one',
                // path: '/one',
                // view: 'one',
            },
            {
                value: '/two',
                // path: '/two',
                // view: 'two',
            },
        ];
        const router = new Router(routes);
        const responseOne = router.match('/one');

        const responseTwo = router.match('/one');

        expect(responseOne?.pathname).toBe('/one');
    });

    it('simple route - parametric', () => {
        const routes: PluridRoute[] = [
            {
                value: '/one/:element',
                // path: '/one/:element',
                // view: 'one',
            },
            {
                value: '/two',
                // path: '/two',
                // view: 'two',
            },
        ];
        const router = new Router(routes);
        const response = router.match('/one/asd');

        expect(response?.pathname).toBe('/one/asd');
    });

    it('simple route - query', () => {
        const routes: PluridRoute[] = [
            {
                value: '/one',
                // path: '/one',
                // view: 'one',
            },
            {
                value: '/two',
                // path: '/two',
                // view: 'two',
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
        const routes: PluridRoute[] = [
            {
                value: '/one',
                // path: '/one',
                // view: 'one',
            },
            {
                value: '/two',
                // path: '/two',
                // view: 'two',
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
