import {
    PluridApplication,
    PluridReactPlane,
    PluridExternalPlane,
    PluridIframePlane,
} from '@plurid/plurid-react';

import Plane1 from '../planes/Plane1';



const App = () => {
    const pluridPlanes: PluridReactPlane[] = [
        [
            '/internal-plane',
            Plane1,
        ],
        {
            // Makes a request to `https://plurid.com/pttp` for the `/incepts` path `{ path: '/incepts' }`,
            // gets and elementql request host/id and makes the elementql query.
            // The plurid.com/incepts is a plurid space itself,
            // but when requested through pttp,
            // it will pull all its defined planes into the requesting space.
            route: 'pttp://plurid.com/incepts',
            component: PluridExternalPlane,
        },
        {
            // Renders the route in an iframe.
            route: 'https://google.com',
            component: PluridIframePlane,
        },
    ];

    const pluridView: string[] = [
        // '/internal-plane',
        'pttp://plurid.com/incepts',
    ];

    return (
        <PluridApplication
            planes={pluridPlanes}
            view={pluridView}
        />
    );
}


export default App;
