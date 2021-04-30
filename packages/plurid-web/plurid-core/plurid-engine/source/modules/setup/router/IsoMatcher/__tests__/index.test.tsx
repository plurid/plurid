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
        expect(routeResult?.route.value).toEqual('/');

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
        expect(routeResult?.route.value).toEqual('/parametric/:id');

        // const routePlaneResult = isoMatcher.match(
        //     '/',
        // );
        // expect((routePlaneResult?.data as any).value).toEqual('/');

        const planeResult = isoMatcher.match(
            '/parametric/one',
        );
        expect((planeResult?.data as any).route).toEqual('/parametric/:id');
    });
});
// #endregion module
