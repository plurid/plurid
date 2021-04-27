import React from 'react';

import {
    PluridApplication,
    PluridReactPlane,
} from '@plurid/plurid-react';

import Plane1 from '../planes/Plane1';



const App = () => {
    const pluridPlanes: PluridReactPlane[] = [
        {
            route: '/:id',
            component: Plane1,
        },
    ];

    const pluridView: string[] = [
        '/1',
        '/2',
    ];

    return (
        <PluridApplication
            planes={pluridPlanes}
            view={pluridView}
        />
    );
}


export default App;
