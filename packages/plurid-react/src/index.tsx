import {
    PluridPage,
    PluridDocument,
    PluridConfiguration,
} from '@plurid/plurid-data';

import PluridPubSub, { TOPICS } from '@plurid/plurid-pubsub';

import PluridLink from './modules/components/PluridLink';

import PluridApp from './App';

import PluridSubApp from './App/SubApp';


export {
    /** SubApp */
    PluridSubApp,

    /** Interfaces */
    PluridPage,
    PluridDocument,
    PluridConfiguration,

    /** PubSub */
    PluridPubSub,
    TOPICS,

    /** Components */
    PluridLink,
};


export default PluridApp;
