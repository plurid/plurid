// #region imports
    // #region libraries
    import fs from 'fs';
    import path from 'path';
    import express, {
        Express,
    } from 'express';
    import compression from 'compression';

    import {
        uuid,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        ServerRequest,
        PluridServerOptions,
        PluridServerMiddleware,
    } from '~data/interfaces';
    // #endregion external
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
