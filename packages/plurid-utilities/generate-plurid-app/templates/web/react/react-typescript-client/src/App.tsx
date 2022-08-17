import React from 'react';

import {
    PluridApplication,

    PluridPartialConfiguration,
    PluridReactPlane,

    SPACE_LAYOUT,
} from '@plurid/plurid-react';

import Plane from './planes/Plane';



const App = () => {
    // #region properties
    const pluridConfiguration: PluridPartialConfiguration = {
        global: {
            theme: 'plurid',
        },
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

    const pluridPlanes: PluridReactPlane[] = [
        {
            route: '/plane',
            component: Plane,
        },
    ];

    const pluridView: string[] = [
        '/plane',
    ];
    // #endregion properties


    // #region render
    return (
        <>
            <PluridApplication
                configuration={pluridConfiguration}
                planes={pluridPlanes}
                view={pluridView}
            />
        </>
    );
    // #endregion render
}


export default App;
