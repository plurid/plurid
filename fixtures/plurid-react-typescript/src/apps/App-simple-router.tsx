import React from 'react';

import {
    PluridRouterBrowser,
    PluridRoute,
} from '@plurid/plurid-react';

import Plane1 from '../planes/Plane1';



const App = () => {
    const routes: PluridRoute[] = [
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
            // view: [
            //     '/plane',
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
        {
            value: '/not-found',
            planes: [
                {
                    value: '/',
                    component: {
                        kind: 'react',
                        element: () => (
                            <div>Not Found</div>
                        ),
                    },
                },
            ],
        },
    ];

    return (
        <PluridRouterBrowser
            routes={routes}
        />
    );
}


export default App;
