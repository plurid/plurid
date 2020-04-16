import React, {
    // useState,
    // useEffect,
} from 'react';

import PluridApp, {
    PluridRouterBrowser,
    PluridRouting,
    // PluridRouterRouting,

    // PluridConfiguration,
    PluridPlane,
    PluridView,
    SPACE_LAYOUT,
} from '@plurid/plurid-react';

import Plane1 from './containers/Plane1';
import Plane2 from './containers/Plane2';



const App = () => {
    const appConfiguration = {
        // micro: true,
        theme: 'plurid',
        // transparentUI: true,
        space: {
            layout: {
                type: SPACE_LAYOUT.COLUMNS,
                columns: 8,
                // columnLength: 2,
                gap: 0.1,
            },
            center: true,
            // opaque: false,
        },
        elements: {
            // toolbar: {
            //     show: false,
            // },
            // viewcube: {
            //     show: false,
            // },
            plane: {
                width: 0.5,
                // opacity: 0,
                // controls: {
                //     show: false,
                // },
            },
        },
    };

    const planes: PluridPlane[] = [
        {
            path: '/one',
            component: {
                element: Plane1,
                properties: {},
            },
        },
        {
            path: '/two',
            component: {
                element: Plane2,
                properties: {},
            },
        },
        {
            path: '/three',
            component: {
                element: Plane1,
                properties: {},
            },
        },
    ];

    const pluridView: PluridView[] = [
        {
            path: '/one',
            ordinal: 1,
        },
        {
            path: '/two',
            ordinal: 2,
        },
        {
            path: '/three',
            ordinal: 0,
        },
    ];

    // const routing: PluridRouterRouting<any> = {
    //     routes: [
    //         {
    //             path: '/',
    //             view: 'one',
    //         },
    //         {
    //             path: '/one',
    //             view: 'one',
    //         },
    //     ],
    //     components: [
    //         {
    //             component: () => (<div>one</div>),
    //             view: 'one',
    //         }
    //     ]
    // }

    const routing: PluridRouting = {
        hosts: [
            {
                hostname: '',
                protocol: 'http',
                routes: [
                    {
                        value: '/',
                        spaces: [
                            {
                                value: '',
                                universes: [
                                    {
                                        value: '',
                                        clusters: [
                                            {
                                                value: '',
                                                planes: [],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    };

    return (
        <PluridRouterBrowser
            routing={routing}
        />
    )

    // return (
    //     <div>
    //         <PluridApp
    //             configuration={appConfiguration}
    //             planes={planes}
    //             view={pluridView}
    //         />
    //     </div>
    // );
}


export default App;
