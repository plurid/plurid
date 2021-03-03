import React, {
    useState,
    useEffect,
} from 'react';

import {
    PluridApplication,
    PluridPlane,
} from '@plurid/plurid-react';

import Plane1 from './planes/Plane1';
import Plane2 from './planes/Plane2';



const App = () => {
    const pluridPlanes: PluridPlane[] = [
        {
            route: '/',
            component: {
                kind: 'react',
                element: Plane1,
            },
        },
        {
            route: '/two',
            component: {
                kind: 'react',
                element: Plane2,
            },
        },
    ];

    const [
        pluridView,
        setPluridView,
    ] = useState(['/']);


    useEffect(() => {
        setTimeout(() => {
            setPluridView(
                ['/', '/two'],
            );
        }, 3000);
    }, [])

    return (
        <PluridApplication
            planes={pluridPlanes}
            view={pluridView}
        />
    );
}


export default App;