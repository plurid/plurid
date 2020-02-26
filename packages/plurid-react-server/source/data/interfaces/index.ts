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
    quiet: boolean;
}

export type PluridServerPartialOptions = Partial<PluridServerOptions>;


export interface PluridServerConfiguration {
    Application: React.FC<any>;
    routes: PluridServerRoute[]
    index: string;
    middleware?: PluridServerMiddleware[];
    options?: PluridServerPartialOptions;
}
