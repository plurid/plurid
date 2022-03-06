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

                    <div
                        style={{
                            margin: '4rem',
                        }}
                    >
                        <PluridLink route="/plane-2">link to plane 2</PluridLink>
                    </div>
                </div>
            ),
        },
        {
            route: '/plane-2',
            component: () => (
                <div>
                    <h1>Plane 2</h1>

                    <div
                        style={{
                            margin: '2rem',
                        }}
                    >
                        <PluridLink route="/plane-1">link to plane 1</PluridLink>
                    </div>
                </div>
            ),
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
