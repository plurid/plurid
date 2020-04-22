import {
    PluridRouterPath,
} from '@plurid/plurid-data';

import Index from '../../client/App/containers/Index';
import Static from '../../client/App/containers/Static';
import NotFound from '../../client/App/containers/NotFound';



const indexPath: PluridRouterPath = {
    value: '/',
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
                                        element: Index,
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
                                        element: NotFound,
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
        element: Static,
    },
};


const paths: PluridRouterPath[] = [
    indexPath,
    notFoundPath,
    staticPath,
];


export default paths;
