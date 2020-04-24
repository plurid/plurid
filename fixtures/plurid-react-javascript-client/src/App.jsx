import React from 'react';

import PluridApp from '@plurid/plurid-react';

import Plane from './planes/Plane';



const App = () => {
    /** properties */
    const pluridConfiguration = {
        theme: 'plurid',
        space: {
            layout: {
                type: 'columns',
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
            path: 'http://localhost:3000://p://s://u://c://plane',
            component: {
                kind: 'react',
                element: Plane,
                properties: {},
            },
        },
    ];

    const pluridView = [
        'http://localhost:3000://p://s://u://c://plane',
    ];

    const indexedPlanes = new Map();

    const id = Math.random() + '';
    const indexedPlane: IndexedPluridPlane = {
        protocol: 'http',
        host: 'localhost:3000',
        path: 'p',
        space: 's',
        universe: 'u',
        cluster: 'c',
        plane: 'plane',
        route: 'http://localhost:3000://p://s://u://c://plane',
        component: {
            kind: 'react',
            element: Plane,
        },
    };
    indexedPlanes.set(id, indexedPlane);


    /** render */
    return (
        <div>
            <PluridApp
                configuration={pluridConfiguration}
                planes={pluridPlanes}
                view={pluridView}
                indexedPlanes={indexedPlanes}
            />
        </div>
    );
}


export default App;
