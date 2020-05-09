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

    /** Server */
    serverComputeMetastate,

    /** Utilities */
    pluridRouterNavigate,
};


export default PluridApplication;
