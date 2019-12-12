import React from 'react';

import PluridApp, {
    PluridConfiguration,
} from '@plurid/plurid-react';

import Page1 from './containers/Page1';
import Page2 from './containers/Page2';



const App = () => {
    const appConfiguration: PluridConfiguration = {
        // micro: true,
        theme: 'plurid',
        space: {
            layout: {
                type: 'COLUMNS',
                // columns: 1,
            },
            // transformOrigin: {
            //     show: false,
            //     size: 'large',
            // },
            center: true,
            // opaque: false,
        },
        elements: {
        //     toolbar: {
        //         show: false,
        //     },
        //     viewcube: {
        //         show: false,
        //     },
            plane: {
                width: 0.5,
        //         opacity: 0,
        //         controls: {
        //             show: false,
        //         },
            },
        },
    };

    const appPages = [
        {
            path: '/page-1',
            component: {
                element: Page1,
                properties: {},
            },
            root: true,
        },
        {
            path: '/page-2',
            component: {
                element: Page2,
                properties: {},
            },
            // root: true,
        },
        {
            path: '/page-3',
            component: {
                element: Page1,
                properties: {},
            },
            // root: true,
        },
    ];

    return (
        <div>
            <PluridApp
                configuration={appConfiguration}
                pages={appPages}
            />
        </div>
    );
}


export default App;
