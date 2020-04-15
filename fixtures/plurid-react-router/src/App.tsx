import React, {
    // useState,
    // useEffect,
} from 'react';

import PluridApp, {
    // PluridConfiguration,
    PluridPlane,
    PluridView,
    SPACE_LAYOUT,
} from '@plurid/plurid-react';

import Page1 from './containers/Plane1';



const App = () => {
    const appConfiguration = {
        // micro: true,
        theme: 'plurid',
        // transparentUI: true,
        space: {
            layout: {
                type: SPACE_LAYOUT.COLUMNS,
                columns: 8,
                // columnLength: 2,
                gap: 0.1,
            },
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

    const appPages: PluridPlane[] = [
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
    ];

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
                planes={multiplePages}
                view={multipleViews}
            />
        </div>
    );
}


export default App;
