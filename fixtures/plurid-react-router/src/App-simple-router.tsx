import React from 'react';

import {
    PluridRouterBrowser,

    PluridRouting,
    PluridRoutingHost,
    PluridRoutingPath,
    PluridRoutingSpace,
    PluridRoutingUniverse,
    PluridRoutingCluster,
    PluridRoutingPlane,
} from '@plurid/plurid-react';

import Plane1 from './containers/Plane1';
import Plane2 from './containers/Plane2';



const App = () => {
    const planeOne: PluridRoutingPlane = {
        component: {
            kind: 'react',
            component: Plane1,
        },
        value: 'one',
    };
    const planeTwo: PluridRoutingPlane = {
        component: {
            kind: 'react',
            component: Plane2,
        },
        value: 'two',
    };

    const defaultCluster: PluridRoutingCluster = {
        value: 'default',
        planes: [
            planeOne,
            planeTwo,
        ],
    };

    const defaultUniverse: PluridRoutingUniverse = {
        value: 'default',
        clusters: [
            defaultCluster,
        ],
    };

    const defaultSpace: PluridRoutingSpace = {
        value: 'default',
        universes: [
            defaultUniverse,
        ],
    };

    const indexPath: PluridRoutingPath = {
        value: '/',
        spaces: [
            defaultSpace,
        ],
    };

    const staticPath: PluridRoutingPath = {
        value: '/static',
        exterior: {
            kind: 'react',
            component: () => <div>static</div>,
        },
        spaces: [],
    };

    const baseHost: PluridRoutingHost = {
        protocol: 'http',
        hostname: 'localhost',
        paths: [
            indexPath,
            staticPath,
        ],
    };

    const routing: PluridRouting = {
        hosts: [
            baseHost,
        ],
    };

    return (
        <PluridRouterBrowser
            routing={routing}
        />
    );
}


export default App;
