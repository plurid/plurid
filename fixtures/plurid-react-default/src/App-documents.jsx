import React from 'react';

import PluridApp, {
    PluridConfiguration,
    PluridPage,
    PluridDocument,
} from '@plurid/plurid-react';

import Page1 from './containers/Page1';
import Page2 from './containers/Page2';


const appPagesDocument1: PluridPage[] = [
    {
        path: '/page-1',
        component: {
            element: Page1,
            properties: {},
        },
        root: true,
    },
];

const document1: PluridDocument = {
    name: 'document1',
    pages: appPagesDocument1,
};


const appPagesDocument2: PluridPage[] = [
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
];

const document2: PluridDocument = {
    name: 'document2',
    pages: appPagesDocument2,
};



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
        // planeWidth: 0.5,
        // viewcube: false,
        // toolbar: false,
        // planeControls: false,
        // planeOpacity: 0,
    };

    const documents: PluridDocument[] = [
        document1,
        document2,
    ];

    return (
        <PluridApp
            configuration={appConfiguration}
            documents={documents}
        />
    );
}


export default App;
