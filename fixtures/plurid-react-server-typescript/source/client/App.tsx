import React from 'react';

import {
    HelmetProvider,
} from 'react-helmet-async';

import PluridApp, {
    PluridPage,
    PluridView,
    SPACE_LAYOUT,
} from '@plurid/plurid-react';

import helmetContext from './helmet';

import Head from './components/Head';

import Page from './containers/Page';



const App = () => {
    /** properties */
    const pluridConfiguration = {
        theme: 'plurid',
        space: {
            layout: {
                type: SPACE_LAYOUT.COLUMNS,
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

    const pluridPages: PluridPage[] = [
        {
            path: '/page',
            component: {
                element: Page,
                properties: {},
            },
        },
    ];

    const pluridView: PluridView[] = [
        {
            path: '/page',
        }
    ];


    /** render */
    return (
        <HelmetProvider
            context={helmetContext}
        >
            <div>
                <Head />

                <PluridApp
                    configuration={pluridConfiguration}
                    pages={pluridPages}
                    view={pluridView}
                />
            </div>
        </HelmetProvider>
    );
}


export default App;
