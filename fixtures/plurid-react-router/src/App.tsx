import React from 'react';

import PluridApplication, {
    // PluridSingleApplication,
    PluridPartialConfiguration,
    PluridPlane,
    PluridView,
    SPACE_LAYOUT,
} from '@plurid/plurid-react';

import Plane1 from './containers/Plane1';



const App = () => {
    const appConfiguration: PluridPartialConfiguration = {
        // micro: true,
        // theme: 'plurid',
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

    const planes: PluridPlane[] = [
        {
            path: '/one',
            component: {
                kind: 'react',
                element: Plane1,
                properties: {},
            },
        },
        {
            path: '/two',
            component: {
                kind: 'react',
                element: Plane1,
                properties: {},
            },
        },
        {
            path: '/three',
            component: {
                kind: 'react',
                element: Plane1,
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
            <PluridApplication
                configuration={appConfiguration}
                planes={planes}
                view={pluridView}
            />
        </div>
    );
}


export default App;
