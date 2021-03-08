// #region imports
    // #region libraries
    import {
        Server,
    } from 'http';

    import express, {
        Express,
    } from 'express';

    import {
        raw as bodyParserRaw,
        json as bodyParserJSON,
    } from 'body-parser';

    import Deon, {
        DEON_MEDIA_TYPE,
    } from '@plurid/deon';

    import {
        time,
        uuid,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        environment,

        DEFAULT_SERVER_PORT,
        DEFAULT_SERVER_OPTIONS,

        ENDPOINT_ROUTE,
        ENDPOINT_REGISTER,
    } from '../../data/constants';

    import {
        ServerRequest,
        ServerRequestRouteBody,
        ServerRequestRegisterBody,

        DebugLevels,

        PluridRoutesServerOptions,
        PluridRoutesServerPartialOptions,
        PluridRoutesServerConfiguration,

        QueryRoute,
        RegisterRoute,
        VerifyToken,

        RouteElement,
        RouteElementRegistered,
        RouteElementElementQL,
    } from '../../data/interfaces';

    import Cacher from '../Cacher';
    // #endregion external
// #endregion imports



// #region module
class PluridRoutesServer {
    private options: PluridRoutesServerOptions;
    private serverApplication: Express;
    private server: Server | undefined;
    private port: number | string;

    private queryRoute: QueryRoute;
    private registerRoute: RegisterRoute;
    private verifyToken: VerifyToken;

    private cacher: Cacher;


    constructor(
        configuration: PluridRoutesServerConfiguration,
    ) {
        this.options = this.handleOptions(configuration?.options);

        this.serverApplication = express();
        this.port = DEFAULT_SERVER_PORT;

        this.queryRoute = configuration.queryRoute;
        this.registerRoute = configuration.registerRoute;
        this.verifyToken = configuration.verifyToken;

        this.cacher = new Cacher();

        this.configureServer();

        this.handleEndpoints();

        process.addListener('SIGINT', () => {
            this.stop();
            process.exit(0);
        });
    }


    public start(
        port = this.port,
    ) {
        this.port = port;

        const serverlink = `http://localhost:${port}`;

        if (this.debugAllows('info')) {
            console.info(
                `\n\t[${time.stamp()}] ${this.options.serverName} Started on Port ${port}: ${serverlink}\n`,
            );
        }

        this.server = this.serverApplication.listen(port);

        return this.server;
    }

    public stop() {
        if (this.server) {
            if (this.debugAllows('info')) {
                console.info(
                    `\n\t[${time.stamp()}] ${this.options.serverName} Stopped on Port ${this.port}\n`,
                );
            }

            this.server.close();
        } else {
            if (this.debugAllows('info')) {
                console.info(
                    `\n\t[${time.stamp()}] ${this.options.serverName} Could not be Stopped on Port ${this.port}\n`,
                );
            }
        }
    }

    public handle() {
        return {
            post: (
                path: string,
                ...handlers: express.RequestHandler[]
            ) => {
                this.serverApplication.post(path, ...handlers);

                return this.serverApplication;
            },
            patch: (
                path: string,
                ...handlers: express.RequestHandler[]
            ) => {
                this.serverApplication.patch(path, ...handlers);

                return this.serverApplication;
            },
            put: (
                path: string,
                ...handlers: express.RequestHandler[]
            ) => {
                this.serverApplication.put(path, ...handlers);

                return this.serverApplication;
            },
            delete: (
                path: string,
                ...handlers: express.RequestHandler[]
            ) => {
                this.serverApplication.delete(path, ...handlers);

                return this.serverApplication;
            },
        };
    }

    public instance() {
        return this.serverApplication;
    }

    public cacheLoad(
        routes: Map<string, RouteElement>,
    ) {
        this.cacher.load(routes);
    }

    public cacheReset() {
        this.cacher.reset();
    }


    private handleEndpoints() {
        this.serverApplication.post(ENDPOINT_ROUTE, (request, response) => {
            this.handleEndpointRoute(request, response);
        });

        this.serverApplication.post(ENDPOINT_REGISTER, (request, response) => {
            this.handleEndpointRegister(request, response);
        });
    }

