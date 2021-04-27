import React, {
    useState,
    useEffect,
} from 'react';

import {
    PluridRouterBrowser,
    PluridRoute,
    ReactComponentWithPlurid,
    PluridPartialConfiguration,
    PluridApplicationConfigurator,
} from '@plurid/plurid-react';



const Plane: React.FC<ReactComponentWithPlurid<any>> = (
    properties,
) => {
    /** state */
    const [configuration, setConfiguration] = useState<PluridPartialConfiguration>({});


    /** effects */
    useEffect(() => {
        if (window.innerWidth < 900) {
            const configuration: PluridPartialConfiguration = {
                elements: {
                    plane: {
                        width: 0.5,
                    },
                },
                space: {
                    center: true,
                },
            };
            setConfiguration(configuration);
        }
    }, []);


    /** render */
    return (
        <div>
            <PluridApplicationConfigurator
                configuration={configuration}
            />

            A plane
        </div>
    );
}


const App = () => {
    const routes: PluridRoute[] = [
        {
            value: '/',
            planes: [
                {
                    value: '/plane',
                    component: {
                        kind: 'react',
                        element: Plane,
                    },
                },
            ],
            view: [
                '/plane',
            ],
        },
        {
            value: '/planar',
            exterior: {
                kind: 'react',
                element: () => (
                    <div>
                        planar route
                    </div>
                ),
            },
        },
        {
            value: '/not-found',
            planes: [
                {
                    value: '/',
                    component: {
                        kind: 'react',
                        element: () => (
                            <div>Not Found</div>
                        ),
                    },
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
