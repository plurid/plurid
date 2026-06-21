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
/**
 * A pluggable key→string storage backend (Web Storage-shaped). Pass one as the `storageAdapter` prop
 * to redirect ALL of plurid's persistence — the versioned space snapshot AND the opaque
 * product-content blob — to sessionStorage, an in-memory map, a namespaced / encrypted wrapper, or a
 * memory-mirrored IndexedDB, instead of the default `localStorage`. The engine keeps owning the
 * serialization + versioning; the adapter only owns where the bytes land.
 *
 * `getItem` is read SYNCHRONOUSLY when the space snapshot seeds the first render, so a purely-async
 * backend (raw IndexedDB) can't hydrate camera/tree on first paint — mirror it to memory, or restore
 * asynchronously via the `onReady` store escape hatch. `setItem`/`removeItem` may return a promise:
 * writes are fire-and-forget, plurid never awaits them.
 */
export interface PluridStorageAdapter {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void | Promise<void>;
    removeItem(key: string): void | Promise<void>;
}

/** Minimal Redux-store shape exposed on `PluridApi` — no `@reduxjs/toolkit` coupling in the data layer. */
export interface PluridStore {
    getState(): PluridState;
    dispatch(action: any): any;
    subscribe(listener: () => void): () => void;
}

/**
 * The imperative handle handed to `onReady` — the master escape hatch. With this a host can do
 * ANYTHING the engine can: read any state, invoke any action, observe every change. Prefer the stable
 * pubsub topics + the getters; reach for `store` only when you need something the seams don't expose.
 */
export interface PluridApi {
    /**
     * The raw Redux store — read (`getState`), invoke (`dispatch` any action; the action creators are
     * exported as `pluridStateModules`), and observe (`subscribe`). The internal action/state SHAPES are
     * not a stable API — this is the deliberate power-user escape hatch.
     */
    store: PluridStore;
    /** The instance pubsub bus — publish control topics, subscribe to the `space.*Changed` emit topics. */
    pubsub: PluridPubSub;
    /** Read the full current engine state synchronously. */
    getSnapshot(): PluridState;
    /** Read the current camera viewpoint as the encoded string (the same `v` value the URL/seam use). */
    getViewpoint(): string;
}


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
     * Redirect ALL of plurid's persistence (the space snapshot + the `onPersistContent` blob) to a
     * custom key→string backend instead of `localStorage` — sessionStorage, an in-memory map, a
     * namespaced/encrypted wrapper, a memory-mirrored IndexedDB. Orthogonal to `useLocalStorage`,
     * which still gates WHETHER persistence runs; this only changes WHERE. Default: `localStorage`.
     */
    storageAdapter?: PluridStorageAdapter;

    /**
     * Programmatic GET of the camera viewpoint: invoked (debounced) whenever the camera settles,
     * with the ENCODED viewpoint string (the same `v` value the URL uses). Independent of the URL
     * config — a host can wire its own share links / storage / sync with this + `space.setViewpoint`
     * (to set) without the engine ever touching the URL.
     */
    onViewpointChange?: (viewpoint: string) => void;

    /**
     * The master escape hatch: invoked once after mount with a `PluridApi` ({ store, pubsub,
     * getSnapshot, getViewpoint }). Lets a host that cares enough read any state, invoke any action,
     * and observe every change — Plurid stays transparent, the dev stays in full control.
     */
    onReady?: (api: PluridApi) => void;

    /**
     * Replace the internal plurid plane with a custom implementation.
     */
    customPlane?: C;

    /**
     * Render-slots: return your own element to REPLACE an engine overlay (rendered at the same spot
     * inside the view), or omit to keep the default. Orthogonal to the `elements.*.show` flags and
     * `global.micro` (which HIDE the defaults) — these SUBSTITUTE. The slot is invoked on each render.
     */
    renderToolbar?: PluridRenderSlot;
    renderViewcube?: PluridRenderSlot;
    renderMinimap?: PluridRenderSlot;
    renderShortcuts?: PluridRenderSlot;

    matchedRoute?: IsoMatcherRouteResult<C>;

    /**
     * Used to identify the space if using `multispace`.
     */
    space?: string;
}


export type PluridApplicationView = (string | PluridView)[];


/**
 * A render-slot — returns the element to render in place of an engine UI overlay. Typed loosely
 * (`unknown`) to keep the data layer framework-agnostic; in React it is a `() => ReactNode`.
 */
export type PluridRenderSlot = () => unknown;


export interface LocalStorageUsage {
    view: boolean;
    ui: boolean;
}
// #endregion module
