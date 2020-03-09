import express from 'express';

import React from 'react';

import {
    Helmet,
} from 'react-helmet-async';

import {
    ApolloClient,
} from 'apollo-client';

import {
    PluridRouterComponent,
    PluridRouterRoute,
} from '@plurid/plurid-data';



export type PluridServerMiddleware = (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
) => void;


export interface PluridServerRouting {
    components: PluridRouterComponent<any>[];
    routes: PluridRouterRoute<any>[];
}


export interface PluridServerOptions {
    /**
     * To log or not to log to the console.
     */
    quiet: boolean;

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
     * The ID of the root element in the HTML template.
     */
    root: string;

    /**
     * The JavaScript filename to inject in the HTML template.
     */
    script: string;

    /**
     * The JavaScript vendor filepath to inject in the HTML template.
     * Default `'/vendor.js'`.
     *
     * A CDN link can be used for better caching.
     */
    vendorScript: string;
}

export type PluridServerPartialOptions = Partial<PluridServerOptions>;

export type PluridServerService = 'GraphQL' | 'Redux' | 'Stripe';

export interface PluridServerServicesData {
    reduxStore?: any;
    reduxStoreValue?: any;
    graphqlClient?: ApolloClient<any>;
    stripeAPIKey?: string;
    stripeScript?: string;
}


export interface PluridServerConfiguration {
    // Application: React.FC<any>;
    routing: PluridServerRouting;
    helmet: Helmet;
    styles?: string[];
    middleware?: PluridServerMiddleware[];

    /**
     * Services to be handled by the server.
     *
     * Supported: `GraphQL`, `Redux`, `Stripe`.
     */
    services?: PluridServerService[];
    servicesData?: PluridServerServicesData;

    options?: PluridServerPartialOptions;
}
