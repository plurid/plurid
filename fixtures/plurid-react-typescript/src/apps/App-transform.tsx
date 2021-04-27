import React, {
    useEffect,
} from 'react';

import {
    PluridApplication,
    PluridReactComponent,
    PluridReactPlane,
    PluridPartialConfiguration,
    PluridPubSub,

    // PLURID_PUBSUB_TOPIC,
} from '@plurid/plurid-react';




const Plane: PluridReactComponent = (
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
    const pluridPlanes: PluridReactPlane[] = [
        {
            route: '/plane',
            component: Plane,
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
        // pluridPubSub.publish(PLURID_PUBSUB_TOPIC.SPACE_ANIMATED_TRANSFORM, {
        //     value: {
        //         active: true,
        //         time: 2000,
        //     },
        // });

        setTimeout(() => {
            // const spaceTransform = {
            //     value: {
            //         // translationX: 0,
            //         // translationY: 0,
            //         // translationZ: 0,
            //         // rotationX: 0,
            //         rotationY: 50,
            //         // scale: 1,
            //     },
            // };
            // pluridPubSub.publish(PLURID_PUBSUB_TOPIC.SPACE_TRANSFORM, spaceTransform);
        }, 1);


        setTimeout(() => {
            // pluridPubSub.publish(PLURID_PUBSUB_TOPIC.SPACE_ANIMATED_TRANSFORM, {
            //     value: {
            //         active: false,
            //     },
            // });
        }, 2100);
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
