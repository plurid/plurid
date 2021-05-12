// #region module
export interface PluridPreserve<M = undefined, RQ = any, RS = any> {
    /**
     * Served path value.
     */
    serve: string;

    /**
     * The function will be executed and awaited before rendering the application on the server.
     *
     * The function can return one or more providers which will be passed to their appropriate consumers,
     * can redirect to a different path, or can handle any cross-cutting concerns, such as eventing or logging.
     */
    onServe: PluridPreserveOnServe<M, RQ, RS>;

    /**
     * Function called after route is served successfully.
     */
    afterServe?: PluridPreserveAfterServe<M, RQ, RS>;

    /**
     * Function called if `onServe` throws an error.
     */
    onError?: PluridPreserveOnError<M, RQ, RS>;
}


export type PluridPreserveOnServe<M, RQ, RS> = (
    transmission: PluridPreserveTransmission<M, RQ, RS>,
) => Promise<PluridPreserveResponse | void>;


export type PluridPreserveAfterServe<M, RQ, RS> = (
    transmission: PluridPreserveTransmission<M, RQ, RS>,
) => Promise<void>;


export type PluridPreserveOnError<M, RQ, RS> = (
    error: any,
    transmission: PluridPreserveTransmission<M, RQ, RS>,
) => Promise<PluridPreserveResponse | void>;


export interface PluridPreserveTransmission<M, RQ, RS> {
    context: PluridPreserveTransmissionContext<M>;
    request: RQ;
    response: RS;
}

export interface PluridPreserveTransmissionContext<M = undefined> {
    match: M;
    route: string;
}


export interface PluridPreserveResponse {
    providers?: PluridPreserveResponseProviders;

    /**
     * Redirect to another route.
     */
    redirect?: string;

    /**
     * If `response` is handled within the preserve `action`, set the `responded` value to `true`,
     * to prevent the server from sending a double response.
     */
    responded?: boolean;

    // /**
    //  * Handle the server response without taking into account the preserve.
    //  * Considers only the first match.
    //  */
    // depreserve?: boolean;

    /**
     * Ignore the preserve computation, but continue to try to find a match in the preserves array.
     * To be used with the catch-all matcher `'*'` or with complex routing with overlapping parameters.
     */
    pass?: boolean;

    /**
     * Key-value pairs which will be inserted as globals on the window as in
     * `window.${key} = ${value}`.
     */
    globals?: Record<string, string>;
}

export type PluridPreserveResponseProviders = Record<string, any>;
// #endregion module
