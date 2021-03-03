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
    PluridPubSub,

    TOPICS,
} from '@plurid/plurid-react';

import {
    universal,
} from '@plurid/plurid-ui-components-react';



const {
    buttons: {
        PureButton: PluridPureButton,
    },
} = universal;

const pluridPubSub = new PluridPubSub();


const Plane: React.FC<ReactComponentWithPlurid<any>> = (
    properties,
) => {
    /** state */
    const [
        configuration,
        setConfiguration,
    ] = useState<PluridPartialConfiguration>({});


    /** handlers */
    const addView = () => {
        pluridPubSub.publish(
            TOPICS.VIEW_ADD_PLANE,
            {
                plane: '/plane-2',
            },
        );
    }

    const setView = () => {
        pluridPubSub.publish(
            TOPICS.VIEW_SET_PLANES,
            {
                view: [
                    '/plane-2',
                ],
            },
        );
    }

    const removePlane = () => {
        pluridPubSub.publish(
            TOPICS.VIEW_REMOVE_PLANE,
            {
                plane: '/plane-2',
            },
        );
    }


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
                pubsub={pluridPubSub}
            />

            A plane

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gridGap: '3rem',
                    margin: '30px',
                }}
            >
                <PluridPureButton
                    text="add plane"
                    atClick={() => addView()}
                    level={2}
                />

                <PluridPureButton
                    text="set view"
                    atClick={() => setView()}
                    level={2}
                />

                <PluridPureButton
                    text="remove plane"
                    atClick={() => removePlane()}
                    level={2}
                />
            </div>
        </div>
    );
}


const App = () => {
    const routes: PluridRoute[] = [
        {
            value: '/',
            planes: [
                {
                    value: '/plane-1',
                    component: {
                        kind: 'react',
                        element: Plane,
                    },
                },
                {
                    value: '/plane-2',
                    component: {
                        kind: 'react',
                        element: () => (
                            <div>
                                Plane 2
                            </div>
                        ),
                    },
                },
            ],
            view: [
                '/plane-1',
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
