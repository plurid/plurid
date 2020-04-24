import React from 'react';

import {
    PluridRouterBrowser,
    PluridRouterPath,
} from '@plurid/plurid-react';

import Plane1 from './planes/Plane1';



const App = () => {
    const paths: PluridRouterPath[] = [
        {
            value: '/',
            planes: [
                {
                    value: '/plane',
                    component: {
                        kind: 'react',
                        element: Plane1,
                    },
                },
            ],
            // spaces: [
            //     {
            //         value: 'default',
            //         universes: [
            //             {
            //                 value: 'default',
            //                 clusters: [
            //                     {
            //                         value: 'default',
            //                         planes: [
            //                             {
            //                                 value: '/plane',
            //                                 component: {
            //                                     kind: 'react',
            //                                     element: Plane1,
            //                                 },
            //                             },
            //                         ],
            //                     },
            //                 ],
            //             },
            //         ],
            //     },
            // ],
        },
        {
            value: '/planar',
            exterior: {
                kind: 'react',
                element: () => (
                    <div>
                        planar route
                    </div>
                ),
            },
        },
    ];

    return (
        <PluridRouterBrowser
            paths={paths}
        />
    );
}


export default App;
