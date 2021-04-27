import {
    PluridApplication,
    PluridReactPlane,
} from '@plurid/plurid-react';

import Plane1 from '../planes/Plane1';
import Plane2 from '../planes/Plane2';



const App = () => {
    const pluridPlanes: PluridReactPlane[] = [
        {
            route: '/plane-1',
            component: Plane1,
        },
        {
            route: '/plane-2',
            component: Plane2,
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
