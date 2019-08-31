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

    const aPages = [];
    const bPages = [];
    // const combinedPages = [ ...aPages, ...bPages ];

    const appDocuments = [
        aPages,
        bPages,
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
            path: '/page2',
            component: {
                element: Page2,
                properties: {},
            },
            location: 'left',
        },
    ];

    return (
        <div>
            <PluridApp
                configuration={appConfiguration}
                pages={appPages}
                documents={appDocuments}
            />
        </div>
    )
}


export default App;