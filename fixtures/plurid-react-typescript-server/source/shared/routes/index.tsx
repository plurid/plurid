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

    import Home from '../kernel/containers/Home';
    import Head from '../kernel/components/Head';
    // #endregion external
// #endregion imports



// #region module
const indexRoute: PluridReactRoute = {
    value: '/',
    exterior: Home,
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
            value: 'plane-1',
            component: () => (<div>plane 1</div>),
            // link: '/planes/plane-1',
        },
        {
            value: 'plane-2',
            component: () => (<div>plane 2</div>),
            // link: '/planes/plane-2',
        },
    ],
    view: [
        '/planes/plane-1',
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
    planes: [
        [ '/not-found', NotFoundPlane ],
    ],
    view: [
        '/not-found',
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
