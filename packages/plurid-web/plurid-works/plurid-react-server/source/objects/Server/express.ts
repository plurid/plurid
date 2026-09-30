// #region imports
    // #region libraries
    import fs from 'fs';
    import path from 'path';
    import {
        STATUS_CODES,
    } from 'http';
    import express, {
        Express,
    } from 'express';
    import compression from 'compression';

    import {
        time,
        uuid,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        ServerRequest,
        PluridServerOptions,
        PluridServerMiddleware,
    } from '~data/interfaces';

    import {
        SERVER_ERROR_TEMPLATE,
    } from '~data/templates';
    // #endregion external


    // #region internal
    import {
        debugAllows,
    } from './options';
    // #endregion internal
// #endregion imports



// #region module
/**
 * The Express application: no `x-powered-by`, a request id + start time on every request,
 * compression (with the `/vendor.js` → `.br` rewrite), the client build as static files, the
 * public directory (mounted with `index: false`, only when it exists), then the user middleware.
 */
export const configureExpress = (
    app: Express,
    options: PluridServerOptions,
    middlewareChain: PluridServerMiddleware[],
) => {
    const clientPath = path.join(options.buildDirectory, './client');

    app.disable('x-powered-by');

    app.use(
        (request, _, next) => {
            const requestID = uuid.generate();
            (request as ServerRequest).requestID = requestID;

            const requestTime = Date.now();
            (request as ServerRequest).requestTime = requestTime;

            next();
        }
    );

    if (options.compression) {
        app.use(
            compression() as any, // @types/compression targets Express 4's handler type
        );

        app.get(
            '/vendor.js',
            (request, response, next) => {
                response.setHeader(
                    'Content-Type', 'application/javascript',
                );

                const vendorBrotliExists = fs.existsSync(
                    path.join(clientPath, 'vendor.js.br')
                );
                const acceptEncoding = request.header('Accept-Encoding');

                if (acceptEncoding?.includes('br') && vendorBrotliExists) {
                    request.url += '.br';
                    response.set('Content-Encoding', 'br');
                    next();
                    return;
                }

                next();
            },
        );
    }

    app.use(
        express.static(clientPath, {
            maxAge: options.staticCache,
        }),
    );

    // Serve the public directory (favicon, og-image, manifest, robots) at `/`.
    // `index: false` keeps it from hijacking the `/` SSR route; the mount is
    // skipped unless the directory exists, so apps without one are unaffected.
    const publicPath = options.publicDirectory
        || path.join(options.buildDirectory, 'public');

    if (fs.existsSync(publicPath)) {
        app.use(
            express.static(publicPath, {
                index: false,
                maxAge: options.staticCache,
            }),
        );
    }

    for (const middleware of middlewareChain) {
        app.use(
            (req, res, next) => middleware(req, res, next),
        );
    }
};


/** An error's HTTP status (`status` / `statusCode`, as http-errors and body-parser set it), else 500. */
export const errorStatus = (
    error: unknown,
): number => {
    const carried = error as { status?: unknown; statusCode?: unknown } | null | undefined;
    const status = carried?.status ?? carried?.statusCode;
    return typeof status === 'number' && status >= 400 && status < 600
        ? status
        : 500;
};


/**
 * THE LAST HANDLER (2026-09-29): an error anywhere above it — a body the JSON parser refused, a
 * middleware that threw, a handler that rejected — answers with its status and a generic body, and is
 * logged here, under the server's `debug`. Express's own handler writes the stack, with the server's
 * absolute paths, into the response unless `NODE_ENV=production`, and this server's production switch
 * is `ENV_MODE`: a server run as `ENV_MODE=production node build` answered a malformed `POST /pttp`
 * with both.
 */
export const handleErrors = (
    options: PluridServerOptions,
    errorHtml: string | undefined,
): express.ErrorRequestHandler => (error, request, response, next) => {
    const status = errorStatus(error);

    if (debugAllows(options, status >= 500 ? 'error' : 'warn')) {
        const requestID = (request as ServerRequest).requestID;
        console.error(
            `[${time.stamp()} :: ${requestID}] (${status} ${STATUS_CODES[status] || 'Error'}) ${request.method} ${request.path}`,
            status >= 500 ? error : (error instanceof Error ? error.message : String(error)),
        );
    }

    if (response.headersSent) {
        // the response is already on its way: Express's handler ends the connection
        next(error);
        return;
    }

    if (status >= 500) {
        response
            .status(status)
            .type('html')
            .send(errorHtml || SERVER_ERROR_TEMPLATE);
        return;
    }

    response
        .status(status)
        .type('text/plain')
        .send(STATUS_CODES[status] || 'Error');
};


/** Open the browser on the served link when `options.open` asks for it (`PLURID_OPEN=false` vetoes). */
export const openBrowser = (
    options: PluridServerOptions,
    serverlink: string,
) => {
    try {
        const processDoNotOpen = process.env.PLURID_OPEN === 'false'
            ? true
            : false;

        if (processDoNotOpen) {
            return;
        }

        if (options.open) {
            // `open` is ESM-only: loaded when a server is asked to open the browser, never at import.
            import('open')
                .then(({ default: open }) => open(serverlink))
                .catch(() => undefined);
        }
    } catch (error) {
        return;
    }
};
// #endregion module
