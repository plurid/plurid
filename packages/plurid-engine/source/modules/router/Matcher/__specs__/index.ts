import {
    PluridRouterPath,
} from '@plurid/plurid-data';

import Matcher from '../';



describe('Matcher', () => {
    it('simple route match', () => {
        const route: PluridRouterPath = {
            value: '/one',
            // path: '/one',
            // view: 'one',
        };
        const matcher = new Matcher('/one', route);
        const response = matcher.data();

        expect(response?.pathname).toBe('/one');
    });

    it('simple route no match', () => {
        const route: PluridRouterPath = {
            value: '/one',
            // path: '/one',
            // view: 'one',
        };
        const matcher = new Matcher('/two', route);
        const response = matcher.data();

        expect(response).toBe(undefined);
    });
});