    private async handleEndpointRoute(
        request: express.Request,
        response: express.Response,
    ) {
        const requestID = (request as ServerRequest).requestID || uuid.generate();

        try {
            if (this.debugAllows('info')) {
                console.info(
                    `[${time.stamp()} :: ${requestID}] (000 Start) Handling POST ${request.path}`,
                );
            }


            if (
                !request.body.token
            ) {
                if (this.debugAllows('warn')) {
                    const requestTime = this.computeRequestTime(request);

                    console.warn(
                        `[${time.stamp()} :: ${requestID}] (401 Unauthorized) Could not handle POST ${request.path}${requestTime}`,
                    );
                }

                response
                    .status(401)
                    .send('Unauthorized');
                return;
            }


            if (
                !request.body.route
            ) {
                if (this.debugAllows('warn')) {
                    const requestTime = this.computeRequestTime(request);

                    console.warn(
                        `[${time.stamp()} :: ${requestID}] (400 Bad Request) Could not handle POST ${request.path}${requestTime}`,
                    );
                }

                response
                    .status(400)
                    .send('Bad Request');
                return;
            }


            const {
                token,
                route,
            } = request.body as ServerRequestRouteBody;


            const verifiedToken = await this.verifyToken(token);

            if (
                !verifiedToken
            ) {
                if (this.debugAllows('warn')) {
                    const requestTime = this.computeRequestTime(request);

                    console.warn(
                        `[${time.stamp()} :: ${requestID}] (403 Forbidden) Could not handle POST ${request.path}${requestTime}`,
                    );
                }

                response
                    .status(403)
                    .send('Forbidden');
                return;
            }


            let data = this.cacher.get(
                route,
            );
            const cacheRetrieval = !!data;

            if (!data) {
                data = await this.queryRoute(
                    route,
                );
            }

            if (data && cacheRetrieval) {
                if (this.debugAllows('info')) {
                    const requestTime = this.computeRequestTime(request);

                    console.info(
                        `[${time.stamp()} :: ${requestID}] Retrieved from cache POST ${request.path}${requestTime}`,
                    );
                }
            }


            if (
                !data
            ) {
                if (this.debugAllows('warn')) {
                    const requestTime = this.computeRequestTime(request);

                    console.warn(
                        `[${time.stamp()} :: ${requestID}] (404 Not Found) Could not handle POST ${request.path}${requestTime}`,
                    );
                }

                response
                    .status(404)
                    .send('Not Found');
                return;
            }


            if (
                !(data as RouteElementRegistered).id
                && !(data as RouteElementElementQL).elementql
            ) {
                if (this.debugAllows('warn')) {
                    const requestTime = this.computeRequestTime(request);

                    console.warn(
                        `[${time.stamp()} :: ${requestID}] (400 Bad Request) Could not handle POST ${request.path}${requestTime}`,
                    );
                }

                response
                    .status(400)
                    .send('Bad Request');
                return;
            }


            if (!cacheRetrieval) {
                this.cacher.set(
                    route,
                    data,
                );
            }


            const contentType = request.header('Content-Type');

            const responseData = {
                ...data,
            };


            if (
                contentType !== DEON_MEDIA_TYPE
            ) {
                if (this.debugAllows('info')) {
                    const requestTime = this.computeRequestTime(request);

                    console.info(
                        `[${time.stamp()} :: ${requestID}] (200 OK) Handled POST ${request.path}${requestTime}`,
                    );
                }

                response.json(responseData);
                return;
            }


            const deon = new Deon();
            const responseDeon = deon.stringify(responseData);

            response.setHeader(
                'Content-Type',
                DEON_MEDIA_TYPE,
            );

            if (this.debugAllows('info')) {
                const requestTime = this.computeRequestTime(request);

                console.info(
                    `[${time.stamp()} :: ${requestID}] (200 OK) Handled POST ${request.path}${requestTime}`,
                );
            }

            response.send(responseDeon);

            return;
        } catch (error) {
            if (this.debugAllows('error')) {
                const requestTime = this.computeRequestTime(request);

                console.error(
                    `[${time.stamp()} :: ${requestID}] (500 Server Error) Could not handle POST ${request.path}${requestTime}`,
                    error,
                );
            }

            response
                .status(500)
                .send('Server Error');
            return;
        }
    }

