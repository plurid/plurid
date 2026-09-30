// #region imports
    // #region libraries
    import {
        Look,
    } from '@plurid/plurid-themes';
    // #endregion libraries

    // #region external
    import {
        PluridInspection,
        PluridRenderSlot,
    } from '../../external/application';

    import {
        PluridPlaneChromeContext,
    } from '../../external/chrome';
    // #endregion external

    // #region external
    import {
        PluridPlaneContext,
    } from '~interfaces/external/plane';

    import {
        PluridPlanesRegistrar,
    } from '~interfaces/external/registrar';

    import {
        IsoMatcherRouteResult,
    } from '~interfaces/external/routing';

    import {
        PluridPubSub,
    } from '~interfaces/external/pubsub';
    // #endregion external
// #endregion imports



// #region module
/** The diagnostic registry the engine writes while `development.inspector` is on (`api.inspect()` reads it). */
export interface PluridInspectorRegistry {
    enabled: boolean;
    /** Renders per plane since mount. */
    renders: Map<string, number>;
    /** The pointer gesture in flight (its intent), `null` between gestures. */
    gesture: string | null;
    /** Store notifications since mount. */
    dispatches: number;
}

export interface PluridContext<C> {
    planesRegistrar?: PluridPlanesRegistrar<C>;
    planeContext?: PluridPlaneContext<any>;
    planeContextValue?: any;
    customPlane?: C;
    planeNotFound?: boolean | C;
    planeRenderError?: boolean | C;
    matchedRoute?: IsoMatcherRouteResult<C> | undefined;
    hostname?: string;

    /**
     * The chrome in force — read by the planes and the space: the mode (`elements.chrome`), the look,
     * the docked page, the presentation, the bus, and the plane-level render slots.
     */
    chrome?: {
        mode: 'full' | 'minimal' | 'none';
        /** The look in force (its name, base and tokens), what the chrome contexts hand the slots. */
        look: Look;
        docked: string;
        presentation: 'space' | 'page';
        pubsub: PluridPubSub;
        /**
         * The host's plane-level slots (`PluridRenderSlot<PluridPlaneChromeContext>`), called with the
         * plane's chrome context. Typed as the Plane calls them: it builds the context only while a
         * slot is set, and holds it as possibly `undefined`.
         */
        renderPlaneControls?: PluridRenderSlot<PluridPlaneChromeContext | undefined>;
        renderPlaneBridge?: PluridRenderSlot<PluridPlaneChromeContext | undefined>;
        /** The space debugger's slot, called with the inspection (`api.inspect()`'s shape) when the space renders. */
        renderDebugger?: (inspection: PluridInspection | undefined) => unknown;
    };

    /** The diagnostic registry (the planes count their renders into it while it is enabled). */
    inspector?: PluridInspectorRegistry;

    /**
     * Hydrating a server render with a saved state waiting: each plane says when its content has
     * hydrated (it hydrates on its own, after the application mounted), and the saved state lands
     * once they all have.
     */
    planeHydrated?: (planeID: string) => void;

    /** The application's id, carried by what it reports on the bus (`space.changed` `application`). */
    applicationID?: string;

    defaultPubSub: PluridPubSub,
    /** Bridge another bus to the space (once per bus); the function returned takes it off again. */
    registerPubSub: (
        pubsub: PluridPubSub,
    ) => (() => void) | void;
}
// #endregion module
