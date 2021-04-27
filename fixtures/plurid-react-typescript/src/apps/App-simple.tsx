import React from 'react';

import {
    PluridApplication,
    PluridPlane,
} from '@plurid/plurid-react';

import Plane1 from '../planes/Plane1';



const App = () => {
    const pluridPlanes: PluridPlane[] = [
        {
            route: '/',
            component: {
                kind: 'react',
                element: Plane1,
            },
        },
    ];

    const pluridView: string[] = [
        '/',
    ];

    return (
        <PluridApplication
            planes={pluridPlanes}
            view={pluridView}
        />
    );
}


export default App;
