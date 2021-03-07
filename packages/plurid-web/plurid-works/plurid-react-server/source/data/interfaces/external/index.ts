// #region imports
    // #region libraries
    import express from 'express';

    import {
        Helmet,
    } from 'react-helmet-async';

    import {
        PluridRoute,
        PluridPreserve,
        PluridComponent,
    } from '@plurid/plurid-data';
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

    /**
     * Default: `/gateway`.
     */
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
}


export type PluridServerPartialOptions = Partial<PluridServerOptions>;


export type PluridServerService =
    | 'Apollo'
    | 'Redux'
    | 'Stripe';


export interface PluridServerServicesData {
    reduxStore?: any;
    reduxStoreValue?: any;
    reduxContext?: any;
    apolloClient?: any;
    stripeScript?: string;
}


export interface PluridServerConfiguration {
    routes: PluridRoute[];
    preserves: PluridPreserve[];
    helmet: Helmet;
    styles?: string[];
    middleware?: PluridServerMiddleware[];

    exterior?: PluridComponent;
    shell?: PluridComponent;

    /**
     * Services to be handled by the server.
     *
     * Supported: `GraphQL`, `Redux`, `Stripe`.
     */
    services?: PluridServerService[];
    servicesData?: PluridServerServicesData;

    options?: PluridServerPartialOptions;

    template?: PluridServerTemplateConfiguration;
}


export interface PluridServerTemplateConfiguration {
    htmlLanguage?: string;
    htmlAttributes?: Record<string, string>;
    defaultStyle?: string;
    headScripts?: string;

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
     * to preload redux state.
     *
     * Default: `__PRELOADED_REDUX_STATE__`
     */
    defaultPreloadedReduxState?: string;

    /**
     * Global variable name to be attached to window on the server-side
     * to preload plurid metastate.
     *
     * Default: `__PRELOADED_PLURID_METASTATE__`
     */
    defaultPreloadedPluridMetastate?: string;

    /**
     * JavaScript code to handle plurid space window resizing on the client.
     *
     * Default https://manual.plurid.com/plurid/server/window-sizer-script
     */
    windowSizerScript?: string;

    bodyScripts?: string;
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
// #endregion module
