// #region imports
    // #region libraries
    import express from 'express';

    import {
        PluridRoute,
        PluridPreserveResponse,
        PluridDocument,
        PluridRoutePlane,
        PluridPreserve,
        IsoMatcherRouteResult,
        PluridRouterProperties,
    } from '@plurid/plurid-data';

    import {
        PluridReactComponent,
    } from '@plurid/plurid-react';
    // #endregion libraries
// #endregion imports



// #region module
export type PluridServerMiddleware = (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
) => void;


export type ServerRequest = express.Request & {
    requestID: string;
    requestTime: number;
}


export type DebugLevels =
    | 'none'
    | 'error'
    | 'warn'
    | 'info';


export interface PluridServerOptions {
    /** To be used for logging. Default `Plurid Server` */
    serverName: string;

    /**
     * The hostname of the server exposed to the internet, e.g. `example.com`,
     * to be used in plurid plane links.
     */
    hostname: string;

    /**
     * To log or not to log to the console.
     */
    quiet: boolean;

    /**
     * Debug levels.
     *
     * Production default: `error`.
     * Development default: `info` and above.
     */
    debug: DebugLevels;

    /**
     * Use `gzip` compression for the response. Default `true`.
     */
    compression: boolean;

    /**
     * Open in browser at start.
     */
    open: boolean;

    /**
     * Name of the directory where the files (server and client) are bundled.
     */
    buildDirectory: string;

    /** @deprecated Read by nothing; kept for one release. */
    assetsDirectory: string;

    /**
     * Directory of static assets (favicon, og-image, manifest, robots) served at
     * the URL root `/`. Empty string (the default) resolves to
     * `<buildDirectory>/public`; the mount is skipped if the directory does not
     * exist, so apps without a public directory are unaffected. The framework
     * points this at `source/public` during `plurid dev`.
     */
    publicDirectory: string;

    /** @deprecated The gateway render never shipped; read by nothing. Kept for one release. */
    gatewayEndpoint: string;

    /**
     * Provide a `max-age` in milliseconds for http caching of the static serves.
     * This can also be a string accepted by the `ms` module.
     *
     * Default: 0.
     */
    staticCache: number | string;

    /**
     * Routes to be ignored when serving the application (`GET`).
     */
    ignore: string[];

    /**
     * Name of the directory where the stills are gathered.
     */
    stillsDirectory: string;

    stiller: PluridStillerOptions;

    /**
     * Install `SIGINT`/`SIGTERM` handlers that stop the server and call `process.exit`.
     * Defaults to `true` (convenient for the CLI). Set to `false` when EMBEDDING the server
     * in a host process you do not want it to terminate; then manage lifecycle via `stop()`.
     */
    attachSignalHandlers: boolean;
}


export type PluridServerPartialOptions = Partial<PluridServerOptions>;


export interface PluridServerService<P = any, PP = any> {
    name: string;
    Provider: P;
    properties?: PP;
}


export type PluridServerRenderMode = 'string' | 'suspense';


export interface PluridServerDocumentContext {
    request: express.Request;
    match: IsoMatcherRouteResult<PluridReactComponent>;
    metastate: any;
    /** The document assembled so far (template → route → planes → in-render → preserve). */
    document: PluridDocument;
    preserve: PluridPreserveResponse | undefined;
}


/**
 * A document layer computed AFTER the render, above every other layer — the seam for a head
 * library still running inside `services` (read its context here and return a document), or
 * for request-derived metadata.
 */
export type PluridServerDocumentHook = (
    context: PluridServerDocumentContext,
) => PluridDocument | undefined | Promise<PluridDocument | undefined>;


export interface PluridServerConfiguration {
    routes: PluridRoute<PluridReactComponent>[];
    planes?: PluridRoutePlane<PluridReactComponent>[];
    preserves: PluridPreserveReact[];
    /**
     * @deprecated The head is the document model now (`template.head`, a route's / plane's `head`,
     * `<PluridDocument>`, a preserve's `document`, the `document` hook); this field is ignored
     * (a warning is logged once) and will be removed.
     */
    helmet?: unknown;
    /** The post-render document layer (see `PluridServerDocumentHook`). */
    document?: PluridServerDocumentHook;
    /** `'string'` (default, `renderToString`) or `'suspense'` (a buffered stream that awaits every boundary). */
    render?: PluridServerRenderMode;
    styles?: string[];
    middleware?: PluridServerMiddleware[];

