import React from 'react';

import PluridApp from '@plurid/plurid-react';

import Page1 from './containers/Page1';
import Page2 from './containers/Page2';



const App = () => {

    const appOptions = {
        alterURL: false,
        pluridPlane: {
            showControls: true,
        },
    }

    // const aRoutes = [];
    // const bRoutes = [];
    // const combineRoutes = [ ...aRoutes, ...bRoutes ];

    const appRoutes = [
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
                options={appOptions}
                routes={appRoutes}
            />
        </div>
    )
}


export default App;