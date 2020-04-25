import React from 'react';

import PluridApp from '@plurid/plurid-react';

import Plane from './planes/Plane';



const App = () => {
    /** properties */
    const pluridConfiguration = {
        theme: 'plurid',
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
            path: '/plane',
            component: {
                kind: 'react',
                element: Plane,
            },
        },
    ];

    const pluridView = [
        '/plane',
    ];


    /** render */
    return (
        <div>
            <PluridApp
                configuration={pluridConfiguration}
                planes={pluridPlanes}
                view={pluridView}
            />
        </div>
    );
}


export default App;