    exterior?: PluridReactComponent;
    shell?: PluridReactComponent;
    routerProperties?: Partial<PluridRouterProperties<PluridReactComponent>>;

    /**
     * @deprecated Never reached the router (a `PluridApplication` prop only); ignored, to be removed.
     */
    customPlane?: PluridReactComponent;

    /**
     * Services to be handled by the server.
     *
     * Supported: `GraphQL`, `Redux`, `Stripe`.
     */
    services?: PluridServerService[];
    // servicesData?: PluridServerServicesData;

    options?: PluridServerPartialOptions;

    template?: PluridServerTemplateConfiguration;

    usePTTP?: boolean;
    pttpHandler?: PTTPHandler;

    elementqlEndpoint?: string;
}


export type PTTPHandler = (
    path: string,
) => Promise<boolean>;


export interface PluridServerTemplateConfiguration {
    htmlLanguage?: string;
    htmlAttributes?: Record<string, string>;
    defaultStyle?: string;

    headScripts?: string[];
    bodyScripts?: string[];

    /**
     * The JavaScript vendor filepath to inject in the HTML template.
     * Default `'/vendor.js'`.
     *
     * A CDN link can be used for better caching.
     */
    vendorScriptSource?: string;

    /**
     * The JavaScript filename to inject in the HTML template.
     */
    mainScriptSource?: string;

    bodyAttributes?: Record<string, string>;

    /**
     * The ID of the root element in the HTML template.
     */
    root?: string;


    /**
     * Global variable name to be attached to window on the server-side
     * to preload plurid metastate.
     *
     * Default: `__PRELOADED_PLURID_METASTATE__`
     */
    defaultPreloadedPluridMetastate?: string;

    minify?: boolean;

    /**
     * Favicon links injected into `<head>`. A bare string is the primary icon
     * (`rel="icon"`); the object expands to icon / apple-touch-icon / sized /
     * mask-icon links plus a `theme-color` meta. Paths resolve against the served
     * public directory (see `PluridServerOptions.publicDirectory`).
     */
    favicon?: string | {
        icon?: string;
        apple?: string;
        sizes?: Record<string, string>;
        maskIcon?: string;
        themeColor?: string;
    };

    /**
     * Web app manifest href, injected as `<link rel="manifest">`.
     */
    manifest?: string;

    /**
     * The static document head — the LOWEST layer of the document model (a route's / plane's
     * `head`, in-render `<PluridDocument>` declarations, a preserve's `document` and the `document`
     * hook layer above it). The old `{ title, description, meta, links }` shape is a subset.
     */
    head?: PluridDocument;

    /**
     * Override the built-in 500 error page HTML (sent on a render failure).
     */
    errorHtml?: string;
}


export interface PluridStillerOptions {
    /**
     * Recommended: `'networkidle0'` | `'networkidle2'` | `'load'`.
     *
     * Default: `'networkidle0'`.
     */
    waitUntil: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';

    /**
     * Maximum navigation time in milliseconds, pass 0 to disable timeout.
     *
     * Default: 30000.
     */
    timeout: number;

    /**
     * Routes to be ignored by the stilling process.
     */
    ignore: string[];
}



export type PluridPreserveReact = PluridPreserve<
    IsoMatcherRouteResult<PluridReactComponent<any>> | undefined,
    express.Request,
    express.Response
>;




// #endregion module


export type {
    PluridDocument,
    PluridDocumentMeta,
    PluridDocumentLink,
    PluridDocumentScript,
    PluridDocumentStyle,
    PluridDocumentBase,
    PluridDocumentContext,
    PluridDocumentResolver,
    PluridDocumentSource,
} from '@plurid/plurid-data';
