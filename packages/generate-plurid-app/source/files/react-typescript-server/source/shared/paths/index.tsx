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

const staticPath: PluridRouterPath = {
    value: '/static',
    exterior: {
        kind: 'react',
        element: StaticPlane,
    },
};


const paths: PluridRouterPath[] = [
    indexPath,
    notFoundPath,
    staticPath,
];


export default paths;
