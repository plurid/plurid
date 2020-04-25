import React from 'react';

import {
    PluridRouterBrowser,
    PluridRouterPath,
} from '@plurid/plurid-react';



const App = () => {
    const paths: PluridRouterPath[] = [
        {
            value: '/:parameter',
            planes: [
                {
                    value: '/plane',
                    component: {
                        kind: 'react',
                        element: (properties) => {
                            const {
                                plurid,
                            } = properties;

                            return (
                                <div>
                                    plane with parameter: {plurid.path.parameters.parameter}
                                </div>
                            );
                        },
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
