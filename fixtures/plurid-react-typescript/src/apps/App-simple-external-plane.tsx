import {
    PluridApplication,
    PluridReactPlane,
    PluridExternalPlane,
    PluridIframePlane,
} from '@plurid/plurid-react';



const App = () => {
    const pluridPlanes: PluridReactPlane[] = [
        {
            // Makes a request to `https://plurid.com/pttp` for the `/incepts` path `{ path: '/incepts' }`,
            // gets and elementql request host/id and makes the elementql query.
            // The plurid.com/incepts is a plurid space itself,
            // but when requested through pttp,
            // it will pull all it's defined planes into the requesting space.
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
