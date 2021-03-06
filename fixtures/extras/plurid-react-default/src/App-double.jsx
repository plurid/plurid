import React from 'react';

import {
    PluridSubApp,
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
        theme: 'plurid',
        space: {
            layout: {
                type: 'COLUMNS',
            },
            center: true,
        },
        planeWidth: 0.5,
        planeControls: false,
        planeOpacity: 0,
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

    // useEffect(() => {
        // pluridPubSub.subscribe(TOPICS.SPACE_TRANSFORM, (data: any) => {
        //     console.log(data);
        // });
    // }, []);

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
        // {
        //     path: '/page-4',
        //     component: {
        //         element: Page1,
        //         properties: {},
        //     },
        //     root: true,
        // },
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

    const appPages2 = [
        {
            path: '/page-1',
            component: {
                element: Page2,
                properties: {},
            },
            root: true,
        },
    ];

    return (
        <div
            style={{
                height: '100%',
                // width: '100%',
                width: '700px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr'
            }}
            // style={{height: '500px', width: '400px'}}
        >
            <div
                style={{
                    position: 'relative',
                    width: '300px',
                    height: '800px',
                }}
            >
                <PluridSubApp
                    configuration={appConfiguration}
                    pages={appPages}
                    // documents={appDocuments}
                    pubsub={pluridPubSub}
                />
            </div>

            <div
                style={{
                    position: 'relative',
                    width: '300px',
                    height: '800px',
                }}
            >
                <PluridSubApp
                    configuration={appConfiguration}
                    pages={appPages2}
                    // documents={appDocuments}
                    // pubsub={pluridPubSub}
                />
            </div>
        </div>
    );
}


export default App;
