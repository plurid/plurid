import React from 'react';

import {
    PluridApplication,
    PluridReactPlane,
} from '@plurid/plurid-react';

import Plane1 from '../planes/Plane1';



const App = () => {
    const pluridPlanes: PluridReactPlane[] = [
        {
            route: '/',
            component: Plane1,
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
