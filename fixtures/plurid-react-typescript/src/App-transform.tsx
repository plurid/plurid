import React, {
    useEffect,
} from 'react';

import {
    PluridApplication,
    PluridPlane,
    PluridPartialConfiguration,
    PluridPubSub,

    TOPICS,
} from '@plurid/plurid-react';

import {
    ReactComponentWithPlurid,
} from '@plurid/plurid-data';



const Plane: React.FC<ReactComponentWithPlurid<any>> = (
    properties,
) => {

    return (
        <div>
            A plane
        </div>
    );
}

const pluridPubSub = new PluridPubSub();


const App = () => {
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
        elements: {
            plane: {
                width: 0.5,
            },
        },
        space: {
            center: true,
        },
    };


    /** effects */
    useEffect(() => {
        pluridPubSub.publish(TOPICS.SPACE_ANIMATED_TRANSFORM, {
            value: {
                active: true,
                time: 300,
            },
        });

        setTimeout(() => {
            const spaceTransform = {
                value: {
                    // translationX: 0,
                    // translationY: 0,
                    // translationZ: 0,
                    // rotationX: 0,
                    rotationY: 50,
                    // scale: 1,
                },
            };
            pluridPubSub.publish(TOPICS.SPACE_TRANSFORM, spaceTransform);
        }, 1);


        setTimeout(() => {
            pluridPubSub.publish(TOPICS.SPACE_ANIMATED_TRANSFORM, {
                value: {
                    active: false,
                },
            });
        }, 600);
    }, []);


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
