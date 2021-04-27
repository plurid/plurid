import {
    PluridRouterBrowser,
    PluridReactRoute,
    PluridLink,
} from '@plurid/plurid-react';



const App = () => {
    const routes: PluridReactRoute[] = [
        {
            value: '/multiplane',
            planes: [
                {
                    value: '/plane-1',
                    component: () => (
                        <div>
                            <h1>Plane 1</h1>
                            <br />
                            <PluridLink route="/plane-2">link to plane 2</PluridLink>
                        </div>
                    ),
                },
                {
                    value: '/plane-2',
                    component: () => (<h1>Plane 2</h1>),
                },
            ],
        },
    ];

    return (
        <PluridRouterBrowser
            routes={routes}
        />
    );
}


export default App;
