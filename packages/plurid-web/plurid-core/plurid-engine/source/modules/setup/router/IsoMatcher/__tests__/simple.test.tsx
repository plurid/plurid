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
            [
                '/some-parametric-plane/:id',
                'parametric-plane',
            ],
        ],
    },
    {
        value: '/parametric/:id',
        exterior: 'parametric-route',
    },
    {
        value: '/nested/static',
        exterior: 'nested-static',
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



xdescribe('IsoMatcher general', () => {
    it('matches index paths', () => {
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



    it('matches routes planes', () => {
        const isoMatcher = new IsoMatcher<string>({
            routes,
            routePlanes,
            planes,
        });

        // matches the route /
        const routePlaneIndexResult = isoMatcher.match(
            '/',
            'route',
        );
        expect(routePlaneIndexResult).toBeTruthy();
        if (routePlaneIndexResult) {
            expect(routePlaneIndexResult.kind).toEqual('Route');
        }

        // matches the route plane /some-plane
        const routePlanSomePlaneResult = isoMatcher.match(
            '/some-plane',
            'route',
        );
        expect(routePlanSomePlaneResult).toBeTruthy();
        if (routePlanSomePlaneResult) {
            expect(routePlanSomePlaneResult.kind).toEqual('RoutePlane');

            if (routePlanSomePlaneResult.kind === 'RoutePlane') {
                expect((routePlanSomePlaneResult.data as any).value).toEqual('/some-plane');
            }
        }
    });



    it('matches parametric routes planes', () => {
        const isoMatcher = new IsoMatcher<string>({
            routes,
            routePlanes,
            planes,
        });

        const routePlanSomePlaneResult = isoMatcher.match(
            '/1/some-parametric-plane/one',
            'route',
        );
        expect(routePlanSomePlaneResult).toBeTruthy();
        if (routePlanSomePlaneResult) {
            expect(routePlanSomePlaneResult.kind).toEqual('RoutePlane');

            if (routePlanSomePlaneResult.kind === 'RoutePlane') {
                expect(routePlanSomePlaneResult.match.value).toEqual('/1/some-parametric-plane/one');
                expect(routePlanSomePlaneResult.match.parameters.id).toEqual('one');
            }
        }
    });
});



describe('IsoMatcher simple', () => {
    it('matches simple routes', () => {
        const isoMatcher = new IsoMatcher<string>({
            routes,
            routePlanes,
            planes,
        });

        {
            const routeResult = isoMatcher.match(
                '/',
                'route',
            );
            expect(routeResult).toBeTruthy();
            if (routeResult) {
                expect(routeResult.kind).toEqual('Route');

                if (routeResult.kind === 'Route') {
                    expect(routeResult.data.value).toEqual('/');
                    expect(routeResult.match.value).toEqual('/');
                }
            }
        }

        {
            const routeResult = isoMatcher.match(
                '/1',
                'route',
            );
            expect(routeResult).toBeTruthy();
            if (routeResult) {
                expect(routeResult.kind).toEqual('Route');

                if (routeResult.kind === 'Route') {
                    expect(routeResult.data.value).toEqual('/1');
                    expect(routeResult.match.value).toEqual('/1');
                }
            }
        }

        {
            const routeResult = isoMatcher.match(
                '/nested/static',
                'route',
            );
            expect(routeResult).toBeTruthy();
            if (routeResult) {
                expect(routeResult.kind).toEqual('Route');

                if (routeResult.kind === 'Route') {
                    expect(routeResult.data.value).toEqual('/nested/static');
                    expect(routeResult.match.value).toEqual('/nested/static');
                }
            }
        }
    });



    it('matches parametric routes', () => {
        const isoMatcher = new IsoMatcher<string>({
            routes,
            routePlanes,
            planes,
        });

        {
            const routeResult = isoMatcher.match(
                '/parametric/one',
                'route',
            );
            expect(routeResult).toBeTruthy();
            if (routeResult) {
                expect(routeResult.kind).toEqual('Route');

                if (routeResult.kind === 'Route') {
                    expect(routeResult.data.value).toEqual('/parametric/:id');
                    expect(routeResult.match.value).toEqual('/parametric/one');
                    expect(routeResult.match.parameters.id).toEqual('one');
                }
            }
        }
    });



    it('matches queried routes', () => {
        const isoMatcher = new IsoMatcher<string>({
            routes,
            routePlanes,
            planes,
        });

        {
            const routeResult = isoMatcher.match(
                '/?query1=data-value1&query2=data-value2',
                'route',
            );
            expect(routeResult).toBeTruthy();
            if (routeResult) {
                expect(routeResult.kind).toEqual('Route');

                if (routeResult.kind === 'Route') {
                    expect(routeResult.data.value).toEqual('/');
                    expect(routeResult.match.value).toEqual('/');
                    expect(routeResult.match.query.query1).toEqual('data-value1');
                    expect(routeResult.match.query.query2).toEqual('data-value2');
                }
            }
        }

        {
            const routeResult = isoMatcher.match(
                '/?search=%20data%20',
                'route',
            );
            expect(routeResult).toBeTruthy();
            if (routeResult) {
                expect(routeResult.kind).toEqual('Route');

                if (routeResult.kind === 'Route') {
                    expect(routeResult.data.value).toEqual('/');
                    expect(routeResult.match.value).toEqual('/');
                    expect(routeResult.match.query.search).toEqual(' data ');
                }
            }
        }
    });
});
// #endregion module
