// #region imports
    // #region external
    import {
        PluridInspection,
    } from '../../external/application';
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
        look: any;
        docked: string;
        presentation: 'space' | 'page';
        pubsub: PluridPubSub;
        renderPlaneControls?: (context: any) => unknown;
        renderPlaneBridge?: (context: any) => unknown;
        /** The space debugger's slot, called with the inspection (`api.inspect()`'s shape) when the space renders. */
        renderDebugger?: (inspection: PluridInspection | undefined) => unknown;
    };

    /** The diagnostic registry (the planes count their renders into it while it is enabled). */
    inspector?: PluridInspectorRegistry;

    defaultPubSub: PluridPubSub,
    registerPubSub: (
        pubsub: PluridPubSub,
    ) => void;
}
// #endregion module
