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
];


describe('IsoMatcher', () => {
    it('works', () => {
        const isoMatcher = new IsoMatcher<string>({
            routes,
            routePlanes,
            planes,
        });

        // the result should be a RouteResult
        // something which is meant to be displayed on a browser route
        const routeResult = isoMatcher.match(
            '/',
            'route',
        );

        // the result should be a PlaneResult
        // something which is meant to be displayed in a specific plurid space
        // const planeResult = isoMatcher.match(
        //     '/',
        //     // 'plane',
        // );
    });
});
// #endregion module
