import React from 'react';

import {
    PluridApplication,
    PluridReactPlane,
    PluridLink,
} from '@plurid/plurid-react';



const App = () => {
    const pluridPlanes: PluridReactPlane[] = [
        {
            route: '/plane-1',
            component: () => (
                <div>
                    <h1>Plane 1</h1>
                    <br />
                    <PluridLink route="/plane-2">link to plane 2</PluridLink>
                </div>
            ),
        },
        {
            route: '/plane-2',
            component: () => (<h1>Plane 2</h1>),
        },
    ];

    const pluridView: string[] = [
        '/plane-1',
        '/plane-2',
    ];

    return (
        <PluridApplication
            planes={pluridPlanes}
            view={pluridView}
        />
    );
}


export default App;
