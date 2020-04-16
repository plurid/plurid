import React from 'react';

import {
    PluridRouterBrowser,

    // PluridRouter,
    // PluridRouterHost,
    PluridRouterPath,
    PluridRouterSpace,
    PluridRouterUniverse,
    PluridRouterCluster,
    PluridRouterPlane,
} from '@plurid/plurid-react';

import Plane1 from './containers/Plane1';
import Plane2 from './containers/Plane2';



const App = () => {
    const planeOne: PluridRouterPlane = {
        component: {
            kind: 'react',
            component: Plane1,
        },
        value: 'one',
    };
    const planeTwo: PluridRouterPlane = {
        component: {
            kind: 'react',
            component: Plane2,
        },
        value: 'two',
    };

    const defaultCluster: PluridRouterCluster = {
        value: 'default',
        planes: [
            planeOne,
            planeTwo,
        ],
    };

    const defaultUniverse: PluridRouterUniverse = {
        value: 'default',
        clusters: [
            defaultCluster,
        ],
    };

    const defaultSpace: PluridRouterSpace = {
        value: 'default',
        universes: [
            defaultUniverse,
        ],
    };

    const indexPath: PluridRouterPath = {
        value: '/',
        spaces: [
            defaultSpace,
        ],
    };

    const staticPath: PluridRouterPath = {
        value: '/static',
        exterior: {
            kind: 'react',
            component: () => <div>static</div>,
        },
    };

    const paths: PluridRouterPath[] = [
        indexPath,
        staticPath,
    ];

    // const baseHost: PluridRouterHost = {
    //     protocol: 'http',
    //     hostname: 'localhost',
    //     paths,
    // };

    // const routing: PluridRouter = {
    //     hosts: [
    //         baseHost,
    //     ],
    // };

    return (
        <PluridRouterBrowser
            paths={paths}
        />
    );
}


export default App;
