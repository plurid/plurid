// #region imports
    // #region external
    import {
        PluridState,
    } from '../../internal/state';


    import {
        PluridPlane,
        PluridPlaneContext,
    } from '../plane';

    // import {
    //     PluridCluster,
    // } from '../cluster';

    // import {
    //     PluridUniverse,
    // } from '../universe';

    // import {
    //     PluridComponent,
    // } from '../component';

    import {
        PluridView,
    } from '../view';

    import {
        PluridPartialConfiguration,
    } from '../configuration';

    import {
        IndexedPluridPlane,
    } from '../plane';

    import {
        PluridPubSub,
    } from '../pubsub';

    import {
        PluridPlanesRegistrar,
    } from '../registrar';

    import {
        IsoMatcherRouteResult,
    } from '../routing';
    // #endregion external
// #endregion imports



// #region module
export interface PluridApplication<C> {
    id?: string;

    indexedPlanes?: Map<string, IndexedPluridPlane<C>>;
    planesProperties?: Map<string, any>;

    /**
     * The planes which will be rendered by the `PluridApplication`.
     */
    planes?: PluridPlane<C>[];

    /**
     * Optional context for the plane to have access to.
     */
    planeContext?: PluridPlaneContext<any>;

    /**
     * Optional context initial value.
     */
    planeContextValue?: Record<string, any>;

    /**
     * Routes of the planes in view on the initial rendering.
     */
    view: PluridApplicationView;

    /**
     * The hostname of the server exposed to the internet, e.g. `example.com`,
     * to be used in plurid plane links.
     */
    hostname?: string;

    // /**
    //  * A cluster ensures the rendering of all the planes that reference it
    //  * in the same space zone.
    //  */
    // clusters?: PluridCluster[];

    // /**
    //  * A `PluridApplication` must be either planes or universes based.
    //  *
    //  * A `PluridUniverse` is a collection of PluridPlanes (`PluridPlane[]`).
    //  */
    // universes?: PluridUniverse[];

    // /**
    //  * Controlled origins.
    //  * Defaults to the one serving the application.
    //  */
    // origins?: string[];

    // /**
    //  * Origins which the plurid links can access.
    //  * Default `controlled`.
    //  */
    // allowedOrigins?: 'controlled' | 'all';

    /**
     * Show or not the default Plane Not Found component, or pass a custom component.
     *
     * Default `true`.
     */
    planeNotFound?: boolean | C;

    /**
     * Use or not Plurid Plane Error Boundary and show the default Plurid Plane Render Error component,
     * or pass a custom component.
     *
     * Default `true`.
     */
    planeRenderError?: boolean | C;

    /**
     * Application-wide partial configuration.
     */
    configuration?: PluridPartialConfiguration;

    /**
     * Publish/Subscribe bus based on `@plurid/plurid-pubsub`.
     */
    pubsub?: PluridPubSub;

    // serverData?: PluridServerData;

    /**
     * Render the application statically.
     */
    static?: boolean;

    precomputedState?: Partial<PluridState>;

    planesRegistrar?: PluridPlanesRegistrar<C>;

    /**
     * Save plurid application state to local storage,
     * and load from local storage at startup.
     *
     * If multiple plurid applications run on the same origin,
     * use the `id` property to differentiate between states.
     *
     * `LocalStorageUsage` differentiates between multiple local storages:
     * for view, for user interface configuration.
     */
    useLocalStorage?: boolean // | LocalStorageUsage;

    /**
     * Replace the internal plurid plane with a custom implementation.
     */
    customPlane?: C;

    matchedRoute?: IsoMatcherRouteResult<C>;

    /**
     * Used to identify the space if using `multispace`.
     */
    space?: string;
}


export type PluridApplicationView = (string | PluridView)[];


export interface LocalStorageUsage {
    view: boolean;
    ui: boolean;
}


// export interface PluridServerData {
//     planes?: PluridPlane[];
// }
// #endregion module
