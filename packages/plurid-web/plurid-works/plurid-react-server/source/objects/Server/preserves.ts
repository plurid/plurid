// #region imports
    // #region libraries
    import express from 'express';

    import {
        PluridPreserveOnServe,
        PluridPreserveAfterServe,
        PluridPreserveOnError,
        PluridPreserveResponse,
        PluridPreserveTransmission,
        IsoMatcherRouteResult,
    } from '@plurid/plurid-data';

    import {
        PluridReactComponent,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import {
        PluridServerOptions,
    } from '~data/interfaces';

    import {
        NOT_FOUND_ROUTE,
        CATCH_ALL_ROUTE,
    } from '~data/constants';
    // #endregion external


    // #region internal
    import {
        PluridServerContext,
    } from './context';
    // #endregion internal
// #endregion imports



// #region module
/**
 * `options.ignore`: exact paths and `/*` prefixes fall through to the next handler. A prefix matches
 * on a SEGMENT boundary — `/api/*` excludes `/api` and `/api/x`, never `/apiculture` (C08, 2026-09-06);
 * the query string never takes part.
 */
export const ignoreGetRequest = (
    options: PluridServerOptions,
    requestPath: string,
) => {
    const queryIndex = requestPath.indexOf('?');
    const path = queryIndex === -1 ? requestPath : requestPath.slice(0, queryIndex);

    for (const ignore of options.ignore) {
        const normalizedIgnore = ignore.endsWith('/') && ignore.length > 1
            ? ignore.slice(0, ignore.length - 1)
            : ignore

        if (path === normalizedIgnore) {
            return true;
        }

        if (normalizedIgnore.endsWith('/*')) {
            const curatedIgnore = normalizedIgnore.slice(0, -2);

            if (path === curatedIgnore || path.startsWith(curatedIgnore + '/')) {
                return true;
            }
        }
    }

    return false;
};


/** A preserve `redirect` wins over the request path; an `http…` redirect is external (302). */
export const resolveMatchingPath = (
    preserveResult: PluridPreserveResponse | void,
    path: string,
) => {
    const redirect = preserveResult ? preserveResult.redirect : '';
    const externalRedirect = !!(redirect?.startsWith('http'));
    const matchingPath = redirect || path;

    return {
        externalRedirect,
        matchingPath,
    };
};


/**
 * The preserve for this request (a catch-all wins, the not-found one applies when nothing matches):
 * its `onServe` may respond itself, redirect, or hand back globals / providers / template / document
 * for the render; `onError` may respond or `depreserve`.
 */
/** What a request's preserve decided: responded itself, and / or a result and an `afterServe` to run. */
export interface PreserveResolution {
    preserveResponded: boolean;
    preserveResult: PluridPreserveResponse | undefined;
    preserveAfterServe: PluridPreserveAfterServe<
        IsoMatcherRouteResult<PluridReactComponent<any>> | undefined,
        express.Request,
        express.Response
    > | undefined;
}


export const resolvePreserve = async (
    server: PluridServerContext,
    request: express.Request,
    response: express.Response,
): Promise<PreserveResolution> => {
    const catchAll = server.preserves.find(
        preserve => preserve.serve === CATCH_ALL_ROUTE,
    );

    const notFound = server.preserves.find(
        preserve => preserve.serve === NOT_FOUND_ROUTE,
    );

    const isoMatch = server.isoMatcher.match(
        request.originalUrl,
        'route',
    );

    let preserveOnServe: undefined | PluridPreserveOnServe<
        IsoMatcherRouteResult<PluridReactComponent<any>> | undefined,
        express.Request,
        express.Response
    >;
    let preserveAfterServe: undefined | PluridPreserveAfterServe<
        IsoMatcherRouteResult<PluridReactComponent<any>> | undefined,
        express.Request,
        express.Response
    >;
    let preserveOnError: undefined | PluridPreserveOnError<
        IsoMatcherRouteResult<PluridReactComponent<any>> | undefined,
        express.Request,
        express.Response
    >;

    if (
        isoMatch
        || catchAll
        || notFound
    ) {
        const preserve = catchAll
            ? catchAll
            : notFound && !isoMatch
                ? notFound
                : server.preserves.find(
                    preserve => preserve.serve === isoMatch?.data.value
                );

        if (preserve) {
            preserveOnServe = preserve.onServe;
            preserveAfterServe = preserve.afterServe;
            preserveOnError = preserve.onError;
        }
    }

    let preserveResult: undefined | PluridPreserveResponse;
    if (preserveOnServe) {
        const transmission: PluridPreserveTransmission<
            IsoMatcherRouteResult<PluridReactComponent<any>> | undefined,
            express.Request,
            express.Response
        > = {
            context: {
                route: request.originalUrl,
                match: isoMatch,
            },
            request,
            response,
        };

        try {
            preserveResult = await preserveOnServe(transmission);

            if (preserveResult) {
                if (preserveResult.responded) {
                    return {
                        preserveResponded: true,
                        preserveResult,
                        preserveAfterServe,
                    };
                }
            }
        } catch (error) {
            // No `onError`: the failure is the request's — it reaches the pipeline's error path (500 / the
            // host's error page) instead of a normal-looking response missing its data (C07, 2026-09-06).
            // With `onError`: the host may respond, `depreserve` (render without the preserve), or
            // return nothing — which means it handled the failure and rendering continues.
            if (!preserveOnError) {
                throw error;
            }
            {
                const onErrorResponse = await preserveOnError(
                    error,
                    transmission,
                );

                if (onErrorResponse) {
                    if (onErrorResponse.responded) {
                        return {
                            preserveResponded: true,
                            preserveResult,
                            preserveAfterServe,
                        };
                    }

                    if (!onErrorResponse.depreserve) {
                        return {
                            preserveResponded: false,
                            preserveResult,
                            preserveAfterServe,
                        };
                    }
                }
            }
        }
    }

    return {
        preserveResponded: false,
        preserveResult,
        preserveAfterServe,
    };
};


export const resolvePreserveAfterServe = async (
    server: PluridServerContext,
    preserveAfterServe: PluridPreserveAfterServe<
        IsoMatcherRouteResult<PluridReactComponent<any>> | undefined,
        express.Request,
        express.Response
    > | undefined,
    request: express.Request,
    response: express.Response,
) => {
    if (preserveAfterServe) {
        const isoMatch = server.isoMatcher.match(
            request.originalUrl,
            'route',
        );

        const transmission: PluridPreserveTransmission<
            IsoMatcherRouteResult<PluridReactComponent<any>> | undefined,
            express.Request,
            express.Response
        > = {
            context: {
                route: request.originalUrl,
                match: isoMatch,
            },
            request,
            response,
        };

        await preserveAfterServe(transmission);
    }
};
// #endregion module
