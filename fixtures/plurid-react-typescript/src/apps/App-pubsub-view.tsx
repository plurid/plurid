import {
    useState,
    useEffect,
} from 'react';

import {
    PluridRouterBrowser,
    PluridReactComponent,
    PluridReactRoute,
    PluridPartialConfiguration,
    PluridApplicationConfigurator,
    PluridPubSub,

    PLURID_PUBSUB_TOPIC,
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


const Plane: PluridReactComponent = (
    properties,
) => {
    /** state */
    const [
        configuration,
        setConfiguration,
    ] = useState<PluridPartialConfiguration>({});


    /** handlers */
    const addView = () => {
        pluridPubSub.publish({
            topic: PLURID_PUBSUB_TOPIC.VIEW_ADD_PLANE,
            data: {
                plane: '/plane-2',
            },
        });
    }

    const setView = () => {
        pluridPubSub.publish({
            topic: PLURID_PUBSUB_TOPIC.VIEW_SET_PLANES,
            data: {
                view: [
                    '/plane-2',
                ],
            },
        });
    }

    const removePlane = () => {
        pluridPubSub.publish({
            topic: PLURID_PUBSUB_TOPIC.VIEW_REMOVE_PLANE,
            data: {
                plane: '/plane-2',
            },
        });
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
    const routes: PluridReactRoute[] = [
        {
            value: '/',
            planes: [
                {
                    value: '/plane-1',
                    component: Plane,
                },
                {
                    value: '/plane-2',
                    component: () => (
                        <div>
                            Plane 2
                        </div>
                    ),
                },
            ],
            view: [
                '/plane-1',
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
