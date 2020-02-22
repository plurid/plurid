import React from 'react';

import PluridApp from '@plurid/plurid-react';

import Page from './containers/Page';



const App = () => {
    /** properties */
    const pluridConfiguration = {
        theme: 'plurid',
        space: {
            layout: {
                type: 'columns',
                columns: 2,
                gap: 0.1,
            },
            center: true,
        },
        elements: {
            plane: {
                width: 0.5,
            },
        },
    };

    const pluridPages = [
        {
            path: '/page',
            component: {
                element: Page,
                properties: {},
            },
        },
    ];

    const pluridView = [
        {
            path: '/page',
        }
    ];


    /** render */
    return (
        <div>
            <PluridApp
                configuration={pluridConfiguration}
                pages={pluridPages}
                view={pluridView}
            />
        </div>
    );
}


export default App;