    private async handleEndpointRegister(
        request: express.Request,
        response: express.Response,
    ) {
        const requestID = (request as ServerRequest).requestID || uuid.generate();

        try {
            if (this.debugAllows('info')) {
                console.info(
                    `[${time.stamp()} :: ${requestID}] (000 Start) Handling POST ${request.path}`,
                );
            }


            if (
                !request.body.token
            ) {
                if (this.debugAllows('warn')) {
                    const requestTime = this.computeRequestTime(request);

                    console.warn(
                        `[${time.stamp()} :: ${requestID}] (401 Unauthorized) Could not handle POST ${request.path}${requestTime}`,
                    );
                }

                response
                    .status(401)
                    .send('Unauthorized');
                return;
            }


            if (
                !request.body.route
                || !request.body.data
            ) {
                if (this.debugAllows('warn')) {
                    const requestTime = this.computeRequestTime(request);

                    console.warn(
                        `[${time.stamp()} :: ${requestID}] (400 Bad Request) Could not handle POST ${request.path}${requestTime}`,
                    );
                }

                response
                    .status(400)
                    .send('Bad Request');
                return;
            }


            const {
                token,
                route,
                data,
            } = request.body as ServerRequestRegisterBody;


            const verifiedToken = await this.verifyToken(token);

            if (
                !verifiedToken
            ) {
                if (this.debugAllows('warn')) {
                    const requestTime = this.computeRequestTime(request);

                    console.warn(
                        `[${time.stamp()} :: ${requestID}] (403 Forbidden) Could not handle POST ${request.path}${requestTime}`,
                    );
                }

                response
                    .status(403)
                    .send('Forbidden');
                return;
            }


            const registered = await this.registerRoute(
                route,
                data,
            );

            if (
                typeof registered !== 'boolean'
            ) {
                if (this.debugAllows('warn')) {
                    const requestTime = this.computeRequestTime(request);

                    console.warn(
                        `[${time.stamp()} :: ${requestID}] (400 Bad Request) Could not handle POST ${request.path}${requestTime}`,
                    );
                }

                response
                    .status(400)
                    .send('Bad Request');
                return;
            }


            if (
                !(data as RouteElementRegistered).id
                && !(data as RouteElementElementQL).elementql
            ) {
                if (this.debugAllows('warn')) {
                    const requestTime = this.computeRequestTime(request);

                    console.warn(
                        `[${time.stamp()} :: ${requestID}] (400 Bad Request) Could not handle POST ${request.path}${requestTime}`,
                    );
                }

                response
                    .status(400)
                    .send('Bad Request');
                return;
            }


            this.cacher.set(
                route,
                data,
            );


            const contentType = request.header('Content-Type');

            const responseData = {
                registered,
            };


            if (
                contentType !== DEON_MEDIA_TYPE
            ) {
                if (this.debugAllows('info')) {
                    const requestTime = this.computeRequestTime(request);

                    console.info(
                        `[${time.stamp()} :: ${requestID}] (200 OK) Handled POST ${request.path}${requestTime}`,
                    );
                }

                response.json(responseData);
                return;
            }


            const deon = new Deon();
            const responseDeon = deon.stringify(responseData);

            response.setHeader(
                'Content-Type',
                DEON_MEDIA_TYPE,
            );

            if (this.debugAllows('info')) {
                const requestTime = this.computeRequestTime(request);

                console.info(
                    `[${time.stamp()} :: ${requestID}] (200 OK) Handled POST ${request.path}${requestTime}`,
                );
            }

            response.send(responseDeon);

            return;
        } catch (error) {
            if (this.debugAllows('error')) {
                const requestTime = this.computeRequestTime(request);

                console.error(
                    `[${time.stamp()} :: ${requestID}] (500 Server Error) Could not handle POST ${request.path}${requestTime}`,
                    error,
                );
            }

            response
                .status(500)
                .send('Server Error');
            return;
        }
    }

