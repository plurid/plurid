// #region imports
    // #region libraries
    import express from 'express';

    import {
        time,
        uuid,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        ServerRequest,
    } from '~data/interfaces';

    import {
        SERVER_ERROR_TEMPLATE,
    } from '~data/templates';

    import {
        resolveElementFromPlaneMatch,
    } from '~utilities/pttp';
    // #endregion external


    // #region internal
    import {
        PluridServerContext,
    } from './context';
    import {
        debugAllows,
        computeRequestTime,
    } from './options';
    // #endregion internal
// #endregion imports



// #region module
/**
 * CORS for the origins the server allows (`pttpOrigins`), and `Vary: Origin` for every answer: it
 * reflected any origin, with credentials allowed (2026-10-20).
 */
export const allowPTTPOrigin = (
    server: Pick<PluridServerContext, 'pttpOrigins'>,
    request: express.Request,
    response: express.Response,
) => {
    response.vary('Origin');
    const origin = request.headers.origin;
    if (origin && server.pttpOrigins.includes(origin)) {
        response.setHeader('Access-Control-Allow-Origin', origin);
        response.setHeader('Access-Control-Allow-Credentials', 'true');
    }
};


/** `POST /pttp`: resolve a plane path to its element payload (a custom `pttpHandler` may take over). */
export const handlePTTPRequest = async (
    server: PluridServerContext,
    request: express.Request,
    response: express.Response,
) => {
    const requestID = (request as ServerRequest).requestID || uuid.generate();

    try {
        if (debugAllows(server.options, 'info')) {
            console.info(
                `[${time.stamp()} :: ${requestID}] (000 Start) Handling POST ${request.path}`,
            );
        }


        allowPTTPOrigin(server, request, response);


        const data = request.body;
        if (!data || !data.path) {
            if (debugAllows(server.options, 'warn')) {
                const requestTime = computeRequestTime(request);

                console.info(
                    `[${time.stamp()} :: ${requestID}] (400 Bad Request) Could not handle POST ${request.path}${requestTime}`,
                );
            }

            response
                .status(400)
                .end();
            return;
        }


        if (server.pttpHandler) {
            const pttpHandled = await server.pttpHandler(
                data.path,
                request,
                response,
            );

            if (pttpHandled) {
                if (debugAllows(server.options, 'info')) {
                    const requestTime = computeRequestTime(request);

                    console.info(
                        `[${time.stamp()} :: ${requestID}] (200 OK) Handled POST ${request.path}${requestTime} in custom handler`,
                    );
                }

                // claimed and not answered: answered, so the request is never left open
                if (!response.headersSent) {
                    console.warn(`[${time.stamp()} :: ${requestID}] Plurid Server: the pttpHandler claimed POST ${request.path} without answering it.`);
                    response.status(500).end();
                }
                return;
            }
        }


        const planeMatch = server.isoMatcher.match(
            data.path,
        );
        if (!planeMatch) {
            if (debugAllows(server.options, 'warn')) {
                const requestTime = computeRequestTime(request);

                console.info(
                    `[${time.stamp()} :: ${requestID}] (400 Bad Request) Could not handle POST ${request.path}${requestTime}`,
                );
            }

            response
                .status(400)
                .end();
            return;
        }


        const elementMatch = resolveElementFromPlaneMatch(
            planeMatch,
            server.elementqlEndpoint,
        );
        if (!elementMatch) {
            if (debugAllows(server.options, 'warn')) {
                const requestTime = computeRequestTime(request);

                console.info(
                    `[${time.stamp()} :: ${requestID}] (404 Not Found) Could not handle POST ${request.path}${requestTime}`,
                );
            }

            response
                .status(404)
                .end();
            return;
        }


        const elementURL = elementMatch.url;
        if (!elementURL) {
            if (debugAllows(server.options, 'warn')) {
                const requestTime = computeRequestTime(request);

                console.info(
                    `[${time.stamp()} :: ${requestID}] (400 Bad Request) Could not handle POST ${request.path}${requestTime}`,
                );
            }

            response
                .status(400)
                .end();
            return;
        }


        if (debugAllows(server.options, 'info')) {
            const requestTime = computeRequestTime(request);

            console.info(
                `[${time.stamp()} :: ${requestID}] (200 OK) Handled POST ${request.path}${requestTime}`,
            );
        }

        const elementName = elementMatch.name;
        // reserved: the planes the match links to are not gathered, so it is always empty
        const linksTo: any[] = [];

        const element = {
            url: elementURL,
            name: elementName,
            json: {
                elements: [
                    {
                        name: elementName,
                    },
                ],
            },
            linksTo,
        };

        response.json({
            element,
        });
    } catch (error) {
        if (debugAllows(server.options, 'error')) {
            const requestTime = computeRequestTime(request);

            console.error(
                `[${time.stamp()} :: ${requestID}] (500 Server Error) Could not handle POST ${request.path}${requestTime}`,
                error,
            );
        }

        // an answer already on its way cannot become an error page (the send would throw from here)
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
// #endregion module
