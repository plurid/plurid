import {
    PluridRouterPath,
} from '@plurid/plurid-data';

import IndexPagePlane from '../../client/App/planes/Index/Page';
import NotFoundPlane from '../../client/App/planes/NotFound';
import StaticPlane from '../../client/App/planes/Static';



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
