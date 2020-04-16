import {
    /** Interfaces */
    PluridPlane,
    PluridView,
    PluridUniverse,
    PluridConfiguration,
    PluridPartialConfiguration,
    RecursivePartial,
    PluridRouter,
    PluridRouterHost,
    PluridRouterPath,
    PluridRouterSpace,
    PluridRouterUniverse,
    PluridRouterCluster,
    PluridRouterPlane,

    /** Enumerations */
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

import PluridApplication from './Application';

import PluridSingleApplication from './Application/SingleApplication';

import PluridLink from './modules/components/PluridLink';
import PluridRouterBrowser from './modules/components/PluridRouterBrowser';
import PluridRouterStatic from './modules/components/PluridRouterStatic';
import PluridRouterLink from './modules/components/PluridRouterLink';
import PluridVirtualList from './modules/components/PluridVirtual/List';
import PluridPlaneConfigurator from './modules/components/PluridPlaneConfigurator';

import PluridProvider from './modules/components/PluridProvider';

import {
    serverComputeApplication,
} from './modules/services/logic/server';



const {
    // default: PluridRouter,
    RouteMatcher: PluridRouteMatcher,
    RouteParser: PluridRouteParser,
} = router;


export {
    /** Interfaces */
    PluridPlane,
    PluridView,
    PluridUniverse,

    PluridRouter,
    PluridRouterHost,
    PluridRouterPath,
    PluridRouterSpace,
    PluridRouterUniverse,
    PluridRouterCluster,
    PluridRouterPlane,

    PluridConfiguration,
    PluridPartialConfiguration,
    RecursivePartial,

    /** Enumerations */
    SPACE_LAYOUT,
    SIZES,
    TRANSFORM_MODES,
    TRANSFORM_TOUCHES,

    /** Engine */
    // PluridRouter,
    PluridRouteMatcher,
    PluridRouteParser,

    /** PubSub */
    PluridPubSub,
    TOPICS,

    /** SingleApplication */
    PluridSingleApplication,

    /** Components */
    PluridLink,
    PluridRouterBrowser,
    PluridRouterStatic,
    PluridRouterLink,
    PluridVirtualList,
    PluridPlaneConfigurator,
    PluridProvider,

    /** Logic */
    serverComputeApplication,
};


export default PluridApplication;
