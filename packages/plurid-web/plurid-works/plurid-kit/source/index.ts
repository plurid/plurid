// #region imports
    // #region external
    import type PluridServer from '@plurid/plurid-react-server';

    import type {
        PluridServerConfiguration,
        PluridServerOptions,
        PluridServerService,
        PluridServerMiddleware,
        PluridServerTemplateConfiguration,
        PluridServerDocumentHook,
        PluridServerRenderMode,
        PluridPreserveReact,
        PluridDocument,
        PluridDocumentMeta,
        PluridDocumentLink,
    } from '@plurid/plurid-react-server';
    // #endregion external
// #endregion imports



// #region module
/**
 * A value that may be provided directly OR behind a thunk so the framework loads
 * it ONLY on the server - keeping server-only code (data-loaders, requesters,
 * secrets) OUT of the client bundle. Put the server-only `import`s INSIDE the
 * thunked module:
 *
 * ```ts
 * preserves: () => import('./source/server/preserves'),
 * ```
 */
export type ServerOnly<T> =
    | T
    | (() => T | Promise<T> | Promise<{ default: T }>);


/**
 * The document head is DATA (`PluridDocument` from plurid-react-server / plurid-data): title,
 * `titleTemplate`, description, canonical, meta, links, styles, scripts, JSON-LD, html / body
 * attributes. The kit's `head` is the LOWEST layer; a route's / plane's `head`, in-render
 * `<PluridDocument>` declarations, a preserve's `document` and the server `document` hook layer
 * above it. `PluridHead*` are kept as aliases for one release.
 */
export type PluridHead = PluridDocument;
/** @deprecated Use `PluridDocumentMeta`. */
export type PluridHeadMeta = PluridDocumentMeta;
/** @deprecated Use `PluridDocumentLink`. */
export type PluridHeadLink = PluridDocumentLink;

/**
 * Favicon set. A bare string is shorthand for the primary icon; the object form
 * expands to the standard `<link rel="icon" | "apple-touch-icon" | "mask-icon">`
 * + manifest tags. Paths resolve against the served `public/` directory.
 */
export type PluridFavicon = NonNullable<PluridServerTemplateConfiguration['favicon']>;
export type PluridFaviconSet = Exclude<PluridFavicon, string>;


/**
 * One provider in the app's service stack, used on BOTH the server (SSR) and the
 * client (hydration) so the provider order can never drift between them.
 *
 * Lifecycle:
 *  - `properties` are static props passed on both targets.
 *  - On the SERVER, per-request props come from the matching preserve
 *    (`preserve.providers[name]`) and are merged OVER `properties`
 *    (see plurid-react-server `ContentGenerator`).
 *  - On the CLIENT, `store`/`client` rebuild the per-request instances from the
 *    serialized window state (`__PRELOADED_REDUX_STATE__`, ...).
 */
export interface PluridServiceConfig<
    ClientInstance = unknown,
    StoreInstance = unknown,
    Properties = Record<string, unknown>,
> {
    /** Service identity - the key the preserve uses in `providers[name]`. e.g. `'Apollo' | 'Redux' | 'Stripe' | 'Dnd'`. */
    name: string;
    /**
     * The React context provider component (ApolloProvider, ReduxProvider,
     * StripeProvider, DndProvider, ...). Typed `any` to match the engine's
     * `PluridServerService.Provider` (provider prop shapes vary per library, and
     * a strict `ComponentType<P>` rejects e.g. ApolloProvider under
     * strictFunctionTypes).
     */
    Provider: any;
    /** Static props applied on both targets; per-request server props are merged over these. */
    properties?: Properties;
    /** One-time client factory (e.g. the Apollo client) built once on the client for hydration. */
    client?: () => ClientInstance;
    /** Store factory built from preheated state - server: from the preserve; client: from the serialized window state. */
    store?: (preloadedState?: any) => StoreInstance;
    /** Optional provider context object (e.g. a custom `ReactReduxContext`). */
    context?: unknown;
    /** Provider nesting order: lower = INNER (closest to the application), the same on both targets. Defaults to array order. */
    order?: number;
}


/** Build/bundle knobs - the typed replacement for each app's `scripts/custom.js`. */
export interface PluridBundleConfig {
    /**
     * Client-only natives to keep EXTERNAL in the client bundle (never bundled
     * into the browser output), e.g. `['geoip-lite']`.
     */
    clientExternals?: string[];
    /**
     * Modules to FORCE-bundle even though the server build externalizes bare
     * imports by default - deep interop paths, e.g. the requester's
     * `distribution/server.frontend.js`, or `react-dnd`/`recharts`.
     * A function form lets you remap a dependency id.
     */
    forceBundle?: Array<string | ((dependency: string) => string | undefined)>;
    /** esbuild `define` entries inlined at build time. */
    define?: Record<string, string>;
    /** Extra esbuild loaders keyed by file extension (e.g. `{ '.png': 'file' }`). */
    loaders?: Record<string, string>;
    /** Extra `process.env.*` keys to inline into the client bundle. */
    environment?: string[];
}


