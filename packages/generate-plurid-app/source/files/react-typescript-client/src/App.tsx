import React from 'react';

import PluridApp, {
    PluridPlane,
    PluridView,
    SPACE_LAYOUT,
} from '@plurid/plurid-react';

import Plane from './containers/Plane';



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
                properties: {},
            },
        },
    ];

    const pluridView: PluridView[] = [
        {
            path: '/plane',
        }
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
