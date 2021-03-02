// #region imports
    // #region libraries
    import express from 'express';
    // #endregion libraries
// #endregion imports



// #region module
export type ServerRequest = express.Request & {
    requestID: string;
}

export type ServerRequestRouteBody = {
    token: string;
    route: string;
}

export type ServerRequestRegisterBody = {
    token: string;
    route: string;
    data: RouteElement;
}


export type DebugLevels =
    | 'none'
    | 'error'
    | 'warn'
    | 'info';


export interface PluridRoutesServerOptions {
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
     * Routes to be ignored when serving the application (`GET`).
     */
    ignore: string[];
}


export type PluridRoutesServerPartialOptions = Partial<PluridRoutesServerOptions>;



export type QueryRoute = (
    route: string,
) => Promise<RouteElement>;

export type RegisterRoute = (
    route: string,
    data: RouteElement,
) => Promise<boolean>;

export type VerifyToken = (
    token: string,
) => Promise<boolean>;

export interface PluridRoutesServerConfiguration {
    queryRoute: QueryRoute;
    registerRoute: RegisterRoute;
    verifyToken: VerifyToken;
    options?: PluridRoutesServerPartialOptions;
}



export interface RouteElement {
    elementql: string;
}

export interface RouteRegistration {
    route: string;
    data: RouteElement;
}

export interface CachedRouteElement {
    data: RouteElement;
    expiration: number;
}
// #endregion module
