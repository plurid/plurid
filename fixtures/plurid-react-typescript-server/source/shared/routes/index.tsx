// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridReactRoute,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import IndexPagePlane from '../kernel/planes/Index/Page';
    import NotFoundPlane from '../kernel/planes/NotFound';
    import StaticPlane from '../kernel/planes/Static';

    import Head from '../kernel/components/Head';
    // #endregion external
// #endregion imports



// #region module
const indexRoute: PluridReactRoute = {
    value: '/',
    exterior: Head,
    planes: [
        [
            '/plane',
            IndexPagePlane,
        ],
    ],
    view: [
        '/plane',
    ],
};


const staticRoute: PluridReactRoute = {
    value: '/static',
    exterior: StaticPlane,
};


const planesRoute: PluridReactRoute = {
    value: '/planes',
    exterior: () => (
        <Head
            title="Planes | Plurid' Application"
        />
    ),
    planes: [
        {
            value: '/plane-1',
            component: () => (<div>plane 1</div>),
        },
        {
            value: '/plane-2',
            component: () => (<div>plane 2</div>),
            link: '/planes/plane-2',
        },
    ],
    view: [
        '/plane-1',
    ],
    defaultConfiguration: {
        global: {
            theme: 'plurid',
        },
        space: {
            opaque: false,
            center: true,
        },
        elements: {
            plane: {
                controls: {
                    show: false,
                },
                width: typeof window !== 'undefined'
                    ? window.innerWidth < 800 ? 1 : 0.5
                    : undefined,
            },
            viewcube: {
                show: typeof window !== 'undefined'
                    ? window.innerWidth < 800 ? false
                    : true : undefined,
            },
        },
    },
};


const parametricRoute: PluridReactRoute = {
    value: '/parametric/:parameter',
    parameters: {
        parameter: {
            length: 10,
            lengthType: '==',
        },
    },
    exterior: StaticPlane,
};


const notFoundRoute: PluridReactRoute = {
    value: '/not-found',
    exterior: () => (
        <Head
            title="Not Found | Plurid' Application"
        />
    ),
    spaces: [
        {
            value: 'default',
            universes: [
                {
                    value: 'default',
                    clusters: [
                        {
                            value: 'default',
                            planes: [
                                {
                                    value: '/',
                                    component: NotFoundPlane,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};


const routes: PluridReactRoute[] = [
    indexRoute,
    staticRoute,
    planesRoute,
    parametricRoute,
    notFoundRoute,
];
// #endregion module



// #region exports
export default routes;
// #endregion exports
