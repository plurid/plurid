import React from 'react';

import PluridApp, {
    PluridConfiguration,
    PluridPubSub,
    // TOPICS,
} from '@plurid/plurid-react';

import Page1 from './containers/Page1';
import Page2 from './containers/Page2';

const pluridPubSub = new PluridPubSub();


const App = () => {

    // setInterval(() => {
    //     pluridPubSub.publish(TOPICS.SPACE_INCREASE_ROTATE_Y, { value: 1 });
    // }, 50);

    const appConfiguration: PluridConfiguration = {
        // alterURL: false,
        theme: 'deview',
        space: {
            layout: {
                type: 'COLUMNS',
            },
        },
        planeControls: false,
        // planes: {
        //     domainURL: true,
        //     width: 50,
        //     showControls: true,
        // },
        // roots: {
        //     layout: [
        //         '/page-2', '/page-1', '/page-3'
        //     ],
        //     camera: '/page-1',
        // },
    };

    // const document1Pages = [
    //     {
    //         path: '/document-1/:page',
    //         component: {
    //             element: Page1,
    //             properties: {
    //                 page: 'path:page'
    //             },
    //         },
    //         location: 'root',
    //     },
    //     {
    //         path: '/document-1/page-1',
    //         component: {
    //             element: Page1,
    //             properties: {},
    //         },
    //         location: 'root',
    //     },
    //     {
    //         path: '/document-1/page-2',
    //         component: {
    //             element: Page2,
    //             properties: {},
    //         },
    //         location: 'left',
    //     },
    // ];

    // const document2Pages = [
    //     {
    //         path: '/document-2/page-1',
    //         component: {
    //             element: Page1,
    //             properties: {},
    //         },
    //         location: 'root',
    //     },
    //     {
    //         path: '/document-2/page-2',
    //         component: {
    //             element: Page2,
    //             properties: {},
    //         },
    //         location: 'left',
    //     },
    // ];

    // const appDocuments = [
    //     {
    //         name: 'document-1',
    //         pages: document1Pages,
    //     },
    //     {
    //         name: 'document-2',
    //         pages: document2Pages,
    //     },
    // ];


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
        {
            path: '/page-4',
            component: {
                element: Page1,
                properties: {},
            },
            root: true,
        },
        // {
        //     path: '/page-5',
        //     component: {
        //         element: Page1,
        //         properties: {},
        //     },
        //     root: true,
        // },
        // {
        //     path: '/page-3',
        //     component: {
        //         element: Page1,
        //         properties: {},
        //     },
        //     root: true,
        // },
    ];

    return (
        <div
            style={{height: '100%'}}
        >
            <PluridApp
                configuration={appConfiguration}
                pages={appPages}
                // documents={appDocuments}
                pubsub={pluridPubSub}
            />
        </div>
    );
}


export default App;
