import React from 'react';

import {
    PluridRouterBrowser,
    PluridRouterPath,
} from '@plurid/plurid-react';



const App = () => {
    const paths: PluridRouterPath[] = [
        {
            value: '/simple/:parameter',
            planes: [
                {
                    value: '/plane-1',
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
                // {
                //     value: '/plane-2',
                //     component: {
                //         kind: 'react',
                //         element: (properties) => {
                //             const {
                //                 plurid,
                //             } = properties;

                //             return (
                //                 <div>
                //                     plane with parameter: {plurid.path.parameters.parameter}
                //                 </div>
                //             );
                //         },
                //     },
                // },
            ],
        },
        {
            value: '/includes/:parameter',
            parameters: {
                parameter: {
                    includes: ['one', 'two'],
                },
            },
            planes: [
                {
                    value: '/',
                    component: {
                        kind: 'react',
                        element: (properties) => {
                            const {
                                plurid,
                            } = properties;

                            return (
                                <div>{plurid.path.parameters.parameter}</div>
                            );
                        }
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
