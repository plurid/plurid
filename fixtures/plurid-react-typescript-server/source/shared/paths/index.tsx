import React from 'react';

import {
    PluridRouterPath,
} from '@plurid/plurid-data';

import IndexPagePlane from '../kernel/planes/Index/Page';
import NotFoundPlane from '../kernel/planes/NotFound';
import StaticPlane from '../kernel/planes/Static';

import Head from '../kernel/components/Head';



const indexPath: PluridRouterPath = {
    value: '/',
    exterior: {
        kind: 'react',
        element: Head,
    },
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
                                    value: '/page',
                                    component: {
                                        kind: 'react',
                                        element: IndexPagePlane,
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
}


const staticPath: PluridRouterPath = {
    value: '/static',
    exterior: {
        kind: 'react',
        element: StaticPlane,
    },
};


const planesPath: PluridRouterPath = {
    value: '/planes',
    exterior: {
        kind: 'react',
        element: () => (
            <Head
                title="Planes | Plurid' Application"
            />
        ),
    },
    planes: [
        {
            value: '/plane-1',
            component: {
                kind: 'react',
                element: () => (<div>plane 1</div>),
            },
        },
        {
            value: '/plane-2',
            component: {
                kind: 'react',
                element: () => (<div>plane 2</div>),
            },
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


const parametricPath: PluridRouterPath = {
    value: '/parametric/:parameter',
    parameters: {
        parameter: {
            length: 10,
            lengthType: '==',
        },
    },
    exterior: {
        kind: 'react',
        element: StaticPlane,
    },
};


const notFoundPath: PluridRouterPath = {
    value: '/not-found',
    exterior: {
        kind: 'react',
        element: () => (
            <Head
                title="Not Found | Plurid' Application"
            />
        ),
    },
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
                                    component: {
                                        kind: 'react',
                                        element: NotFoundPlane,
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};


const paths: PluridRouterPath[] = [
    indexPath,
    staticPath,
    planesPath,
    parametricPath,
    notFoundPath,
];


export default paths;
