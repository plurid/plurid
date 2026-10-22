// #region imports
    // #region libraries
    import React from 'react';

    import {
        renderToString,
    } from 'react-dom/server';
    // #endregion libraries


    // #region external
    import PluridApplication from '~containers/Application';
    import PluridRouterStatic from '~containers/RouterStatic';
    // #endregion external
// #endregion imports



// #region module
/**
 * AN APPLICATION IN A ROUTE'S EXTERIOR IS ON THE ROUTER'S HOST (2026-10-22).
 *
 * Only the route's own application was handed the router's `hostname`. One a product renders in the
 * route's exterior (a page holding its own space) had none: on the server its planes were
 * `plurid://origin/…`, in the browser `plurid://<location.host>/…`, and the page did not hydrate
 * (plurid.cloud's dashboard, every page load).
 */
const page = () => <p>page</p>;

const planesOf = (
    html: string,
) => [...html.matchAll(/data-plurid-plane="([^"]+)"/g)].map((match) => match[1]);

const serve = (
    exterior: React.FC,
) => renderToString(
    <PluridRouterStatic
        path="/"
        hostname="example.com:8080"
        routes={[{ value: '/', exterior } as any]}
        planes={[]}
    />,
);


describe('the host of an application inside a route', () => {
    it('is the router\'s when the application names none', () => {
        const html = serve(() => (
            <PluridApplication
                planes={[{ route: '/inline', component: page }]}
                view={['/inline']}
            />
        ));

        const planes = planesOf(html);
        expect(planes.length).toBeGreaterThan(0);
        for (const plane of planes) {
            expect(plane.startsWith('plurid://example.com:8080/inline')).toBe(true);
        }
    });

    it('is the application\'s own when it names one', () => {
        const html = serve(() => (
            <PluridApplication
                hostname="elsewhere.com"
                planes={[{ route: '/inline', component: page }]}
                view={['/inline']}
            />
        ));

        const planes = planesOf(html);
        expect(planes.length).toBeGreaterThan(0);
        for (const plane of planes) {
            expect(plane.startsWith('plurid://elsewhere.com/inline')).toBe(true);
        }
    });
});
// #endregion module
