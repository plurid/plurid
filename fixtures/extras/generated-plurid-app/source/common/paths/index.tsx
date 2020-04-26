import React from 'react';

import {
    PluridLink,
} from '@plurid/plurid-react';

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

const multiplanePath: PluridRouterPath = {
    value: '/multiplane',
    planes: [
        {
            value: '/plane-1',
            component: {
                kind: 'react',
                element: () => (
                    <div>
                        <h1>Plane 1</h1>
                        <br />
                        <PluridLink path="/plane-2">link to plane 2</PluridLink>
                    </div>
                ),
            },
        },
        {
            value: '/plane-2',
            component: {
                kind: 'react',
                element: () => (<h1>Plane 2</h1>),
            },
        },
    ],
};

const parametricPath: PluridRouterPath = {
    value: '/parametric/:parameter',
    planes: [
        {
            value: '/plane',
            component: {
                kind: 'react',
                element: (properties) => {
                    const {
                        plurid,
                    } = properties;

                    return (
                        <div>
                            {plurid.path.parameters.parameter}
                        </div>
                    );
                },
            },
        },
    ],
}



const paths: PluridRouterPath[] = [
    indexPath,
    notFoundPath,
    staticPath,
    multiplanePath,
    parametricPath,
];


export default paths;
