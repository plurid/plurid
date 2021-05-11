// #region imports
    // #region libraries
    import {
        PluridRoute,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import Matcher from '../';
    // #endregion external
// #endregion imports



// #region module
describe('Matcher', () => {
    it('simple route match', () => {
        const route: PluridRoute = {
            value: '/one',
            // path: '/one',
            // view: 'one',
        };
        const matcher = new Matcher('/one', route);
        const response = matcher.data();

        expect(response?.pathname).toBe('/one');
    });

    it('simple route no match', () => {
        const route: PluridRoute = {
            value: '/one',
            // path: '/one',
            // view: 'one',
        };
        const matcher = new Matcher('/two', route);
        const response = matcher.data();

        expect(response).toBe(undefined);
    });
});
// #endregion module
