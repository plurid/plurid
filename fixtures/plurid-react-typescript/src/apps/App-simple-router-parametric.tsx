import React from 'react';

import {
    PluridRouterBrowser,
    PluridReactRoute,
} from '@plurid/plurid-react';



const App = () => {
    const routes: PluridReactRoute[] = [
        {
            value: '/simple/:parameter',
            planes: [
                {
                    value: '/plane-1',
                    component: (properties) => {
                        const {
                            plurid,
                        } = properties;

                        return (
                            <div>
                                plane with parameter: {plurid.route.path.parameters.parameter}
                            </div>
                        );
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
                    component: (properties) => {
                        const {
                            plurid,
                        } = properties;

                        return (
                            <div>{plurid.route.path.parameters.parameter}</div>
                        );
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
