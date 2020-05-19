import {
    /** Interfaces */
    PluridPlane,
    IndexedPluridPlane,
    PluridView,
    PluridUniverse,
    PluridConfiguration,
    PluridPartialConfiguration,
    RecursivePartial,

    PluridRouterPath,
    PluridRouterSpace,
    PluridRouterUniverse,
    PluridRouterCluster,
    PluridRouterPlane,

    PluridComponent,

    PluridPreserve,
    PluridPreserveTransmission,

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

import PluridLink from './modules/components/Link';
import PluridRouterBrowser from './modules/components/RouterBrowser';
import PluridRouterStatic from './modules/components/RouterStatic';
import PluridRouterLink from './modules/components/RouterLink';
import PluridVirtualList from './modules/components/Virtual/List';
import PluridPlaneConfigurator from './modules/components/PlaneConfigurator';
import PluridApplicationConfigurator from './modules/components/ApplicationConfigurator';

import PluridProvider from './modules/components/Provider';

import {
    serverComputeMetastate,
} from './modules/services/logic/server';

import {
    pluridRouterNavigate,
} from './modules/services/utilities/navigate';



const {
    // default: PluridRouter,
    RouteMatcher: PluridRouteMatcher,
    RouteParser: PluridRouteParser,
} = router;


export {
    /** Interfaces */
    PluridPlane,
    IndexedPluridPlane,
    PluridView,
    PluridUniverse,

    PluridRouterPath,
    PluridRouterSpace,
    PluridRouterUniverse,
    PluridRouterCluster,
    PluridRouterPlane,

    PluridComponent,

    PluridPreserve,
    PluridPreserveTransmission,

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
    PluridApplicationConfigurator,
    PluridProvider,

    /** Server */
    serverComputeMetastate,

    /** Utilities */
    pluridRouterNavigate,
};


export default PluridApplication;
