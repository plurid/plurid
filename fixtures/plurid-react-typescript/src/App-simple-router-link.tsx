import React from 'react';

import {
    PluridRouterBrowser,
    PluridRouterPath,
    PluridLink,
} from '@plurid/plurid-react';



const App = () => {
    const paths: PluridRouterPath[] = [
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
                                <PluridLink path="/plane-2">link to plane 2</PluridLink>
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
            paths={paths}
        />
    );
}


export default App;
