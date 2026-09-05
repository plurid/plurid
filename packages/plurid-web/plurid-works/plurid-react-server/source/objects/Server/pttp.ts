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


        response.setHeader('Access-Control-Allow-Origin', request.headers.origin || '');
        response.setHeader('Access-Control-Allow-Credentials', 'true');


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
            );

            if (pttpHandled) {
                if (debugAllows(server.options, 'info')) {
                    const requestTime = computeRequestTime(request);

                    console.info(
                        `[${time.stamp()} :: ${requestID}] (200 OK) Handled POST ${request.path}${requestTime} in custom handler`,
                    );
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
        // given the plane match, gather the planes to which it links
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

        response
            .status(500)
            .send(server.template?.errorHtml || SERVER_ERROR_TEMPLATE);

        return;
    }
};
// #endregion module
