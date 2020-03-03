import Matcher from '../';

import {
    Route,
} from '../../interfaces';



describe('Matcher', () => {
    it('simple route match', () => {
        const route: Route<any> = {
            location: '/one',
            view: 'one',
        };
        const matcher = new Matcher('/one', route);
        const response = matcher.data();

        expect(response?.pathname).toBe('/one');
    });

    it('simple route no match', () => {
        const route: Route<any> = {
            location: '/one',
            view: 'one',
        };
        const matcher = new Matcher('/two', route);
        const response = matcher.data();

        expect(response).toBe(undefined);
    });
});
