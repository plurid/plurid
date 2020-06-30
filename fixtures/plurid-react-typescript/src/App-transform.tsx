import React from 'react';

import {
    PluridApplication,
    PluridPlane,
    PluridPartialConfiguration,
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

    const configuration: PluridPartialConfiguration = {
        elements: {
            plane: {
                width: 0.5,
            },
        },
        space: {
            center: true,
        },
    };


    /** render */
    return (
        <PluridApplication
            planes={pluridPlanes}
            view={pluridView}
            configuration={configuration}
        />
    );
}


export default App;
