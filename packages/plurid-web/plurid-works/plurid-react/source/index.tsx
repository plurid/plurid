// #region imports
    // #region libraries
    import {
        // #region constants
        PLURID_PUBSUB_TOPIC,
        // #endregion constants


        // #region interfaces
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

        PluridComponentProperty,

        PluridPreserve,
        PluridPreserveTransmission,

        PluridPubSubPublishMessage,
        PluridPubSubSubscribeMessage,
        // #endregion interfaces


        // #region enumerations
        LAYOUT_TYPES as SPACE_LAYOUT,
        SIZES,
        TRANSFORM_MODES,
        TRANSFORM_TOUCHES,
        PLURID_ROUTER_LOCATION_CHANGED,
        PLURID_ROUTER_LOCATION_STORED,
        // #endregion enumerations
    } from '@plurid/plurid-data';

    import {
        router,
    } from '@plurid/plurid-engine';

    import PluridPubSub from '@plurid/plurid-pubsub';
    // #endregion libraries


    // #region internal
    import {
        PluridReactComponent,
        PluridReactPlane,
        PluridReactRoute,
    } from './data/interfaces';

    import PluridApplication from './Application';

    import PluridLink from './modules/components/Link';
    import PluridExternalPlane from './modules/components/ExternalPlane';
    import PluridIframePlane from './modules/components/IframePlane';
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
        getDirectPlaneMatch,
    } from './modules/services/logic/router';

    import {
        pluridRouterNavigate,
    } from './modules/services/utilities/navigate';

    import {
        usePluridRouter,
    } from './modules/services/hooks';
    // #endregion internal
// #endregion imports



// #region module
const {
    // default: PluridRouter,
    RouteMatcher: PluridRouteMatcher,
    RouteParser: PluridRouteParser,
} = router;


/**
 * Components and utilities.
 */
const Plurid = {
    // #region Components
    Application: PluridApplication,

    Link: PluridLink,
    ExternalPlane: PluridExternalPlane,
    IframePlane: PluridIframePlane,
    RouterBrowser: PluridRouterBrowser,
    RouterStatic: PluridRouterStatic,
    RouterLink: PluridRouterLink,
    VirtualList: PluridVirtualList,
    PlaneConfigurator: PluridPlaneConfigurator,
    ApplicationConfigurator: PluridApplicationConfigurator,
    Provider: PluridProvider,
    // #endregion Components


    // #region Utilities
    /** Enumerations */
    SPACE_LAYOUT,
    SIZES,
    TRANSFORM_MODES,
    TRANSFORM_TOUCHES,

    /** PubSub */
    PubSub: PluridPubSub,
    PUBSUB_TOPIC: PLURID_PUBSUB_TOPIC,

    /** Server */
    serverComputeMetastate,

    /** Router */
    routerNavigate: pluridRouterNavigate,
    // #endregion Utilities
};
// #endregion module



// #region exports
export {
    // #region Components
    PluridApplication,

    PluridLink,
    PluridExternalPlane,
    PluridIframePlane,
    PluridRouterBrowser,
    PluridRouterStatic,
    PluridRouterLink,
    PluridVirtualList,
    PluridPlaneConfigurator,
    PluridApplicationConfigurator,
    PluridProvider,
    // #endregion Components


    // #region Utilities
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

    PluridComponentProperty,

    PluridReactComponent,
    PluridReactPlane,
    PluridReactRoute,

    PluridPreserve,
    PluridPreserveTransmission,

    PluridPubSubPublishMessage,
    PluridPubSubSubscribeMessage,

    PluridConfiguration,
    PluridPartialConfiguration,
    RecursivePartial,

    /** Enumerations */
    SPACE_LAYOUT,
    SIZES,
    TRANSFORM_MODES,
    TRANSFORM_TOUCHES,
    PLURID_ROUTER_LOCATION_CHANGED,
    PLURID_ROUTER_LOCATION_STORED,

    /** Engine */
    // PluridRouter,
    PluridRouteMatcher,
    PluridRouteParser,

    /** PubSub */
    PluridPubSub,
    PLURID_PUBSUB_TOPIC,

    /** Server */
    serverComputeMetastate,

    /** Router */
    pluridRouterNavigate,
    usePluridRouter,

    getDirectPlaneMatch,

    /** state */
    pluridStateModules,
    // #endregion Utilities
};


export default Plurid;
// #endregion exports
