import React, {
    useState,
    useEffect,
} from 'react';

import {
    PluridApplication,
    PluridReactPlane,
    PluridPubSub,
    PLURID_PUBSUB_TOPIC,
    // PluridPubSubPublishMessage,
    // PluridPubSubSubscribeMessage,
} from '@plurid/plurid-react';

import Plane1 from '../planes/Plane1';
import Plane2 from '../planes/Plane2';



const pluridPubSub = new PluridPubSub();

const App = () => {
    const pluridPlanes: PluridReactPlane[] = [
        {
            route: '/',
            component: Plane1,
        },
        {
            route: '/two',
            component: Plane2,
        },
    ];

    const [
        pluridView,
        setPluridView,
    ] = useState(['/']);


    useEffect(() => {
        setTimeout(() => {
            setPluridView(
                ['/', '/two'],
            );
        }, 3000);
    }, [])

    useEffect(() => {
        setTimeout(() => {
            pluridPubSub.publish({
                topic: PLURID_PUBSUB_TOPIC.SPACE_ROTATE_Y_TO,
                data: {
                    value: 50,
                },
            });

            // pluridPubSub.publish({
            //     topic: PLURID_PUBSUB_TOPIC.SPACE_ROTATE_X_WITH,
            //     data: {
            //         value: 50,
            //     },
            // });
        }, 3000);
    }, [])

    return (
        <PluridApplication
            planes={pluridPlanes}
            view={pluridView}
            // useLocalStorage={true}
            pubsub={pluridPubSub}
        />
    );
}


export default App;
