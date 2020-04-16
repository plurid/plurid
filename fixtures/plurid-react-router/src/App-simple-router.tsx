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
            element: Plane1,
        },
        value: '/one',
    };
    const planeTwo: PluridRouterPlane = {
        component: {
            kind: 'react',
            element: Plane2,
        },
        value: '/two',
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
            element: () => <div>static</div>,
        },
    };

    const pathWithStatic: PluridRouterPath = {
        value: '/path-static',
        exterior: {
            kind: 'react',
            element: () => (
                <div style={{position: 'absolute', zIndex: 9999}}>
                    with static
                </div>
            ),
        },
        spaces: [
            defaultSpace,
        ],
    };

    const slottedPath: PluridRouterPath = {
        value: '/slotted',
        exterior: {
            kind: 'react',
            element: (properties) => {
                console.log('properties', properties);
                return (
                    <div>
                        slotted

                        {properties.spaces.map((Space: any) => {
                            return (
                                <div
                                    style={{height: 400, width: 800}}
                                    key={Math.random() + ''}
                                >
                                    {Space}
                                </div>
                            );
                        })}
                    </div>
                );
            },
        },
        spaces: [
            defaultSpace,
        ],
        slotted: true,
    };


    const paths: PluridRouterPath[] = [
        indexPath,
        staticPath,
        pathWithStatic,
        slottedPath,
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
