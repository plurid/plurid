import React, {
    // useState,
    // useEffect,
} from 'react';

import PluridApp, {
    // PluridConfiguration,
    PluridPage,
    PluridView,
    SPACE_LAYOUT,
} from '@plurid/plurid-react';

import Page1 from './containers/Page1';
// import Page2 from './containers/Page2';



const App = () => {
    const appConfiguration = {
        // micro: true,
        theme: 'plurid',
        // transparentUI: true,
        space: {
            layout: {
                type: SPACE_LAYOUT.COLUMNS,
                columns: 10,
                // columnLength: 2,
                gap: 0.1,
            },

            // layout: {
            //     type: SPACE_LAYOUT.ROWS,
            //     rows: 1,
            //     // rowLength: 3,
            //     gap: 0.1,
            // },

            // layout: {
            //     type: SPACE_LAYOUT.FACE_TO_FACE,
            //     angle: 30,
            //     gap: 50,
            //     middle: 1,
            // },
            // layout: {
            //     type: 'ZIG_ZAG',
            //     angle: 50,
            // },
            // transformOrigin: {
            //     show: false,
            //     size: 'large',
            // },
            center: true,
            // opaque: false,
        },
        elements: {
            // toolbar: {
            //     show: false,
            // },
            // viewcube: {
            //     show: false,
            // },
            plane: {
                width: 0.5,
                // opacity: 0,
                // controls: {
                //     show: false,
                // },
            },
        },
    };
    // const anotherConfiguration = {
    //     micro: true,
    // };

    const oneHundred = [...new Array(100)].map((_, index) => index);

    const multiplePages = oneHundred.map((val) => {
        return {
            path: '/' + val,
            component: {
                element: Page1,
                properties: {},
            },
        };
    });

    const multipleViews = oneHundred.map((val) => {
        return '/' + val;
    });

    const appPages: PluridPage[] = [
        // {
        //     id: 'pageOne',
        //     path: '/page-1',
        //     component: {
        //         element: Page1,
        //         properties: {},
        //     },
        //     // root: true,
        // },
        // {
        //     id: 'pageTwo',
        //     path: '/page-2',
        //     component: {
        //         element: Page2,
        //         properties: {},
        //     },
        //     // root: true,
        // },

        {
            path: '/one',
            component: {
                element: Page1,
                properties: {},
            },
        },
        {
            path: '/two',
            component: {
                element: Page1,
                properties: {},
            },
        },
        {
            path: '/three',
            component: {
                element: Page1,
                properties: {},
            },
        },

        // {
        //     path: '/page-2',
        //     component: {
        //         element: Page2,
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
        //     // root: true,
        // },
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
        //     path: '/page-6',
        //     component: {
        //         element: Page1,
        //         properties: {},
        //     },
        //     root: true,
        // },
    ];

    // const [configuration, setConfiguration] = useState(appConfiguration);

    // useEffect(() => {
    //     setTimeout(() => {
    //         setConfiguration(anotherConfiguration);
    //     }, 4000);
    // }, [
    //     anotherConfiguration
    // ]);

    // const view = [
    //     '/one',
    //     '/two',
    //     '/three',
    //     '/four',
    //     '/five',
    //     '/six',
    //     '/seven',
    // ];

    const pluridView: PluridView[] = [
        {
            path: '/one',
            ordinal: 1,
        },
        {
            path: '/two',
            ordinal: 2,
        },
        {
            path: '/three',
            ordinal: 0,
        },
    ];


    return (
        <div>
            <PluridApp
                configuration={appConfiguration}
                pages={multiplePages}
                view={multipleViews}
            />
        </div>
    );
}


export default App;
