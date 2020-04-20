import React from 'react';

import {
    PluridRouterBrowser,
    PluridRouterLink,

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

    const aCluster: PluridRouterCluster = {
        value: 'a-cluster',
        planes: [
            planeOne,
        ],
    };

    const defaultUniverse: PluridRouterUniverse = {
        value: 'default',
        clusters: [
            defaultCluster,
        ],
    };

    const aUniverse: PluridRouterUniverse = {
        value: 'a-universe',
        clusters: [
            aCluster,
        ],
    };

    const defaultSpace: PluridRouterSpace = {
        value: 'default',
        universes: [
            defaultUniverse,
        ],
    };

    const aSpace: PluridRouterSpace = {
        value: 'a-space',
        universes: [
            aUniverse,
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
            element: () => (
                <div>
                    static, <PluridRouterLink path="/path-static">to /path-static</PluridRouterLink>
                    <br />
                    <PluridRouterLink path="/">to /</PluridRouterLink>
                </div>
            ),
        },
    };

    const pathWithStatic: PluridRouterPath = {
        value: '/path-static',
        exterior: {
            kind: 'react',
            element: () => (
                <div style={{position: 'absolute', zIndex: 9999}}>
                    with static,

                    <PluridRouterLink path="static">to /static</PluridRouterLink>
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

    const pathWithParameterOne: PluridRouterPath = {
        value: '/path1/:parameterOne',
        // parameters: {
        //     parameterOne: {
        //         length: 12,
        //         lengthType: '<=',
        //         startsWith: '',
        //         endsWith: '',
        //     },
        // },
        spaces: [
            aSpace,
        ],
    };

    const pathWithParameterTwo: PluridRouterPath = {
        value: '/path2/:parameterTwo',
        // parameters: {
        //     parameterOne: {
        //         length: 12,
        //         lengthType: '>',
        //     },
        // },
        spaces: [
            defaultSpace,
        ],
    };

    const paths: PluridRouterPath[] = [
        indexPath,
        staticPath,
        pathWithStatic,
        slottedPath,
        pathWithParameterOne,
        pathWithParameterTwo,
    ];


    return (
        <PluridRouterBrowser
            paths={paths}
            gatewayPath="/gateway"
            // cleanNavigation={true}
        />
    );
}


export default App;
