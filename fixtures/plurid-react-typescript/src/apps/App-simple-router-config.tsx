import React, {
    useState,
    useEffect,
} from 'react';

import {
    PluridRouterBrowser,
    PluridReactComponent,
    PluridReactRoute,
    PluridPartialConfiguration,
    PluridApplicationConfigurator,
} from '@plurid/plurid-react';



const Plane: PluridReactComponent = (
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
    const routes: PluridReactRoute[] = [
        {
            value: '/',
            planes: [
                {
                    value: '/plane',
                    component: Plane,
                },
            ],
            view: [
                '/plane',
            ],
        },
        {
            value: '/planar',
            exterior: () => (
                <div>
                    planar route
                </div>
            ),
        },
        {
            value: '/not-found',
            planes: [
                {
                    value: '/',
                    component: () => (
                        <div>Not Found</div>
                    ),
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
