import React from 'react';

import {
    PluridApplication,
    PluridPlane,
    PluridLink,
} from '@plurid/plurid-react';



const App = () => {
    const pluridPlanes: PluridPlane[] = [
        {
            path: '/plane-1',
            component: {
                kind: 'react',
                element: () => (
                    <div>
                        <h1>Plane 1</h1>
                        <br />
                        <PluridLink path="/plane-2">link to plane 2</PluridLink>
                    </div>
                ),
            },
        },
        {
            path: '/plane-2',
            component: {
                kind: 'react',
                element: () => (<h1>Plane 2</h1>),
            },
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
