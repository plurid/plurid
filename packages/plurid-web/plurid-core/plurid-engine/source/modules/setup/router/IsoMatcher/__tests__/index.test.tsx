// #region imports
    // #region libraries
    import {
        PluridRoute,
        PluridRoutePlane,
        PluridPlane,
    } from '@plurid/plurid-data';
    // #endregion libraries

    // #region external
    import IsoMatcher from '../';
    // #endregion external
// #endregion imports



// #region module
const routes: PluridRoute<string>[] = [
    {
        value: '/',
        exterior: 'index',
        planes: [
            [
                '/some-plane',
                'index-plane',
            ],
        ],
    },
    {
        value: '/1',
        exterior: 'static',
        planes: [
            [
                '/some-other-plane',
                'route-plane',
            ],
        ],
    },
    {
        value: '/parametric/:id',
        exterior: 'parametric-route',
    },
];

const routePlanes: PluridRoutePlane<string>[] = [
    {
        value: '/',
        component: 'index',
    },
    {
        value: '/1',
        component: 'static',
    },
    {
        value: '/2/3',
        component: 'static-nested',
    },
];

const planes: PluridPlane<string>[] = [
    {
        route: '/p',
        component: 'index',
    },
    {
        route: '/p/1',
        component: 'static',
    },
    [
        '/p/2/3',
        'static-nested',
    ],
    [
        '/parametric/:id',
        'parametric',
    ],
];


describe('IsoMatcher', () => {
    xit('matches index paths', () => {
        const isoMatcher = new IsoMatcher<string>({
            routes,
            routePlanes,
            planes,
        });

        const routeResult = isoMatcher.match(
            '/',
            'route',
        );
        if (routeResult?.kind === 'Route') {
            expect(routeResult?.data.value).toEqual('/');
        }

        const routePlaneResult = isoMatcher.match(
            '/',
        );
        expect((routePlaneResult?.data as any).value).toEqual('/');

        const planeResult = isoMatcher.match(
            '/p',
        );
        expect((planeResult?.data as any).route).toEqual('/p');
    });



    it('matches parametric paths', () => {
        const isoMatcher = new IsoMatcher<string>({
            routes,
            routePlanes,
            planes,
        });

        const routeResult = isoMatcher.match(
            '/parametric/one',
            'route',
        );
        expect(routeResult).toBeTruthy();
        if (routeResult) {
            expect(routeResult.kind).toEqual('Route');

            if (routeResult.kind === 'Route') {
                expect(routeResult.data.value).toEqual('/parametric/:id');
                expect(routeResult.match.parameters.id).toEqual('one');
            }
        }

        // const routePlaneResult = isoMatcher.match(
        //     '/',
        // );
        // expect((routePlaneResult?.data as any).value).toEqual('/');

        const planeResult = isoMatcher.match(
            '/parametric/one',
        );
        expect(planeResult).toBeTruthy();
        if (planeResult) {
            expect(planeResult.kind).toEqual('Plane');

            if (planeResult.kind === 'Plane') {
                expect(planeResult.data.route).toEqual('/parametric/:id');
                expect(planeResult.match.parameters.id).toEqual('one');
            }
        }
    });



    it('matches parametric with query paths', () => {
        const isoMatcher = new IsoMatcher<string>({
            routes,
            routePlanes,
            planes,
        });

        const routeResult = isoMatcher.match(
            '/parametric/one?some=query&another=query',
            'route',
        );
        expect(routeResult).toBeTruthy();
        if (routeResult) {
            expect(routeResult.kind).toEqual('Route');

            if (routeResult.kind === 'Route') {
                expect(routeResult.data.value).toEqual('/parametric/:id');
                expect(routeResult.match.parameters.id).toEqual('one');
                expect(routeResult.match.query.some).toEqual('query');
                expect(routeResult.match.query.another).toEqual('query');
            }
        }

        // const routePlaneResult = isoMatcher.match(
        //     '/',
        // );
        // expect((routePlaneResult?.data as any).value).toEqual('/');

        const planeResult = isoMatcher.match(
            '/parametric/one?some=query&another=query',
        );
        expect(planeResult).toBeTruthy();
        if (planeResult) {
            expect(planeResult.kind).toEqual('Plane');

            if (planeResult.kind === 'Plane') {
                expect(planeResult.data.route).toEqual('/parametric/:id');
                expect(planeResult.match.parameters.id).toEqual('one');
                expect(planeResult.match.query.some).toEqual('query');
                expect(planeResult.match.query.another).toEqual('query');
            }
        }
    });



    it('matches parametric with query and fragment paths', () => {
        const isoMatcher = new IsoMatcher<string>({
            routes,
            routePlanes,
            planes,
        });

        const planeResult = isoMatcher.match(
            '/parametric/one?some=query&another=query#:~:text=example',
        );
        expect(planeResult).toBeTruthy();
        if (planeResult) {
            expect(planeResult.kind).toEqual('Plane');

            if (planeResult.kind === 'Plane') {
                expect(planeResult.data.route).toEqual('/parametric/:id');
                expect(planeResult.match.parameters.id).toEqual('one');
                expect(planeResult.match.query.some).toEqual('query');
                expect(planeResult.match.query.another).toEqual('query');

                expect(planeResult.match.fragments.texts.length).toEqual(1);
                expect(planeResult.match.fragments.texts[0].type).toEqual('text');
                expect(planeResult.match.fragments.texts[0].start).toEqual('example');
            }
        }
    });
});
// #endregion module
