import React from 'react';

import PluridApp, {
    PluridConfiguration,
    PluridPubSub,
    TOPICS,
} from '@plurid/plurid-react';

import Page1 from './containers/Page1';
import Page2 from './containers/Page2';


const pubsub = new PluridPubSub();

const App = () => {
    const appConfiguration: PluridConfiguration = {
        theme: 'plurid',
        space: {
            layout: {
                type: 'COLUMNS',
                // columns: 1,
            },
            center: true,
        },
        // planeWidth: 0.5,
        // planeControls: false,
        // planeOpacity: 0,
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
            root: true,
        },
        {
            path: '/page-3',
            component: {
                element: Page1,
                properties: {},
            },
            root: true,
        },
    ];

    pubsub.subscribe(TOPICS.CONFIGURATION, (data) => {
        console.log(data);
    });

    return (
        <div>
            <PluridApp
                configuration={appConfiguration}
                pages={appPages}
                pubsub={pubsub}
            />
        </div>
    );
}


export default App;
