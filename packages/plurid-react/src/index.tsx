import {
    PluridPage,
    PluridDocument,
    PluridConfiguration,
} from '@plurid/plurid-data';

import PluridPubSub, {
    TOPICS,
} from '@plurid/plurid-pubsub';

import PluridApp from './App';

import PluridSubApp from './App/SubApp';

import PluridLink from './modules/components/PluridLink';



export {
    /** Interfaces */
    PluridPage,
    PluridDocument,
    PluridConfiguration,

    /** PubSub */
    PluridPubSub,
    TOPICS,

    /** SubApp */
    PluridSubApp,

    /** Components */
    PluridLink,
};


export default PluridApp;
