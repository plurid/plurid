import React from 'react';

import PluridApp, {
    PluridConfiguration,
} from '@plurid/plurid-react';

import Page1Virtual from './containers/Page1Virtual';
import Page2 from './containers/Page2';



const App = () => {
    const appConfiguration: PluridConfiguration = {
        theme: 'plurid',
        space: {
            layout: {
                type: 'COLUMNS',
                // columns: 1,
            },
            // center: true,
            // transparent: true,
            // showTransformOrigin: false,
        },
        // micro: true,
        planeWidth: 0.5,
        // viewcube: false,
        // toolbar: false,
        // planeControls: false,
        // planeOpacity: 0,
    };

    const appPages = [
        {
            path: '/page-1',
            component: {
                element: Page1Virtual,
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
