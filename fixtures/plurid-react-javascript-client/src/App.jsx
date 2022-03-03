import React from 'react';

import {
    PluridApplication,
} from '@plurid/plurid-react';

import Plane from './planes/Plane';



const App = () => {
    /** properties */
    const pluridConfiguration = {
        global: {
            theme: 'plurid',
        },
        space: {
            layout: {
                type: 'COLUMNS',
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

    const pluridPlanes = [
        {
            route: '/plane',
            component: Plane,
        },
    ];

    const pluridView = [
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
