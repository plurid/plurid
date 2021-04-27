import React, {
    useRef,
} from 'react';

import {
    PluridApplication,
    PluridReactComponent,
    PluridReactPlane,
    PluridLink,
} from '@plurid/plurid-react';



const ParametricPlane: PluridReactComponent = (
    properties,
) => {
    const {
        plurid,
    } = properties;
    // console.log(properties);

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
    const pluridPlanes: PluridReactPlane[] = [
        {
            route: '/:id',
            component: ParametricPlane,
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
