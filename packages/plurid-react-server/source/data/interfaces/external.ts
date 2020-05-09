import express from 'express';

import {
    Helmet,
} from 'react-helmet-async';

import {
    PluridRouterPath,
    PluridPreserve,
    PluridComponent,
} from '@plurid/plurid-data';



export type PluridServerMiddleware = (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
) => void;


export type DebugLevels =
    | 'none'
    | 'error'
    | 'warn'
    | 'info';


export interface PluridServerOptions {
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
     * Name of the directory where the stills are gathered.
     */
    stillsDirectory: string;

    /**
     * Default: `/gateway`.
     */
    gatewayEndpoint: string;
}


export type PluridServerPartialOptions = Partial<PluridServerOptions>;


export type PluridServerService =
    | 'Apollo'
    | 'Redux'
    | 'Stripe';


export interface PluridServerServicesData {
    reduxStore?: any;
    reduxStoreValue?: any;
    apolloClient?: any;
    stripeAPIKey?: string;
    stripeScript?: string;
}


export interface PluridServerConfiguration {
    paths: PluridRouterPath[];
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
