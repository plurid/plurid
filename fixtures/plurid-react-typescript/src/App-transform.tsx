import React from 'react';

import {
    PluridApplication,
    PluridPlane,
} from '@plurid/plurid-react';

import {
    ReactComponentWithPlurid,
} from '@plurid/plurid-data';



const Plane: React.FC<ReactComponentWithPlurid<any>> = (
    properties,
) => {

    return (
        <div>
            A plane
        </div>
    );
}


const App = () => {
    const pluridPlanes: PluridPlane[] = [
        {
            route: '/plane',
            component: {
                kind: 'react',
                element: Plane,
            },
        },
    ];

    const pluridView: string[] = [
        '/plane',
    ];

    return (
        <PluridApplication
            planes={pluridPlanes}
            view={pluridView}
        />
    );
}


export default App;
