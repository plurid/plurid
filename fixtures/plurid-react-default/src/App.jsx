import React from 'react';

import PluridApp from '@plurid/plurid-react';

import Page1 from './containers/Page1';
import Page2 from './containers/Page2';



const App = () => {

    const appConfiguration = {
        alterURL: false,
        pluridPlane: {
            showControls: true,
        },
    }

    const document1Pages = [
        {
            path: '/document-1/:page',
            component: {
                element: Page1,
                properties: {
                    page: 'path:page'
                },
            },
            location: 'root',
        },
        {
            path: '/document-1/page-1',
            component: {
                element: Page1,
                properties: {},
            },
            location: 'root',
        },
        {
            path: '/document-1/page-2',
            component: {
                element: Page2,
                properties: {},
            },
            location: 'left',
        },
    ];

    const document2Pages = [
        {
            path: '/document-2/page-1',
            component: {
                element: Page1,
                properties: {},
            },
            location: 'root',
        },
        {
            path: '/document-2/page-2',
            component: {
                element: Page2,
                properties: {},
            },
            location: 'left',
        },
    ];

    const appDocuments = [
        document1Pages,
        document2Pages,
    ];


    const appPages = [
        {
            path: '/',
            component: {
                element: Page1,
                properties: {},
            },
            location: 'root',
        },
        {
            path: '/page-2',
            component: {
                element: Page2,
                properties: {},
            },
            location: 'left',
        },
    ];

    return (
        <PluridApp
            configuration={appConfiguration}
            pages={appPages}
            // documents={appDocuments}
        />
    );
}


export default App;
