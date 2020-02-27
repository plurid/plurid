import React from 'react';

import {
    Helmet,
} from 'react-helmet';

import PluridApp, {
    PluridPage,
    PluridView,
    SPACE_LAYOUT,
} from '@plurid/plurid-react';

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
        <div>
            <Helmet>
                <meta charSet="utf-8" />
                <meta name="robots" content="index,follow" />
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
                <meta name="description" content="Plurid' Application" />

                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" href="/logo-192x192.png" />
                <meta name="theme-color" content="#000000" />

                <link rel="manifest" href="/manifest.json" />

                <link rel="canonical" href="https://plurid.com." />

                <title>Plurid' Application</title>

                <meta property="og:type" content="website" />
                <meta property="og:title" content="plurid" />
                <meta property="og:image" content="/logo-192x192.png" />
                <meta property="og:site_name" content="plurid" />
                <meta property="og:url" content="https://plurid.com" />
                <meta property="og:description" content="explore web content in three dimensions" />
            </Helmet>

            <PluridApp
                configuration={pluridConfiguration}
                pages={pluridPages}
                view={pluridView}
            />
        </div>
    );
}


export default App;
