// #region imports
    // #region libraries
    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        // #region constants
        PLURID_PUBSUB_TOPIC,
        // #endregion constants


        // #region interfaces
        PluridPlane,
        PluridView,
        PluridUniverse,
        PluridConfiguration,
        PluridPartialConfiguration,
        FlatPluridConfiguration,
        PluridRouterProperties,
        RecursivePartial,

        PluridRoute,
        PluridRouteSpace,
        PluridRouteUniverse,
        PluridRoutePlane,

        ComponentWithPlurid,
        PluridPlaneComponentProperty,
        PluridRouteComponentProperty,

        PluridPreserve,
        PluridPreserveTransmission,

        PluridPubSubPublishMessage,
        PluridPubSubSubscribeMessage,

        PluridApi,
        PluridStore,
        PluridStorageAdapter,

        CameraState,
        CameraDelta,
        CameraLimits,
        CameraMotion,
        Vec2,
        Vec3,
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
        IsoMatcher as PluridIsoMatcher,
        RouteParser as PluridRouteParser,
        pluridRouterNavigate,
        definePluridConfiguration,
    } from '@plurid/plurid-engine';

    import PluridPubSub from '@plurid/plurid-pubsub';
    // #endregion libraries


    // #region internal
    import {
        PluridReactComponent,
        PluridReactPlaneComponent,
        PluridReactRouteComponent,
        PluridReactPlane,
        PluridReactRoute,
        PluridReactRoutePlane,
        PluridRouteMatch,
    } from './data/interfaces';

    import PluridApplication from './containers/Application';
    import PluridRouterBrowser from './containers/RouterBrowser';
    import PluridRouterStatic from './containers/RouterStatic';
    import PluridProvider from './containers/Provider';
    import PluridDocument, {
        PluridDocumentScope,
    } from './components/utilities/Document';
    import {
        usePluridDocument,
        createDocumentRegistry,
    } from './services/document';
    import {
        composePluridProviders,
    } from './services/utilities/providers';

    import PluridLink from './components/links/Link';
    import PluridRouterLink from './components/links/RouterLink';
    import PluridApplicationConfigurator from './components/utilities/ApplicationConfigurator';
    import PluridPlaneConfigurator from './components/utilities/PlaneConfigurator';
    import PluridExternalPlane from './components/planes/ExternalPlane';
    import PluridIframePlane from './components/planes/IframePlane';
    import PluridVirtualList from './components/virtuals/List';

    import PluridPlaneBridge from './components/structural/Plane/components/PlaneBridge';
    import PluridPlaneContent from './components/structural/Plane/components/PlaneContent';
    import PluridPlaneControls from './components/structural/Plane/components/PlaneControls';
    import PluridPlaneDebugger from './components/structural/Plane/components/PlaneDebugger';

    import PluridSpaceDebugger from './components/structural/Space/components/SpaceDebugger';

    import pluridStateModules from './services/state/modules';

    import {
        serverComputeMetastate,
    } from './services/logic/server';

    import {
        getDirectPlaneMatch,
    } from './services/logic/router';

    import {
        encodeViewpoint,
        decodeViewpoint,
        encodeCameraViewpoint,
        decodeCameraViewpoint,
    } from './services/logic/viewpoint';

    import {
        usePluridRouter,
        usePluridPlane,
        useCamera,
        useSelection,
        usePluridHistory,
        usePluridPubSub,
        usePluridApi,
        useLook,
    } from './services/hooks';

    import {
        PluridPill,
        PluridPanel,
        PluridIconButton,
        PluridKey,
    } from './components/utilities/Chrome';
    import {
        PluridLookStyle,
        lookStylesheet,
    } from './services/look';
    import {
        chromeRoot,
        chromeControl,
        chromePill,
        chromePanel,
        chromeLine,
        chromeDocked,
        chromeKey,
    } from './services/styled/chrome';
    import {
        chromeModeOf,
        showsChrome,
    } from './services/chrome';

    // Escape-hatch primitives (Tier 3): the same building blocks the engine uses internally, so a
    // power-user can read derived state and compute "did the arrangement change" without forking.
    import pluridSelectors from './services/state/selectors';
    import {
        arrangementSignature,
    } from './services/logic/arrangement/signature';
    // #endregion internal
// #endregion imports



// #region module
// PluridIsoMatcher / PluridRouteParser are imported by name from the engine (above) so
// TS can reference them as external named imports in this package's .d.ts (a namespace
// member would inline anonymously and trip TS4094 on the classes' private members).


