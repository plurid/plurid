// #region module
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

export interface PluridRoutesServerConfiguration {
    queryRoute: QueryRoute;
    registerRoute: RegisterRoute;
    options?: PluridRoutesServerPartialOptions;
}



export interface RouteElement {
    elementql: string;
}
// #endregion module
