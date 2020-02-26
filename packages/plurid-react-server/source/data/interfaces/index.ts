import express from 'express';
import React from 'react';



export * from './internal';



export interface PluridServerRoute {
    path: string;
    view: string | string[];
    // type: 'get' | 'post' | 'put';
    middleware?: PluridServerMiddleware;
}


export type PluridServerMiddleware = (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
) => void;


export interface PluridServerOptions {
    /**
     * To log or not to log to the console.
     */
    quiet: boolean;

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
}

export type PluridServerPartialOptions = Partial<PluridServerOptions>;


export interface PluridServerConfiguration {
    Application: React.FC<any>;
    routes: PluridServerRoute[]
    middleware?: PluridServerMiddleware[];
    options?: PluridServerPartialOptions;
}