const internals = {
    /** The vocabulary's css fragments (styled-components `css`): compose your own chrome on the look's tokens. */
    chrome: {
        chromeRoot,
        chromeControl,
        chromePill,
        chromePanel,
        chromeLine,
        chromeDocked,
        chromeKey,
    },
    PluridPlaneBridge,
    PluridPlaneContent,
    PluridPlaneControls,
    PluridPlaneDebugger,
    PluridSpaceDebugger,
};

/**
 * Components and utilities.
 */
const Plurid = {
    // #region Components
    Application: PluridApplication,
    RouterStatic: PluridRouterStatic,
    RouterBrowser: PluridRouterBrowser,
    Provider: PluridProvider,

    Link: PluridLink,
    RouterLink: PluridRouterLink,
    ApplicationConfigurator: PluridApplicationConfigurator,
    PlaneConfigurator: PluridPlaneConfigurator,
    ExternalPlane: PluridExternalPlane,
    IframePlane: PluridIframePlane,
    VirtualList: PluridVirtualList,
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
    IsoMatcher: PluridIsoMatcher,
    routerNavigate: pluridRouterNavigate,

    /** Viewpoint */
    encodeViewpoint,
    decodeViewpoint,
    encodeCameraViewpoint,
    decodeCameraViewpoint,

    /** Escape-hatch primitives */
    selectors: pluridSelectors,
    definePluridConfiguration,
    arrangementSignature,

    internals,
    // #endregion Utilities
};


type PluridRouterPartialProperties = Partial<PluridRouterProperties<PluridReactComponent>>;
// #endregion module



// #region exports
export {
    // #region Components
    PluridApplication,
    PluridRouterBrowser,
    PluridRouterStatic,
    PluridProvider,
    /** The document head as data: a component (props and / or Helmet-style children), a hook, the scope, the registry */
    PluridDocument,
    PluridDocumentScope,
    usePluridDocument,
    createDocumentRegistry,
    /** Nest service providers identically on the server and the client (`layers[0]` innermost) */
    composePluridProviders,

    PluridLink,
    PluridRouterLink,
    PluridApplicationConfigurator,
    PluridPlaneConfigurator,
    PluridExternalPlane,
    PluridIframePlane,
    PluridVirtualList,
    // #endregion Components


    // #region Utilities
    /** Enumerations */
    SPACE_LAYOUT,
    SIZES,
    TRANSFORM_MODES,
    TRANSFORM_TOUCHES,
    PLURID_ROUTER_LOCATION_CHANGED,
    PLURID_ROUTER_LOCATION_STORED,

    /** Engine */
    PluridIsoMatcher,
    PluridRouteParser,
    definePluridConfiguration,

    /** PubSub */
    PluridPubSub,
    PLURID_PUBSUB_TOPIC,

    /** Server */
    serverComputeMetastate,

    /** Router */
    pluridRouterNavigate,
    usePluridRouter,

    /** Plane lens - live per-plane signals for plane content (the substrate seam) */
    usePluridPlane,
    /** Hooks over the engine, for anything rendered under an application */
    useCamera,
    useSelection,
    usePluridHistory,
    usePluridPubSub,
    usePluridApi,
    useLook,
    PluridPill,
    PluridPanel,
    PluridIconButton,
    PluridKey,
    PluridLookStyle,
    lookStylesheet,
    chromeModeOf,
    showsChrome,

    getDirectPlaneMatch,

    /** Viewpoint — encode/decode the camera ↔ the `v`-style string, for full host control */
    encodeViewpoint,
    decodeViewpoint,
    /** The camera-aware codec: v1 (legacy scalars) or v2 (full camera: pivot + pan preserved) */
    encodeCameraViewpoint,
    decodeCameraViewpoint,

    /** state */
    pluridStateModules,

    /**
     * Escape-hatch primitives — the engine's own building blocks, for hosts building custom
     * controls/layout: `pluridSelectors` (read derived state off the store from `onReady`) +
     * `arrangementSignature` (the structural hash undo/collaboration agree on). Lower-level geometry
     * (tree reconcile, location compute, interaction) lives on `@plurid/plurid-engine` (`space.tree`,
     * `space.location`, `interaction`).
     */
    pluridSelectors,
    arrangementSignature,

    internals,
    // #endregion Utilities
};


