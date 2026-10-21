// #region imports
    // #region libraries
    import express from 'express';

    import {
        time,
        uuid,
    } from '@plurid/plurid-functions';

    import {
        PluridPreserveResponse,
        PluridMetastate,
        IsoMatcherRouteResult,
    } from '@plurid/plurid-data';

    import {
        general,
    } from '@plurid/plurid-engine';

    import {
        serverComputeMetastate,
        createDocumentRegistry,
        PluridReactComponent,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import {
        ServerRequest,
    } from '~data/interfaces';

    import {
        NOT_FOUND_ROUTE,
        DEFAULT_SERVER_OPTIONS_HOSTNAME,
    } from '~data/constants';
    import {
        PRELOADED_REDUX_STATE_KEY,
    } from '~data/constants/preload';

    import {
        NOT_FOUND_TEMPLATE,
        SERVER_ERROR_TEMPLATE,
    } from '~data/templates';

    import PluridRenderer from '../Renderer';
    // #endregion external


    // #region internal
    import {
        PluridServerContext,
    } from './context';
    import {
        debugAllows,
        computeRequestTime,
    } from './options';
    import {
        ignoreGetRequest,
        resolveMatchingPath,
        resolvePreserve,
        resolvePreserveAfterServe,
        PreserveResolution,
    } from './preserves';
    import {
        buildRequestTree,
        renderContent,
    } from './render';
    import {
        resolveRouteDocument,
        assembleDocument,
    } from './document';
    // #endregion internal
// #endregion imports



// #region module
/**
 * Post-response work (a preserve's `afterServe`), run on every path that answered: the page, the
 * redirect, a still, each 404. Observed — logged with the request id, never a second response, never
 * an unhandled rejection. Only the page's path caught it (C09); on the other five it was fire and
 * forget, so while an `afterServe` dependency was down (an analytics call) the first request for a
 * missing page ended the process (2026-09-29).
 */
const runAfterServe = (
    server: PluridServerContext,
    requestID: string,
    preserveAfterServe: PreserveResolution['preserveAfterServe'],
    request: express.Request,
    response: express.Response,
) => {
    resolvePreserveAfterServe(server,
        preserveAfterServe,
        request,
        response,
    ).catch((error) => {
        if (debugAllows(server.options, 'error')) {
            console.error(
                `[${time.stamp()} :: ${requestID}] afterServe failed for GET ${request.path}`,
                error,
            );
        }
    });
};


/**
 * THE REQUEST WALK: ignore list → preserve → redirect → still → route match (the 404 ladder) →
 * render → send. Any throw — a render failure included — is a 500 with the error page, unless the
 * response has already gone out, which no error can take back.
 */
export const handleGetRequest = async (
    server: PluridServerContext,
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
) => {
    const requestID = (request as ServerRequest).requestID || uuid.generate();

    try {
        if (debugAllows(server.options, 'info')) {
            console.info(
                `[${time.stamp()} :: ${requestID}] (000 Start) Handling GET ${request.path}`,
            );
        }


        const ignorable = ignoreGetRequest(server.options, 
            request.path,
        );

        if (
            ignorable
        ) {
            if (debugAllows(server.options, 'info')) {
                const requestTime = computeRequestTime(request);

                console.info(
                    // passed on, not answered: it logged a 204 that the next handler never sends (2026-10-20)
                    `[${time.stamp()} :: ${requestID}] Ignored GET ${request.path}: passed to the next handler${requestTime}`,
                );
            }

            next();
            return;
        }


        const {
            preserveResponded,
            preserveResult,
            preserveAfterServe,
        } = await resolvePreserve(server, 
            request,
            response,
        );

        // A preserve that answered itself but did not say so (`response.redirect('/login')` without
        // `responded: true`) sent its response all the same: rendering on was work for nothing, and its
        // `send` threw ERR_HTTP_HEADERS_SENT, as did the error page after it (2026-09-29).
        if (
            !preserveResponded
            && response.headersSent
            && debugAllows(server.options, 'warn')
        ) {
            console.warn(
                `[${time.stamp()} :: ${requestID}] a preserve responded to GET ${request.path} without returning \`responded: true\`; the render is skipped`,
            );
        }

        if (
            preserveResponded
            || response.headersSent
        ) {
            if (debugAllows(server.options, 'info')) {
                const requestTime = computeRequestTime(request);

                console.info(
                    `[${time.stamp()} :: ${requestID}] (204 No Content) Preserve handled GET ${request.path}${requestTime}`,
                );
            }

            return;
        }


        const {
            externalRedirect,
            matchingPath,
        } = resolveMatchingPath(
            preserveResult,
            request.originalUrl,
        );

        if (
            externalRedirect
        ) {
            if (debugAllows(server.options, 'info')) {
                const requestTime = computeRequestTime(request);

                console.info(
                    `[${time.stamp()} :: ${requestID}] (302 Redirect) Handled GET ${request.path} redirect to ${matchingPath}${requestTime}`,
                );
            }

            response
                .status(302)
                .redirect(matchingPath);

            runAfterServe(server, requestID,
                preserveAfterServe,
                request,
                response,
            );

            return;
        }


        // HANDLE STILLS — serve a pre-generated static still (if one exists for this route) instead of
        // rendering on the fly. Stills are produced by `PluridStillsGenerator` and loaded by StillsManager.
        const stillRoute = stillPath(matchingPath);
        const still = stillRoute === undefined ? undefined : server.stills.get(stillRoute);

        if (
            still
        ) {
            if (debugAllows(server.options, 'info')) {
                const requestTime = computeRequestTime(request);

                console.info(
                    `[${time.stamp()} :: ${requestID}] (200 OK) Still Handled GET ${matchingPath}${requestTime}`,
                );
            }

            response.send(still);

            runAfterServe(server, requestID,
                preserveAfterServe,
                request,
                response,
            );

            return;
        }


        const isoMatch = server.isoMatcher.match(
            matchingPath,
            'route',
        );
        // console.log('Route isoMatch', matchingPath, isoMatch);

        if (
            !isoMatch
        ) {
            const notFoundStill = server.stills.get(NOT_FOUND_ROUTE);
            if (notFoundStill) {
                if (debugAllows(server.options, 'info')) {
                    const requestTime = computeRequestTime(request);

                    console.info(
                        `[${time.stamp()} :: ${requestID}] (404 Not Found) Handled GET ${matchingPath}${requestTime}`,
                    );
                }

                response
                    .status(404)
                    .send(notFoundStill);

                runAfterServe(server, requestID,
                    preserveAfterServe,
                    request,
                    response,
                );

                return;
            }

            const isoMatchNotFound = server.isoMatcher.match(
                NOT_FOUND_ROUTE,
                'route',
            );
            if (!isoMatchNotFound) {
                if (debugAllows(server.options, 'info')) {
                    const requestTime = computeRequestTime(request);

                    console.info(
                        `[${time.stamp()} :: ${requestID}] (404 Not Found) Handled GET ${matchingPath}${requestTime}`,
                    );
                }

                response
                    .status(404)
                    .send(server.template?.notFoundHtml || NOT_FOUND_TEMPLATE);

                runAfterServe(server, requestID,
                    preserveAfterServe,
                    request,
                    response,
                );

                return;
            }


            const renderer = await renderApplication(server, 
                isoMatchNotFound,
                preserveResult,
                request,
            );

            if (debugAllows(server.options, 'info')) {
                const requestTime = computeRequestTime(request);

                console.info(
                    `[${time.stamp()} :: ${requestID}] (404 Not Found) Handled GET ${matchingPath}${requestTime}`,
                );
            }

            response
                .status(404)
                .send(await renderer.html());

            runAfterServe(server, requestID,
                preserveAfterServe,
                request,
                response,
            );

            return;
        }


        const renderer = await renderApplication(server, 
            isoMatch,
            preserveResult,
            request,
        );

        if (debugAllows(server.options, 'info')) {
            const requestTime = computeRequestTime(request);

            console.info(
                `[${time.stamp()} :: ${requestID}] (200 OK) Handled GET ${matchingPath}${requestTime}`,
            );
        }

        response.send(await renderer.html());

        // Post-response work: observed, never a second response, never an unhandled rejection (C09).
        runAfterServe(server, requestID,
            preserveAfterServe,
            request,
            response,
        );

        return;
    } catch (error) {
        if (debugAllows(server.options, 'error')) {
            const requestTime = computeRequestTime(request);

            console.error(
                `[${time.stamp()} :: ${requestID}] (500 Server Error) Could not handle GET ${request.path}${requestTime}`,
                error,
            );
        }

        // the response went out before the failure: there is no error page to send, and trying threw
        // again, from the catch, where nothing caught it (2026-09-29)
        if (response.headersSent) {
            if (!response.writableEnded) {
                response.end();
            }
            return;
        }

        response
            .status(500)
            .send(server.template?.errorHtml || SERVER_ERROR_TEMPLATE);

        return;
    }
};


/**
 * The host a request renders its planes on. A configured `hostname` is the site's own; without one
 * the engine's default is the host serving the application (`location.host` in the browser), which
 * on the server is the request's. Rendering the literal `origin` wrote a host no browser has into
 * every route, and the page failed to hydrate (2026-09-29).
 */
export const renderHostname = (
    configured: string,
    request?: express.Request,
) => (
    configured === DEFAULT_SERVER_OPTIONS_HOSTNAME
        ? request?.headers?.host || configured
        : configured
);


/** Query parameters no page is rendered by: campaign and click identifiers. */
const TRACKING_PARAMETER = /^(?:utm_[a-z0-9_]+|gclid|gbraid|wbraid|dclid|fbclid|msclkid|mc_cid|mc_eid|_ga|_gl)$/i;

/**
 * The route a still answers this request with, or `undefined` for a live render. A still is the
 * route's rendering without a query: it answers a request whose query holds only tracking parameters
 * (`/?utm_source=x`), and any other query renders live, since a page may read it (a head from the query,
 * a search). Looked up with the query, `/?utm=x` rendered live (2026-10-20); without it, `/?lang=fr` got
 * the still rendered for `/` (2026-10-22).
 */
const stillPath = (
    url: string,
): string | undefined => {
    const hash = url.indexOf('#');
    const withoutHash = hash === -1 ? url : url.slice(0, hash);
    const mark = withoutHash.indexOf('?');
    if (mark === -1) {
        return withoutHash;
    }
    for (const key of new URLSearchParams(withoutHash.slice(mark + 1)).keys()) {
        if (!TRACKING_PARAMETER.test(key)) {
            return undefined;
        }
    }
    return withoutHash.slice(0, mark);
};


/** Servers already told that two services' stores are not written into the page. */
const warnedStores = new WeakSet<object>();

/**
 * THE PAGE CARRIES THE REQUEST'S STORE (2026-10-21): the state the render left in the request's own
 * store, when one service has one, is the page's `__PRELOADED_REDUX_STATE__`, which the kit's client
 * builds its store from; it was empty unless a preserve serialized it. A static `properties.store`
 * is every request's and is not written; two stores have no one global to share. A preserve's own
 * global wins, and its `globals` are never written into: the page's are a new object.
 */
const pageGlobals = (
    server: PluridServerContext,
    stores: unknown[],
    globals: Record<string, string> | undefined,
): Record<string, string> | undefined => {
    const owned = server.services
        .map((service, index) => [service.name, stores[index]] as const)
        .filter(([, store]) => store !== undefined);
    if (owned.length === 0 || (globals && Object.hasOwn(globals, PRELOADED_REDUX_STATE_KEY))) {
        return globals;
    }
    if (owned.length > 1) {
        if (!warnedStores.has(server) && debugAllows(server.options, 'warn')) {
            warnedStores.add(server);
            console.warn(
                `[${server.options.serverName}] ${owned.map(([name]) => name).join(', ')} each have a store per request; the page carries one state (${PRELOADED_REDUX_STATE_KEY}): a preserve sets it.`,
            );
        }
        return globals;
    }

    const [[name, store]] = owned;
    let source: string | undefined;
    try {
        source = JSON.stringify((store as { getState?: () => unknown } | undefined)?.getState?.());
    } catch (error) {
        throw new Error(
            `[${server.options.serverName}] the state of the ${name} store cannot be written into the page: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
    return source === undefined
        ? globals
        : { ...globals, [PRELOADED_REDUX_STATE_KEY]: source };
};


/**
 * One request's render: the metastate, a per-request document registry (the route's head before
 * the render, the planes' heads and the in-render declarations during it), the React tree through
 * styled-components, the stray-hoistable guard, the document assembled with the preserve's layer
 * and the `document` hook, serialized into the template.
 */
export const renderApplication = async (
    server: PluridServerContext,
    isoMatch: IsoMatcherRouteResult<PluridReactComponent>,
    preserveResult: PluridPreserveResponse | undefined,
    request?: express.Request,
) => {
    const globals = preserveResult?.globals;

    const requestURL = request?.originalUrl || request?.url || '';
    const search = requestURL.includes('?') ? requestURL.slice(requestURL.indexOf('?')) : '';
    const hostname = renderHostname(server.options.hostname, request);
    // THE METASTATE IS A MARKER (2026-09-29). Its presence tells the space and the router that the
    // page was server-rendered (`PluridProvider metastate`); nothing reads its contents — each
    // application computes its own state, in the browser as here — so the full state it carried,
    // computed on every request and written into every page (8 KB for a two-page site, 13 % of the
    // HTML), was cost with no reader. A document hook still receives the computed metastate: it is
    // computed for the hook, and only when there is one.
    const pluridMetastate: PluridMetastate = {
        states: {},
    };

    // The document head, as data: the route's head is known BEFORE the render, the in-render
    // declarations are collected DURING it (per request — nothing is shared across requests),
    // the preserve and the hook layer above; one merge, one serializer.
    const documentRegistry = createDocumentRegistry({ server: true });
    documentRegistry.setBase('route', await resolveRouteDocument(isoMatch));

    // EACH REQUEST ITS OWN STORE (2026-10-21): a service's factory is called for every request (the kit
    // built one store at startup, which every request rendered into); a preserve's store wins
    const providers = preserveResult?.providers as Record<string, { store?: unknown }> | undefined;
    const stores = server.services.map((service) => {
        const preserved = providers && Object.hasOwn(providers, service.name)
            ? providers[service.name]?.store
            : undefined;
        return preserved ?? service.store?.();
    });

    const tree = buildRequestTree({
        services: server.services,
        stores,
        exterior: server.exterior,
        shell: server.shell,
        routerProperties: server.routerProperties,
        routes: server.routes,
        planes: server.planes,
        pluridMetastate,
        preserveResult,
        documentRegistry,
        pathname: isoMatch.match.value,
        search,
        hostname,
        directPlane: isoMatch.kind === 'RoutePlane'
            ? isoMatch.match.value
            : undefined,
    });
    const rendered = await renderContent(tree, {
        mode: server.renderMode,
    });
    // the route resolvers in the hook's metastate keep reading the preserve's own globals
    const injectedGlobals = pageGlobals(server, stores, globals);

    // React 19 emits a hoistable rendered anywhere in the tree (a raw `<title>` in a plane) as
    // a prefix of a fragment render: move it into the head rather than leave it in the body.
    const {
        head: strayHead,
        content,
    } = general.document.splitHoistablePrefix(rendered.content);
    if (strayHead && debugAllows(server.options, 'warn')) {
        console.warn(
            `[${server.options.serverName}] a plane rendered head elements directly (${strayHead.slice(0, 80)}…); declare them through the document model (<PluridDocument> / planes[].head) instead.`,
        );
    }

    const soFar = assembleDocument({
        template: server.templateDocument,
        registry: documentRegistry,
        preserve: preserveResult?.document,
    });
    const hooked = server.documentHook && request
        ? await server.documentHook({
            request,
            match: isoMatch,
            metastate: await serverComputeMetastate(
                isoMatch,
                server.routes,
                globals,
                hostname,
                {
                    pathname: isoMatch.match.value,
                    search,
                },
            ),
            document: soFar,
            preserve: preserveResult,
        })
        : undefined;
    const document = hooked
        ? general.document.mergeDocuments(soFar, hooked)
        : soFar;

    const {
        serializeDocumentHead,
        serializeBodyScripts,
        serializeAttributes,
    } = general.document;

    const stringedStyles = server.styles.reduce(
        (accumulator, style) => accumulator + style,
        '',
    );
    const preserveStyles = preserveResult?.template?.styles?.join(' ') || '';
    const mergedStyles = rendered.styles
        + stringedStyles
        + preserveStyles;

    const head = serializeDocumentHead(document)
        + (strayHead ? '\n' + strayHead : '');

    const htmlAttributes: Record<string, string> = { ...document.htmlAttributes };
    if (document.dir) {
        htmlAttributes.dir = document.dir;
    }
    const mergedHtmlAttributes = serializeAttributes(htmlAttributes).trim()
        + (preserveResult?.template?.htmlAttributes
            ? ' ' + preserveResult.template.htmlAttributes
            : '');
    const mergedBodyAttributes = serializeAttributes(document.bodyAttributes).trim()
        + (preserveResult?.template?.bodyAttributes
            ? ' ' + preserveResult.template.bodyAttributes
            : '');

    const mergedHeadScripts = [
        ...(server.template?.headScripts || []),
        ...(preserveResult?.template?.headScripts || []),
    ];
    const mergedBodyScripts = [
        ...serializeBodyScripts(document),
        ...(server.template?.bodyScripts || []),
        ...(preserveResult?.template?.bodyScripts || []),
    ];

    const renderer = new PluridRenderer({
        htmlLanguage: preserveResult?.template?.htmlLanguage
            || document.lang
            || server.template?.htmlLanguage,
        head,
        htmlAttributes: mergedHtmlAttributes,
        bodyAttributes: mergedBodyAttributes,
        defaultStyle: server.template?.defaultStyle,
        styles: mergedStyles,
        headScripts: mergedHeadScripts,
        bodyScripts: mergedBodyScripts,
        vendorScriptSource: server.template?.vendorScriptSource,
        mainScriptSource: server.template?.mainScriptSource,
        root: server.template?.root,
        content,
        defaultPreloadedPluridMetastate: server.template?.defaultPreloadedPluridMetastate,
        pluridMetastate: JSON.stringify(pluridMetastate),
        globals: injectedGlobals,
        minify: server.template?.minify,
    });

    return renderer;
};
// #endregion module
