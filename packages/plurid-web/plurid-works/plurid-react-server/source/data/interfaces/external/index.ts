// #region imports
    // #region libraries
    import express from 'express';

    import {
        Helmet,
    } from 'react-helmet-async';

    import {
        PluridRoute,
        PluridRoutePlane,
        PluridPreserve,
        IsoMatcherRouteResult,
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

    /**
     * Name of the directory where the assets files are bundled.
     */
    assetsDirectory: string;

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


export interface PluridServerService<P = any> {
    name: string;
    package: string;
    provider: string;
    properties?: P;
}

// export type PluridServerService =
//     | 'Apollo'
//     | 'Redux'
//     | 'Stripe';


// export interface PluridServerServicesData {
//     reduxStore?: any;
//     reduxStoreValue?: any;
//     reduxContext?: any;
//     apolloClient?: any;
//     stripeScript?: string;
// }


export interface PluridServerConfiguration {
    routes: PluridRoute<PluridReactComponent>[];
    planes?: PluridRoutePlane<PluridReactComponent>[];
    preserves: PluridPreserveReact[];
    helmet: Helmet;
    styles?: string[];
    middleware?: PluridServerMiddleware[];

    exterior?: PluridReactComponent;
    shell?: PluridReactComponent;

    /**
     * Replace the internal plurid plane with a custom implementation.
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

    // /**
    //  * Global variable name to be attached to window on the server-side
    //  * to preload redux state.
    //  *
    //  * Default: `__PRELOADED_REDUX_STATE__`
    //  */
    // defaultPreloadedReduxState?: string;

    /**
     * Global variable name to be attached to window on the server-side
     * to preload plurid metastate.
     *
     * Default: `__PRELOADED_PLURID_METASTATE__`
     */
    defaultPreloadedPluridMetastate?: string;
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




export interface PluridLiveServerOptions {
    server: string;
}
// #endregion module