    private handleOptions(
        partialOptions?: PluridRoutesServerPartialOptions,
    ) {
        const options: PluridRoutesServerOptions = {
            serverName: partialOptions?.serverName || DEFAULT_SERVER_OPTIONS.SERVER_NAME,
            quiet: partialOptions?.quiet || DEFAULT_SERVER_OPTIONS.QUIET,
            debug: partialOptions?.debug
                ? partialOptions?.debug
                : environment.production ? 'error' : 'info',
        };
        return options;
    }

    private configureServer() {
        this.serverApplication.disable('x-powered-by');

        this.serverApplication.use(
            (request, _, next) => {
                const requestID = uuid.generate();
                (request as ServerRequest).requestID = requestID;

                const requestTime = Date.now();
                (request as ServerRequest).requestTime = requestTime;

                next();
            }
        );

        this.serverApplication.use(
            bodyParserJSON(),
        );

        this.serverApplication.use(
            bodyParserRaw({
                type: DEON_MEDIA_TYPE,
            }),
        );

        this.serverApplication.use(
            async (request, _, next) => {
                try {
                    const contentType = request.header('Content-Type');

                    if (contentType !== DEON_MEDIA_TYPE) {
                        next();
                        return;
                    }

                    const body = request.body.toString();
                    const deon = new Deon();
                    const data = await deon.parse(body);
                    request.body = data;

                    next();
                } catch (error) {
                    const requestID = (request as ServerRequest).requestID || '';
                    const requestIDLog = requestID
                        ? ` :: ${requestID}`
                        : '';

                    if (this.debugAllows('error')) {
                        console.error(
                            `[${time.stamp()}${requestIDLog}] Could not handle deon middleware ${request.path}`,
                            error,
                        );
                    }

                    next();
                }
            },
        );

        this.serverApplication.use(
            async (request, _, next) => {
                try {
                    const contentType = request.header('Content-Type');

                    if (
                        contentType !== DEON_MEDIA_TYPE
                        && contentType !== 'application/json'
                    ) {
                        next();
                        return;
                    }

                    const authorization = request.header('Authorization');

                    if (!authorization) {
                        next();
                        return;
                    }

                    const token = authorization.replace('Bearer ', '');

                    if (!token) {
                        next();
                        return;
                    }

                    if (!request.body.token) {
                        request.body.token = token;
                    }

                    next();
                } catch (error) {
                    const requestID = (request as ServerRequest).requestID || '';
                    const requestIDLog = requestID
                        ? ` :: ${requestID}`
                        : '';

                    if (this.debugAllows('error')) {
                        console.error(
                            `[${time.stamp()}${requestIDLog}] Could not handle token middleware ${request.path}`,
                            error,
                        );
                    }

                    next();
                }
            }
        )
    }

    private debugAllows(
        level: DebugLevels,
    ) {
        if (this.options.quiet) {
            return false;
        }

        if (this.options.debug === 'none') {
            return false;
        }

        switch (level) {
            case 'error':
                return true;
            case 'warn':
                if (
                    this.options.debug === 'error'
                ) {
                    return false;
                }
                return true;
            case 'info':
                if (
                    this.options.debug === 'error'
                    || this.options.debug === 'warn'
                ) {
                    return false;
                }

                return true;
            default:
                return false;
        }
    }

    private computeRequestTime(
        request: express.Request,
    ) {
        const requestTime = (request as ServerRequest).requestTime;

        if (!requestTime) {
            return '';
        }

        const now = Date.now();
        const difference = now - requestTime;

        return ` in ${difference} ms`;
    }
}
// #endregion module



// #region exports
export default PluridRoutesServer;
// #endregion exports
