import React, {
    useRef,
} from 'react';

import {
    PluridApplication,
    PluridPlane,
    PluridLink,
} from '@plurid/plurid-react';

import {
    ReactComponentWithPlurid,
} from '@plurid/plurid-data';



const ParametricPlane: React.FC<ReactComponentWithPlurid<any>> = (
    properties,
) => {
    const {
        plurid,
    } = properties;
    console.log(properties);

    const id = useRef((Math.random() + '').slice(2));

    return (
        <div>
            <h1>Plane with id {plurid.metadata.planeID}</h1>
            <br />
            <PluridLink route={id.current}>link to plane with route {id.current}</PluridLink>
        </div>
    );
}


const App = () => {
    const pluridPlanes: PluridPlane[] = [
        {
            route: '/:id',
            component: {
                kind: 'react',
                element: ParametricPlane,
            },
        },
    ];

    const pluridView: string[] = [
        '/parametric',
    ];

    return (
        <PluridApplication
            planes={pluridPlanes}
            view={pluridView}
        />
    );
}


export default App;
