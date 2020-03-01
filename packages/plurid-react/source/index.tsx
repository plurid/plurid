import {
    /** interfaces */
    PluridPage,
    PluridView,
    PluridDocument,
    PluridConfiguration,
    PluridPartialConfiguration,
    RecursivePartial,

    /** enumerations */
    LAYOUT_TYPES as SPACE_LAYOUT,
    SIZES,
    TRANSFORM_MODES,
    TRANSFORM_TOUCHES,
} from '@plurid/plurid-data';

import {
    router,
} from '@plurid/plurid-engine';

import PluridPubSub, {
    TOPICS,
} from '@plurid/plurid-pubsub';

import PluridApp from './App';

import PluridSubApp from './App/SubApp';

import PluridLink from './modules/components/PluridLink';

import PluridVirtualList from './modules/components/PluridVirtual/List';

import {
    serverComputeApplication,
} from './modules/services/logic/server';



const {
    default: PluridRouter,
    RouteMatcher: PluridRouteMatcher,
    RouteParser: PluridRouteParser,
} = router;


export {
    /** Interfaces */
    PluridPage,
    PluridView,
    PluridDocument,
    PluridConfiguration,
    PluridPartialConfiguration,
    RecursivePartial,

    /** Enumerations */
    SPACE_LAYOUT,
    SIZES,
    TRANSFORM_MODES,
    TRANSFORM_TOUCHES,

    /** Engine */
    PluridRouter,
    PluridRouteMatcher,
    PluridRouteParser,

    /** PubSub */
    PluridPubSub,
    TOPICS,

    /** SubApp */
    PluridSubApp,

    /** Components */
    PluridLink,
    PluridVirtualList,

    /** Logic */
    serverComputeApplication,
};


export default PluridApp;
