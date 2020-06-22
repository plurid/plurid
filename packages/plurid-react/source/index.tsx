import {
    /** Interfaces */
    PluridPlane,
    IndexedPluridPlane,
    PluridView,
    PluridUniverse,
    PluridConfiguration,
    PluridPartialConfiguration,
    RecursivePartial,

    PluridRoute,
    PluridRouteSpace,
    PluridRouteUniverse,
    PluridRouteCluster,
    PluridRoutePlane,

    PluridComponent,

    PluridPreserve,
    PluridPreserveTransmission,

    /** Enumerations */
    LAYOUT_TYPES as SPACE_LAYOUT,
    SIZES,
    TRANSFORM_MODES,
    TRANSFORM_TOUCHES,
    PLURID_ROUTER_LOCATION_CHANGED,
} from '@plurid/plurid-data';

import {
    router,
} from '@plurid/plurid-engine';

import PluridPubSub, {
    TOPICS,
} from '@plurid/plurid-pubsub';

import PluridApplication from './Application';

import PluridSingleApplication from './Application/SingleApplication';
import PluridExposedApplication from './Application/ExposedApplication';

import PluridLink from './modules/components/Link';
import PluridRouterBrowser from './modules/components/RouterBrowser';
import PluridRouterStatic from './modules/components/RouterStatic';
import PluridRouterLink from './modules/components/RouterLink';
import PluridVirtualList from './modules/components/Virtual/List';
import PluridPlaneConfigurator from './modules/components/PlaneConfigurator';
import PluridApplicationConfigurator from './modules/components/ApplicationConfigurator';

import PluridProvider from './modules/components/Provider';

import pluridStateModules from './modules/services/state/modules';

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


/**
 * Components and utilities.
 */
const Plurid = {
    /** COMPONENTS */
    Application: PluridApplication,
    SingleApplication: PluridSingleApplication,

    Link: PluridLink,
    RouterBrowser: PluridRouterBrowser,
    RouterStatic: PluridRouterStatic,
    RouterLink: PluridRouterLink,
    VirtualList: PluridVirtualList,
    PlaneConfigurator: PluridPlaneConfigurator,
    ApplicationConfigurator: PluridApplicationConfigurator,
    Provider: PluridProvider,


    /** UTILITIES */
    /** Enumerations */
    SPACE_LAYOUT,
    SIZES,
    TRANSFORM_MODES,
    TRANSFORM_TOUCHES,

    /** PubSub */
    PubSub: PluridPubSub,
    TOPICS,

    /** Server */
    serverComputeMetastate,

    /** Router */
    routerNavigate: pluridRouterNavigate,
};


export {
    /** Components */
    PluridApplication,
    PluridSingleApplication,
    PluridExposedApplication,

    PluridLink,
    PluridRouterBrowser,
    PluridRouterStatic,
    PluridRouterLink,
    PluridVirtualList,
    PluridPlaneConfigurator,
    PluridApplicationConfigurator,
    PluridProvider,


    /** UTILITIES */
    /** Interfaces */
    PluridPlane,
    IndexedPluridPlane,
    PluridView,
    PluridUniverse,

    PluridRoute,
    PluridRouteSpace,
    PluridRouteUniverse,
    PluridRouteCluster,
    PluridRoutePlane,

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
    PLURID_ROUTER_LOCATION_CHANGED,

    /** Engine */
    // PluridRouter,
    PluridRouteMatcher,
    PluridRouteParser,

    /** PubSub */
    PluridPubSub,
    TOPICS,

    /** Server */
    serverComputeMetastate,

    /** Router */
    pluridRouterNavigate,

    /** state */
    pluridStateModules,
};


export default Plurid;
