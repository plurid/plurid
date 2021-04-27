import React, {
    useState,
    useEffect,
} from 'react';

import {
    PluridApplication,
    PluridPlane,
    PluridPartialConfiguration,
    PluridPubSub,
    PluridApplicationConfigurator,
} from '@plurid/plurid-react';

import {
    ReactComponentWithPlurid,
} from '@plurid/plurid-data';



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

const pluridPubSub = new PluridPubSub();


const App = () => {
    /** properties */
    const pluridPlanes: PluridPlane[] = [
        {
            route: '/plane',
            component: {
                kind: 'react',
                element: Plane,
            },
        },
    ];

    const pluridView: string[] = [
        '/plane',
    ];

    const configuration: PluridPartialConfiguration = {
        // elements: {
        //     plane: {
        //         width: 0.5,
        //     },
        // },
        // space: {
        //     center: true,
        // },
    };


    /** render */
    return (
        <PluridApplication
            planes={pluridPlanes}
            view={pluridView}
            configuration={configuration}
            pubsub={pluridPubSub}
        />
    );
}


export default App;
