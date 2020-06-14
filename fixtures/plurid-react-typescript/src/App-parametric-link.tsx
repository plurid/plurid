import React from 'react';

import {
    PluridApplication,
    PluridPlane,
    PluridLink,
} from '@plurid/plurid-react';



const App = () => {
    const pluridPlanes: PluridPlane[] = [
        {
            route: '/:id',
            component: {
                kind: 'react',
                element: ({ plurid} ) => {
                    console.log('plurid', plurid);

                    return (
                        <div>
                            <h1>Plane 1</h1>
                            <br />
                            <PluridLink path="/plane-2">link to plane 2</PluridLink>
                        </div>
                    );
                },
            },
        },
    ];

    const pluridView: string[] = [
        '/one',
        // '/two',
    ];

    return (
        <PluridApplication
            planes={pluridPlanes}
            view={pluridView}
        />
    );
}


export default App;
