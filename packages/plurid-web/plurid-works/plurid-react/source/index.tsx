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
        pluridRouterNavigate,
    } from '@plurid/plurid-engine';

    import PluridPubSub from '@plurid/plurid-pubsub';
    // #endregion libraries


    // #region internal
    import {
        PluridReactComponent,
        PluridReactPlane,
        PluridReactRoute,
        PluridReactRoutePlane,
    } from './data/interfaces';

    import PluridApplication from './containers/Application';
    import PluridRouterBrowser from './containers/RouterBrowser';
    import PluridRouterStatic from './containers/RouterStatic';

    import PluridLink from './components/Link';
    import PluridRouterLink from './components/RouterLink';
    import PluridApplicationConfigurator from './components/ApplicationConfigurator';
    import PluridPlaneConfigurator from './components/PlaneConfigurator';
    import PluridExternalPlane from './components/ExternalPlane';
    import PluridIframePlane from './components/IframePlane';
    import PluridVirtualList from './components/Virtual/List';

    import PluridProvider from './components/Provider';

    import pluridStateModules from './services/state/modules';

    import {
        serverComputeMetastate,
    } from './services/logic/server';

    import {
        getDirectPlaneMatch,
    } from './services/logic/router';

    import {
        usePluridRouter,
    } from './services/hooks';
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
    RouterStatic: PluridRouterStatic,
    RouterBrowser: PluridRouterBrowser,

    Link: PluridLink,
    RouterLink: PluridRouterLink,
    ApplicationConfigurator: PluridApplicationConfigurator,
    PlaneConfigurator: PluridPlaneConfigurator,
    ExternalPlane: PluridExternalPlane,
    IframePlane: PluridIframePlane,
    VirtualList: PluridVirtualList,
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
    PluridRouterBrowser,
    PluridRouterStatic,

    PluridLink,
    PluridRouterLink,
    PluridApplicationConfigurator,
    PluridPlaneConfigurator,
    PluridExternalPlane,
    PluridIframePlane,
    PluridVirtualList,
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
    PluridReactRoutePlane,

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
