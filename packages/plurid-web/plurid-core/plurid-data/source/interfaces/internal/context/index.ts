// #region imports
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
        renderDebugger?: (context: any) => unknown;
    };

    defaultPubSub: PluridPubSub,
    registerPubSub: (
        pubsub: PluridPubSub,
    ) => void;
}
// #endregion module
