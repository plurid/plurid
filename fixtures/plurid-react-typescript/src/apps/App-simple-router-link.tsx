import React from 'react';

import {
    PluridRouterBrowser,
    PluridRoute,
    PluridLink,
} from '@plurid/plurid-react';



const App = () => {
    const routes: PluridRoute[] = [
        {
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
                                <PluridLink route="/plane-2">link to plane 2</PluridLink>
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
        },
    ];

    return (
        <PluridRouterBrowser
            routes={routes}
        />
    );
}


export default App;
