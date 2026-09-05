// #region imports
    // #region libraries
    import express from 'express';

    import {
        time,
        uuid,
    } from '@plurid/plurid-functions';

    import {
        PluridPreserveResponse,
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
    } from '~data/constants';

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
 * THE REQUEST WALK: ignore list → preserve → redirect → still → route match (the 404 ladder) →
 * render → send. Any throw — a render failure included — is a 500 with the error page.
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
                    `[${time.stamp()} :: ${requestID}] (204 No Content) Ignored GET ${request.path}${requestTime}`,
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

        if (
            preserveResponded
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

            resolvePreserveAfterServe(server, 
                preserveAfterServe,
                request,
                response,
            );

            return;
        }


        // HANDLE STILLS — serve a pre-generated static still (if one exists for this route) instead of
        // rendering on the fly. Stills are produced by `PluridStillsGenerator` and loaded by StillsManager.
        const still = server.stills.get(matchingPath);

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

            resolvePreserveAfterServe(server, 
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

                resolvePreserveAfterServe(server, 
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
                    .send(NOT_FOUND_TEMPLATE);

                resolvePreserveAfterServe(server, 
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

            resolvePreserveAfterServe(server, 
                preserveAfterServe,
                request,
                response,
            );

            response
                .status(404)
                .end();

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

        resolvePreserveAfterServe(server, 
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

        response
            .status(500)
            .send(server.template?.errorHtml || SERVER_ERROR_TEMPLATE);

        return;
    }
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

    const pluridMetastate = await serverComputeMetastate(
        isoMatch,
        server.routes,
        globals,
        server.options.hostname,
    );

    // The document head, as data: the route's head is known BEFORE the render, the in-render
    // declarations are collected DURING it (per request — nothing is shared across requests),
    // the preserve and the hook layer above; one merge, one serializer.
    const documentRegistry = createDocumentRegistry({ server: true });
    documentRegistry.setBase('route', await resolveRouteDocument(isoMatch));

    const tree = buildRequestTree({
        services: server.services,
        exterior: server.exterior,
        shell: server.shell,
        routerProperties: server.routerProperties,
        routes: server.routes,
        planes: server.planes,
        pluridMetastate,
        preserveResult,
        documentRegistry,
        pathname: isoMatch.match.value,
        hostname: server.options.hostname,
        directPlane: isoMatch.kind === 'RoutePlane'
            ? isoMatch.match.value
            : undefined,
    });
    const rendered = await renderContent(tree, {
        mode: server.renderMode,
    });

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
            metastate: pluridMetastate,
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
        globals,
        minify: server.template?.minify,
    });

    return renderer;
};
// #endregion module
