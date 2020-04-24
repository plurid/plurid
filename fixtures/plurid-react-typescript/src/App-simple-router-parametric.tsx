import React from 'react';

import {
    PluridRouterBrowser,
    PluridRouterPath,
} from '@plurid/plurid-react';

import Plane1 from './planes/Plane1';



const App = () => {
    const paths: PluridRouterPath[] = [
        {
            value: '/:parameter',
            planes: [
                {
                    value: '/plane',
                    component: {
                        kind: 'react',
                        element: Plane1,
                    },
                },
            ],
        },
    ];

    return (
        <PluridRouterBrowser
            paths={paths}
        />
    );
}


export default App;