/**
 * The plurid app configuration - the single source an app authors. Common fields
 * are tiny (`serverName`, `hostname`, `routes`, `shell`); everything else is
 * defaulted or an escape hatch. `defineConfig()` wraps it for editor types.
 *
 * The framework projects this onto `PluridServerConfiguration` (server) and a
 * provider stack (client). Fields marked SERVER-ONLY may be given as a thunk so
 * their modules never enter the client bundle (see {@link ServerOnly}).
 */
export interface PluridConfig {
    // --- identity -----------------------------------------------
    /** Logging/identity name, e.g. `'denote'`. -> `options.serverName`. */
    serverName: string;
    /** Public hostname used in plane links, e.g. `'denote.plurid.com'`. -> `options.hostname`. */
    hostname: string;
    /** Root element id in the HTML template. Default `'root'`. -> `template.root`. */
    root?: string;

    // --- product surface (shared: SSR + hydration) --------------
    routes: PluridServerConfiguration['routes'];
    planes?: PluridServerConfiguration['planes'];
    shell?: PluridServerConfiguration['shell'];
    exterior?: PluridServerConfiguration['exterior'];
    routerProperties?: PluridServerConfiguration['routerProperties'];

    // --- services (shared provider stack) -----------------------
    services?: PluridServiceConfig[];
    /**
     * A server-side document layer computed AFTER the render, above everything else — the seam
     * for a head library you still run inside `services` (read its context here and return a
     * `PluridDocument`). Server only.
     */
    document?: ServerOnly<PluridServerDocumentHook>;
    /**
     * `'string'` (default): `renderToString`. `'suspense'`: a buffered `renderToPipeableStream`
     * that waits for every Suspense boundary (`use()` / async data inside planes) before the
     * document is written — still one document, no streaming.
     */
    render?: PluridServerRenderMode;

    // --- per-request data-loading (SERVER-ONLY) -----------------
    /** Preserves run per request to load data + seed provider/window state. */
    preserves?: ServerOnly<PluridPreserveReact[]>;
    /** Sugar for a single catch-all preserve; merged into `preserves`. */
    load?: ServerOnly<PluridPreserveReact>;

    // --- document head / metadata -------------------------------
    head?: PluridHead;
    favicon?: PluridFavicon;
    /** Web app manifest path, e.g. `/site.webmanifest`. */
    manifest?: string;
    /** Extra global stylesheet hrefs. -> `styles`. */
    styles?: string[];

    // --- error pages --------------------------------------------
    /** Component (registered as the NOT_FOUND route) or a path under `public/`. */
    notFound?: PluridServerConfiguration['shell'] | string;
    /** Component or a path under `public/` rendered on a 500. */
    errorPage?: PluridServerConfiguration['shell'] | string;

    // --- static + build -----------------------------------------
    /** Static assets served at `/` (favicon, og, manifest, robots). Default `'source/public'`. */
    publicDir?: string;
    /** Build output directory. Default `'build'`. -> `options.buildDirectory`. */
    buildDir?: string;
    /** Toggle PTTP. Default `true`. */
    usePTTP?: boolean;
    elementqlEndpoint?: string;
    bundle?: PluridBundleConfig;

    // --- express extension (SERVER-ONLY) ------------------------
    middleware?: PluridServerMiddleware[];
    /** Imperative access to the underlying server for custom routes (deon/defile/decart/status). */
    handlers?: ServerOnly<(server: PluridServer) => void>;

    // --- raw escape hatches (passthrough to the runtime) --------
    /** Merged over the framework-derived `PluridServerOptions`. */
    options?: Partial<PluridServerOptions>;
    /** Merged over the framework-derived `PluridServerTemplateConfiguration`. */
    template?: PluridServerTemplateConfiguration;
}


/**
 * Identity helper that gives `plurid.config.ts` full editor types + inference.
 *
 * ```ts
 * import { defineConfig } from '@plurid/plurid-kit';
 *
 * export default defineConfig({
 *     serverName: 'denote',
 *     hostname: 'denote.plurid.com',
 *     routes,
 *     shell,
 * });
 * ```
 */
export function defineConfig(
    config: PluridConfig,
): PluridConfig {
    return config;
}
// #endregion module



// #region exports
export type {
    PluridServerConfiguration,
    PluridServerOptions,
    PluridServerService,
    PluridServerMiddleware,
    PluridServerTemplateConfiguration,
    PluridPreserveReact,
} from '@plurid/plurid-react-server';
// #endregion exports
