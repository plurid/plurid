import React from 'react';

import {
    PluridRouterPath,
} from '@plurid/plurid-data';

import IndexPagePlane from '../../client/App/planes/Index/Page';
import NotFoundPlane from '../../client/App/planes/NotFound';
import StaticPlane from '../../client/App/planes/Static';

import Head from '../../client/App/components/Head';



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
