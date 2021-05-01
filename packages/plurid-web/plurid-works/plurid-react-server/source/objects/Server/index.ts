// #region imports
    // #region libraries
    import {
        Server,
    } from 'http';
    import fs from 'fs';
    import path from 'path';

    import express, {
        Express,
    } from 'express';

    import compression from 'compression';

    import open from 'open';

    import {
        ServerStyleSheet,
    } from 'styled-components';

    import {
        Helmet,
    } from 'react-helmet-async';

    import {
        time,
        uuid,
    } from '@plurid/plurid-functions';

    import {
        PluridRoute,
        PluridRoutePlane,
        PluridPreserve,
        PluridPreserveOnServe,
        PluridPreserveAfterServe,
        PluridPreserveOnError,
        PluridPreserveResponse,
        PluridPreserveTransmission,
    } from '@plurid/plurid-data';

    import {
        router,
    } from '@plurid/plurid-engine';

    import {
        serverComputeMetastate,

        getDirectPlaneMatch,

        PluridReactComponent,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import {
        ServerRequest,
        DebugLevels,

        PluridServerMiddleware,
        PluridServerService,
        PluridServerServicesData,
        PluridServerOptions,
        PluridServerPartialOptions,
        PluridServerConfiguration,
        PluridServerTemplateConfiguration,

        PTTPHandler,
    } from '~data/interfaces';

    import {
        environment,

        defaultStillerOptions,

        NOT_FOUND_ROUTE,
        DEFAULT_SERVER_PORT,
        DEFAULT_SERVER_OPTIONS,

        CATCH_ALL_PATH,
        PTTP_PATH,
    } from '~data/constants';

    import {
        NOT_FOUND_TEMPLATE,
        SERVER_ERROR_TEMPLATE,
    } from '~data/templates';

    import PluridRenderer from '../Renderer';
    import PluridContentGenerator from '../ContentGenerator';
    import PluridsResponder from '../PluridsResponder';
    import PluridStillsManager from '../StillsManager';
    // #endregion external
// #endregion imports



// #region module
const {
    default: PluridRouter,
    URLRouter: PluridURLRouter,
    IsoMatcher: PluridIsoMatcher,
} = router;


class PluridServer {
    private routes: PluridRoute<PluridReactComponent>[];
    private planes: PluridRoutePlane<PluridReactComponent>[];
    private preserves: PluridPreserve[];
    private helmet: Helmet;
    private styles: string[];
    private middleware: PluridServerMiddleware[];
    private exterior: PluridReactComponent | undefined;
    private shell: PluridReactComponent | undefined;
    private services: PluridServerService[];
    private servicesData: PluridServerServicesData | undefined;
    private options: PluridServerOptions;
    private template: PluridServerTemplateConfiguration | undefined;
    private usePTTP: boolean;
    private pttpHandler: PTTPHandler | undefined;

    private serverApplication: Express;
    private server: Server | undefined;
    private port: number | string;

    private urlRouter: router.URLRouter;
    private stills: PluridStillsManager;
    private router: router.default<PluridReactComponent>;
    private isoMatcher: router.IsoMatcher<PluridReactComponent>;
    private pluridsResponder: PluridsResponder;


    constructor(
        configuration: PluridServerConfiguration,
    ) {
        const {
            routes,
            planes,
            preserves,
            helmet,
            styles,
            middleware,
            exterior,
            shell,
            services,
            servicesData,
            options,
            template,
            usePTTP,
            pttpHandler,
        } = configuration;

        this.routes = routes;
        this.planes = planes || [];
        this.preserves = preserves;
        this.helmet = helmet;
        this.styles = styles || [];
        this.middleware = middleware || [];
        this.exterior = exterior;
        this.shell = shell;
        this.services = services || [];
        this.servicesData = servicesData;
        this.options = this.handleOptions(options);
        this.template = template;
        this.usePTTP = usePTTP ?? false;
        this.pttpHandler = pttpHandler;

        this.serverApplication = express();
        this.port = DEFAULT_SERVER_PORT;


        const urlRoutes = this.routes.map(route => {
            const {
                value,
                parameters,
            } = route;

            return {
                value,
                parameters,
            };
        });
        this.urlRouter = new PluridURLRouter(urlRoutes);

        this.stills = new PluridStillsManager(this.options);
        this.router = new PluridRouter(this.routes);
        this.pluridsResponder = new PluridsResponder();

        this.isoMatcher = new PluridIsoMatcher({
            routes: this.routes,
            routePlanes: this.planes,
        });


        this.configureServer();
        this.handleEndpoints();


        process.addListener('SIGINT', () => {
            this.stop();
            process.exit(0);
        });
    }

    static analysis(
        pluridServer: PluridServer,
    ) {
        return {
            routes: pluridServer.routes,
            options: pluridServer.options,
        };
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

        this.open(serverlink);

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


    private handleEndpoints() {
        this.serverApplication.get(
            CATCH_ALL_PATH,
            async (request, response, next) => {
                this.handleGetRequest(
                    request, response, next,
                );
            },
        );

        this.serverApplication.post(
            PTTP_PATH,
            async (request, response, next) => {
                this.handlePTTPRequest(
                    request, response, next,
                );
            },
        );
    }

    private async handleGetRequest(
        request: express.Request,
        response: express.Response,
        next: express.NextFunction,
    ) {
        const requestID = (request as ServerRequest).requestID || uuid.generate();

        try {
            if (this.debugAllows('info')) {
                console.info(
                    `[${time.stamp()} :: ${requestID}] (000 Start) Handling GET ${request.path}`,
                );
            }


            const path = request.path;


            const ignorable = this.ignoreGetRequest(
                path,
            );

            if (
                ignorable
            ) {
                if (this.debugAllows('info')) {
                    const requestTime = this.computeRequestTime(request);

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
            } = await this.resolvePreserve(
                request,
                response,
            );

            if (
                preserveResponded
            ) {
                if (this.debugAllows('info')) {
                    const requestTime = this.computeRequestTime(request);

                    console.info(
                        `[${time.stamp()} :: ${requestID}] (204 No Content) Preserve handled GET ${request.path}${requestTime}`,
                    );
                }

                return;
            }


            const {
                externalRedirect,
                matchingPath,
            } = this.resolveMatchingPath(
                preserveResult,
                path,
            );

            if (
                externalRedirect
            ) {
                if (this.debugAllows('info')) {
                    const requestTime = this.computeRequestTime(request);

                    console.info(
                        `[${time.stamp()} :: ${requestID}] (302 Redirect) Handled GET ${request.path} redirect to ${matchingPath}${requestTime}`,
                    );
                }

                response
                    .status(302)
                    .redirect(matchingPath);

                this.resolvePreserveAfterServe(
                    preserveAfterServe,
                    request,
                    response,
                );

                return;
            }


            // const gatewayResponse = await this.handleGateway(
            //     matchingPath,
            //     request,
            //     preserveResult,
            // );

            // if (
            //     gatewayResponse
            // ) {
            //     if (this.debugAllows('info')) {
            //         const requestTime = this.computeRequestTime(request);

            //         console.info(
            //             `[${time.stamp()} :: ${requestID}] (200 OK) Gateway handled GET ${matchingPath}${requestTime}`,
            //         );
            //     }

            //     response.send(gatewayResponse);

            //     this.resolvePreserveAfterServe(
            //         preserveAfterServe,
            //         request,
            //         response,
            //     );

            //     return;
            // }


            // // HANDLE PLURIDS
            // // check if the url is plurids
            // // http://example.com/plurids/<route>/<space>/<page>
            // // http://example.com/plurids/index/12345/54321
            // if (
            //     this.pluridsResponder.search(matchingPath)
            // ) {
            //     if (this.debugAllows('info')) {
            //         const requestTime = this.computeRequestTime(request);

            //         console.info(
            //             `[${time.stamp()} :: ${requestID}] (200 OK) Handled GET ${matchingPath}${requestTime}`,
            //         );
            //     }

            //     response.send(this.pluridsResponder);

            //     this.resolvePreserveAfterServe(
            //         preserveAfterServe,
            //         request,
            //         response,
            //     );

            //     return;
            // }


            // // HANDLE STILLS
            // const still = this.stills.get(matchingPath);

            // if (
            //     still
            // ) {
            //     if (this.debugAllows('info')) {
            //         const requestTime = this.computeRequestTime(request);

            //         console.info(
            //             `[${time.stamp()} :: ${requestID}] (200 OK) Still Handled GET ${matchingPath}${requestTime}`,
            //         );
            //     }

            //     response.send(still);

            //     this.resolvePreserveAfterServe(
            //         preserveAfterServe,
            //         request,
            //         response,
            //     );

            //     return;
            // }


            const isoMatch = this.isoMatcher.match(
                matchingPath,
                'route',
            );
            console.log('Route isoMatch', isoMatch);

            // const route = this.router.match(matchingPath);
            // console.log('Route matched', route);

            if (
                !isoMatch
            ) {
                // // Handle direct plane match.
                // const {
                //     matchRoute,
                //     matchPlane,
                //     matchPath,
                // }  = getDirectPlaneMatch(
                //     matchingPath,
                //     this.routes,
                //     this.planes,
                // );
                // console.log('getDirectPlaneMatch',
                //     matchRoute,
                //     matchPlane,
                //     matchPath,
                // );


                // if (
                //     matchRoute
                //     && matchPlane
                //     && matchPath
                // ) {
                //     // Render direct plane.
                //     const parsedRoute = new router.RouteParser(
                //         matchingPath,
                //         matchRoute,
                //     );
                //     const matchedPlaneRoute = parsedRoute.extract();

                //     const renderer = await this.renderApplication(
                //         // matchedPlaneRoute,
                //         isoMatch,
                //         preserveResult,
                //         matchPlane,
                //     );

                //     if (this.debugAllows('info')) {
                //         const requestTime = this.computeRequestTime(request);

                //         console.info(
                //             `[${time.stamp()} :: ${requestID}] (200 OK) Handled GET ${matchingPath}${requestTime}`,
                //         );
                //     }

                //     response.send(renderer.html());

                //     this.resolvePreserveAfterServe(
                //         preserveAfterServe,
                //         request,
                //         response,
                //     );

                //     return;
                // }


                // const notFoundStill = this.stills.get(NOT_FOUND_ROUTE);
                // if (notFoundStill) {
                //     if (this.debugAllows('info')) {
                //         const requestTime = this.computeRequestTime(request);

                //         console.info(
                //             `[${time.stamp()} :: ${requestID}] (404 Not Found) Handled GET ${matchingPath}${requestTime}`,
                //         );
                //     }

                //     response
                //         .status(404)
                //         .send(notFoundStill);

                //     this.resolvePreserveAfterServe(
                //         preserveAfterServe,
                //         request,
                //         response,
                //     );

                //     return;
                // }

                // const notFoundRoute = this.router.match(NOT_FOUND_ROUTE);
                // if (!notFoundRoute) {
                //     if (this.debugAllows('info')) {
                //         const requestTime = this.computeRequestTime(request);

                //         console.info(
                //             `[${time.stamp()} :: ${requestID}] (404 Not Found) Handled GET ${matchingPath}${requestTime}`,
                //         );
                //     }

                //     response
                //         .status(404)
                //         .send(NOT_FOUND_TEMPLATE);

                //     this.resolvePreserveAfterServe(
                //         preserveAfterServe,
                //         request,
                //         response,
                //     );

                //     return;
                // }


                // const renderer = await this.renderApplication(
                //     notFoundRoute,
                //     preserveResult,
                // );

                // if (this.debugAllows('info')) {
                //     const requestTime = this.computeRequestTime(request);

                //     console.info(
                //         `[${time.stamp()} :: ${requestID}] (404 Not Found) Handled GET ${matchingPath}${requestTime}`,
                //     );
                // }

                // response
                //     .status(404)
                //     .send(renderer.html());

                // this.resolvePreserveAfterServe(
                //     preserveAfterServe,
                //     request,
                //     response,
                // );

                response
                    .status(404)
                    .end();

                return;
            }


            const renderer = await this.renderApplication(
                // route,
                isoMatch,
                preserveResult,
            );

            if (this.debugAllows('info')) {
                const requestTime = this.computeRequestTime(request);

                console.info(
                    `[${time.stamp()} :: ${requestID}] (200 OK) Handled GET ${matchingPath}${requestTime}`,
                );
            }

            response.send(renderer.html());

            this.resolvePreserveAfterServe(
                preserveAfterServe,
                request,
                response,
            );

            return;
        } catch (error) {
            if (this.debugAllows('error')) {
                const requestTime = this.computeRequestTime(request);

                console.error(
                    `[${time.stamp()} :: ${requestID}] (500 Server Error) Could not handle GET ${request.path}${requestTime}`,
                    error,
                );
            }

            response
                .status(500)
                .send(SERVER_ERROR_TEMPLATE);

            return;
        }
    }

    private async handlePTTPRequest(
        request: express.Request,
        response: express.Response,
        next: express.NextFunction,
    ) {
        const requestID = (request as ServerRequest).requestID || uuid.generate();

        try {
            if (this.debugAllows('info')) {
                console.info(
                    `[${time.stamp()} :: ${requestID}] (000 Start) Handling POST ${request.path}`,
                );
            }


            if (!this.usePTTP) {
                if (this.debugAllows('warn')) {
                    const requestTime = this.computeRequestTime(request);

                    console.info(
                        `[${time.stamp()} :: ${requestID}] (405 Method Not Allowed) Could not handle POST ${request.path}${requestTime}`,
                    );
                }

                response
                    .status(405)
                    .end();
                return;
            }


            const data = request.body;

            if (!data.path) {
                if (this.debugAllows('warn')) {
                    const requestTime = this.computeRequestTime(request);

                    console.info(
                        `[${time.stamp()} :: ${requestID}] (400 Bad Request) Could not handle POST ${request.path}${requestTime}`,
                    );
                }

                response
                    .status(400)
                    .end();
                return;
            }


            if (this.pttpHandler) {
                const pttpHandled = await this.pttpHandler(
                    data.path,
                );

                if (pttpHandled) {
                    return;
                }
            }

            // check amongst all the routes and planes for a match
            for (const route of this.routes) {
                if (route.value === data.path) {
                    // serve the matched route

                }
            }


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
                .send(SERVER_ERROR_TEMPLATE);

            return;
        }
    }

    private ignoreGetRequest(
        path: string,
    ) {
        for (const ignore of this.options.ignore) {
            const normalizedIgnore = ignore.endsWith('/') && ignore.length > 1
                ? ignore.slice(0, ignore.length - 1)
                : ignore

            if (path === normalizedIgnore) {
                return true;
            }

            if (normalizedIgnore.endsWith('/*')) {
                const curatedIgnore = normalizedIgnore.replace('/*', '');

                if (path.startsWith(curatedIgnore)) {
                    return true;
                }
            }
        }

        return false;
    }

    private resolveMatchingPath(
        preserveResult: PluridPreserveResponse | void,
        path: string,
    ) {
        const redirect = preserveResult ? preserveResult.redirect : '';
        const externalRedirect = !!(redirect?.startsWith('http'));
        const matchingPath = redirect || path;

        return {
            externalRedirect,
            matchingPath,
        };
    }

    private async resolvePreserve(
        request: express.Request,
        response: express.Response,
    ) {
        const catchAll = this.preserves.find(
            preserve => preserve.serve === '*',
        );

        const urlMatch = this.urlRouter.match(request.originalUrl);

        let preserveOnServe: undefined | PluridPreserveOnServe<any>;
        let preserveAfterServe: undefined | PluridPreserveAfterServe<any>;
        let preserveOnError: undefined | PluridPreserveOnError<any>;
        if (urlMatch?.target || catchAll) {
            const preserve = catchAll
                ? catchAll
                : this.preserves.find(
                    preserve => preserve.serve === urlMatch?.target
                );

            if (preserve) {
                preserveOnServe = preserve.onServe;
                preserveAfterServe = preserve.afterServe;
                preserveOnError = preserve.onError;
            }
        }

        let preserveResult: void | PluridPreserveResponse;
        if (preserveOnServe) {
            const transmission: PluridPreserveTransmission<any> = {
                request,
                response,
                context: {
                    contextualizers: undefined,
                    path: request.originalUrl,
                    match: urlMatch as any, // hack as any
                },
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
                if (preserveOnError) {
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
    }

    private async resolvePreserveAfterServe(
        preserveAfterServe: PluridPreserveAfterServe<any> | undefined,
        request: express.Request,
        response: express.Response,
    ) {
        if (preserveAfterServe) {
            const urlMatch = this.urlRouter.match(request.originalUrl);

            if (!urlMatch) {
                return;
            }

            const transmission: PluridPreserveTransmission<any> = {
                request,
                response,
                context: {
                    contextualizers: undefined,
                    path: request.originalUrl,
                    match: urlMatch,
                },
            };

            await preserveAfterServe(transmission);
        }
    }

    private async handleGateway(
        path: string,
        request: express.Request,
        preserveResult: any,
    ) {
        const {
            gatewayEndpoint,
        } = this.options;

        if (path !== gatewayEndpoint) {
            return;
        }

        const gatewayRoute = {
            path: {
                value: gatewayEndpoint,
            },
            pathname: gatewayEndpoint,
            parameters: {},
            query: {
                __gatewayQuery: request.originalUrl,
            },
            fragments: {
                texts: [],
                elements: [],
            },
            route: gatewayEndpoint,
        };

        // const renderer = await this.renderApplication(
        //     gatewayRoute,
        //     preserveResult,
        // );

        // return renderer.html();
        return '';
    }


    private async renderApplication(
        // route: router.MatcherResponse<PluridReactComponent>,
        isoMatch: router.IsoMatcherRouteResult<PluridReactComponent>,
        preserveResult: any,
        matchedPlane?: any,
    ) {
        // console.log('RENDER route', route);
        console.log('RENDER isoMatch', isoMatch);
        const pluridMetastate = serverComputeMetastate(
            // route,
            isoMatch,
            this.routes,
        );
        console.log('pluridMetastate', pluridMetastate);

        const {
            content,
            styles,
        } = await this.getContentAndStyles(
            // route,
            isoMatch,
            pluridMetastate,
            preserveResult,
            matchedPlane,
        );

        const stringedStyles = this.styles.reduce(
            (accumulator, style) => accumulator + style,
            '',
        );
        const mergedStyles = styles + stringedStyles;

        const {
            helmet,
        }: any = this.helmet;

        const head = `
            ${helmet.meta.toString()}
            ${helmet.title.toString()}
            ${helmet.base.toString()}
            ${helmet.link.toString()}
            ${helmet.style.toString()}
            ${helmet.noscript.toString()}
            ${helmet.script.toString()}
        `;

        const htmlAttributes = {
            ...this.template?.htmlAttributes,
            ...helmet.htmlAttributes.toComponent(),
        };
        const bodyAttributes = helmet.bodyAttributes.toString();


        let reduxPreserveValue;
        if (preserveResult) {
            reduxPreserveValue = preserveResult.providers?.redux;
        }

        const store = this.servicesData?.reduxStore
            ? JSON.stringify(
                this.servicesData?.reduxStore(
                    reduxPreserveValue ?? this.servicesData?.reduxStoreValue ?? {},
                ).getState())
            : '';

        const headScripts = this.template?.headScripts || '';
        const stripeScript = this.servicesData?.stripeScript || '';
        const mergedHeadScripts = headScripts + '\n' + stripeScript;

        const renderer = new PluridRenderer({
            htmlLanguage: this.template?.htmlLanguage,
            htmlAttributes,
            head,
            defaultStyle: this.template?.defaultStyle,
            styles: mergedStyles,
            headScripts: mergedHeadScripts,
            vendorScriptSource: this.template?.vendorScriptSource,
            mainScriptSource: this.template?.mainScriptSource,
            bodyAttributes,
            content,
            root: this.template?.root,
            defaultPreloadedReduxState: this.template?.defaultPreloadedReduxState,
            reduxState: store,
            defaultPreloadedPluridMetastate: this.template?.defaultPreloadedPluridMetastate,
            pluridMetastate: JSON.stringify(pluridMetastate),
            bodyScripts: this.template?.bodyScripts,
        });

        return renderer;
    }

    private async getContentAndStyles(
        // matchedRoute: router.MatcherResponse<PluridReactComponent>,
        isoMatch: router.IsoMatcherRouteResult<PluridReactComponent>,
        pluridMetastate: any,
        preserveResult: any,
        matchedPlane?: any,
    ) {
        const stylesheet = new ServerStyleSheet();
        let content = '';
        let styles = '';

        try {
            // based on the route get the specific plurids to be rendered
            // given the matchedRoute compute the metastate
            // const pluridMetastate = serverComputeMetastate(
            //     matchedRoute,
            //     this.paths,
            // );
            // const gateway = matchedRoute.pathname === '/gateway';
            // const gatewayQuery = matchedRoute.query.__gatewayQuery;
            const gateway = false;
            const gatewayQuery = '';
            const {
                gatewayEndpoint,
            } = this.options;

            const contentHandler = new PluridContentGenerator({
                services: this.services,
                servicesData: this.servicesData,
                stylesheet,
                exterior: this.exterior,
                shell: this.shell,
                helmet: this.helmet,
                // matchedRoute,
                routes: this.routes,
                planes: this.planes,
                pluridMetastate,
                gateway,
                gatewayEndpoint,
                gatewayQuery,
                preserveResult,
                matchedPlane,

                pathname: (isoMatch.data as any).value,
            });

            content = await contentHandler.render();

            styles = stylesheet.getStyleTags();
        } catch (error) {
            if (
                this.options.debug !== 'none'
                && !this.options.quiet
            ) {
                const errorText = `${this.options.serverName} Error: Something went wrong in getContentAndStyles().`;

                if (this.debugAllows('error')) {
                    console.error(
                        errorText,
                        error,
                    );
                }
            }

            return {
                content: '',
                styles: '',
            };
        } finally {
            stylesheet.seal();
        }

        return {
            content,
            styles,
        };
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


    private handleOptions(
        partialOptions?: PluridServerPartialOptions,
    ) {
        const options: PluridServerOptions = {
            serverName: partialOptions?.serverName || DEFAULT_SERVER_OPTIONS.SERVER_NAME,
            quiet: partialOptions?.quiet || DEFAULT_SERVER_OPTIONS.QUIET,
            debug: partialOptions?.debug
                ? partialOptions?.debug
                : environment.production ? 'error' : 'info',
            compression: partialOptions?.compression ?? DEFAULT_SERVER_OPTIONS.COMPRESSION,
            open: partialOptions?.open ?? DEFAULT_SERVER_OPTIONS.OPEN,
            buildDirectory: partialOptions?.buildDirectory || DEFAULT_SERVER_OPTIONS.BUILD_DIRECTORY,
            gatewayEndpoint: partialOptions?.gatewayEndpoint || DEFAULT_SERVER_OPTIONS.GATEWAY,
            staticCache: partialOptions?.staticCache || 0,
            ignore: partialOptions?.ignore || [],
            stillsDirectory: partialOptions?.stillsDirectory || DEFAULT_SERVER_OPTIONS.STILLS_DIRECTORY,
            stiller: partialOptions?.stiller || defaultStillerOptions,
        };
        return options;
    }

    private configureServer() {
        const clientPath = path.join(this.options.buildDirectory, './client');

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

        if (this.options.compression) {
            this.serverApplication.use(
                compression(),
            );

            this.serverApplication.get(
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

        this.serverApplication.use(
            express.static(clientPath, {
                maxAge: this.options.staticCache,
            }),
        );

        this.loadMiddleware();
    }

    private loadMiddleware() {
        for (const middleware of this.middleware) {
            this.serverApplication.use(
                (req, res, next) => middleware(req, res, next),
            );
        }
    }


    private open(
        serverlink: string,
    ) {
        try {
            const processDoNotOpen = process.env.PLURID_OPEN === 'false'
                ? true
                : false;

            if (processDoNotOpen) {
                return;
            }

            if (this.options.open) {
                open(serverlink);
            }
        } catch (error) {
            return;
        }
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
}
// #endregion module



// #region exports
export default PluridServer;
// #endregion exports
