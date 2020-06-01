import React from 'react';

import {
    PluridApplication,
    PluridPlane,
    SPACE_LAYOUT,
} from '@plurid/plurid-react';

import Plane from './planes/Plane';



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

    const pluridPlanes: PluridPlane[] = [
        {
            path: '/plane',
            component: {
                kind: 'react',
                element: Plane,
            },
        },
    ];

    const pluridView: string[] = [
        '/plane',
    ];


    /** render */
    return (
        <>
            <PluridApplication
                configuration={pluridConfiguration}
                planes={pluridPlanes}
                view={pluridView}
            />
        </>
    );
}


export default App;