// Type-only re-exports use `export type` so esbuild (per-file transpile) elides them at
// runtime, instead of emitting runtime re-exports of names that have no JS value.
export type {
    PluridPlaneLens,
    PluridPlaneIsolation,
} from './services/hooks/plane';
export type {
    PluridDocumentRegistry,
    PluridDocumentBaseLayer,
} from './services/document/registry';
export type {
    PluridDocumentProperties,
} from './components/utilities/Document';
export type {
    PluridProviderLayer,
} from './services/utilities/providers';
export type {
    PluridDocument as PluridDocumentDescriptor,
    PluridDocumentMeta,
    PluridDocumentLink,
    PluridDocumentScript,
    PluridDocumentStyle,
    PluridDocumentContext,
    PluridDocumentResolver,
    PluridDocumentSource,
} from '@plurid/plurid-data';
export type {
    PluridCameraHandle,
} from './services/hooks/camera';
export type {
    PluridSelectionHandle,
} from './services/hooks/selection';
export type {
    PluridHistoryHandle,
} from './services/hooks/history';
export type {
    PluridApplicationHandle,
} from './containers/Application/handle';
export type {
    PluridConfigurationSpaceDocking,
    PluridConfigurationSpace,
    PluridConfigurationElementsPlane,
    TreePlane,
    PlaneLink,
    LinkCoordinates,
    PluridBookmarkAction,
    PluridChangeKind,
    PluridShortcutID,
    PluridState,
} from '@plurid/plurid-data';
export type {
    ClosePlaneOptions,
} from './services/state/thunks/planes';
export type {
    AppState as PluridStoreState,
} from './services/state/store';
export type {
    BridgeGeometry,
} from './services/logic/link/bridge';
export {
    bridgeGeometry,
    BRIDGE_REACH_VARIABLE,
    BRIDGE_ANGLE_VARIABLE,
} from './services/logic/link/bridge';
export {
    dockCommand,
    revealCommand,
    resolveCameraTarget,
    landingDockPlaneID,
} from './services/logic/camera';
export {
    pagePresentationDefaults,
    PLURID_ATTRIBUTE_ENTITY,
    PLURID_ATTRIBUTE_PLANE,
    PLURID_ATTRIBUTE_CONTROL,
    PLURID_ATTRIBUTE_DOCKED,
    PLURID_ATTRIBUTE_ASIDE,
    PLURID_ATTRIBUTE_APPLICATION,
    PLURID_ATTRIBUTE_LOOK,
    PLURID_ATTRIBUTE_PRESENTATION,
    PLURID_ATTRIBUTE_PAGE,
    PLURID_ATTRIBUTE_MOTION,
    PLURID_ATTRIBUTE_NAVIGATING,
    PLURID_ATTRIBUTE_OVERLAY,
    PLURID_ATTRIBUTE_RAIL,
    PLURID_ATTRIBUTE_RAIL_BUTTON,
} from '@plurid/plurid-data';
export type {
    ChromeMode,
    ChromePiece,
    PluridChromeContext,
    PluridPlaneChromeContext,
} from './services/chrome';
export type {
    Look,
    LookBase,
    LookTokens,
    LookName,
    LookScheme,
} from '@plurid/plurid-themes';
export {
    looks,
    LOOK_NAMES,
    LOOK_TOKENS,
    deriveLook,
    themeFromLook,
} from '@plurid/plurid-themes';
export type {
    CameraMotionOptions,
    CameraCommand,
} from './services/logic/camera';

export type {
    Theme,

    PluridPlane,
    PluridView,
    PluridUniverse,

    PluridRouterProperties,
    PluridRouterPartialProperties,

    PluridRoute,
    PluridRouteSpace,
    PluridRouteUniverse,
    PluridRoutePlane,

    ComponentWithPlurid,
    PluridPlaneComponentProperty,
    PluridRouteComponentProperty,

    PluridReactComponent,
    PluridReactPlane,
    PluridReactPlaneComponent,
    PluridReactRouteComponent,
    PluridReactRoute,
    PluridReactRoutePlane,
    PluridRouteMatch,

    PluridPreserve,
    PluridPreserveTransmission,

    PluridPubSubPublishMessage,
    PluridPubSubSubscribeMessage,

    PluridApi,
    PluridStore,
    PluridStorageAdapter,

    CameraState,
    CameraDelta,
    CameraLimits,
    CameraMotion,
    Vec2,
    Vec3,

    PluridConfiguration,
    PluridPartialConfiguration,
    FlatPluridConfiguration,
    RecursivePartial,
};


export default Plurid;
// #endregion exports
