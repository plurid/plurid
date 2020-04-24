import React from 'react';

import PluridApplication, {
    PluridPlane,
} from '@plurid/plurid-react';

import Plane1 from './planes/Plane1';



const App = () => {
    const pluridPlanes: PluridPlane[] = [
        {
            path: '/',
            component: {
                kind: 'react',
                element: Plane1,
            },
        },
    ];

    return (
        <PluridApplication
            planes={pluridPlanes}
        />
    );
}


export default App;
