// #region imports
    // #region external
    import {
        PluridState,
    } from '../../internal/state';


    import {
        PluridPlane,
        PluridPlaneContext,
    } from '../plane';

    import {
        PluridUniverse,
    } from '../universe';

    import {
        PluridView,
    } from '../view';

    import {
        PluridPartialConfiguration,
    } from '../configuration';

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
     * Center the view on a plane from `view`.
     */
    centerView?: string;

    /**
     * The hostname of the server exposed to the internet, e.g. `example.com`,
     * to be used in plurid plane links.
     */
    hostname?: string;

    /**
     * A `PluridApplication` must be either planes or universes based.
     *
     * A `PluridUniverse` is a collection of `PluridPlane`s.
     */
    universes?: PluridUniverse<C>[];

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
     * Opt-in CONTENT seam (requires `useLocalStorage`). The engine persists the spatial state
     * (camera + tree) itself; your *content* (e.g. note bodies) is yours — these callbacks let it
     * ride the same debounced + `pagehide`-flushed localStorage, keyed by `id`, so you don't
     * reinvent that machinery.
     *
     * `onPersistContent` is invoked on each persist tick; its return value is stored opaquely (the
     * engine never inspects it — keep it JSON-serializable). `onRestoreContent` is invoked once,
     * after mount, with the previously-stored value (omitted entirely if there is none). Version
     * your own content shape inside the blob — the engine does not version it for you.
     */
    onPersistContent?: () => unknown;
    onRestoreContent?: (content: unknown) => void;

    /**
     * Programmatic GET of the camera viewpoint: invoked (debounced) whenever the camera settles,
     * with the ENCODED viewpoint string (the same `v` value the URL uses). Independent of the URL
     * config — a host can wire its own share links / storage / sync with this + `space.setViewpoint`
     * (to set) without the engine ever touching the URL.
     */
    onViewpointChange?: (viewpoint: string) => void;

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
// #endregion module
