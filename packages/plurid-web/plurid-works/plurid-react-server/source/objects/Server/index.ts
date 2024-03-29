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
    import {
        json as jsonParser,
    } from 'body-parser';

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
        PluridRouterProperties,
        PluridPreserveOnServe,
        PluridPreserveAfterServe,
        PluridPreserveOnError,
        PluridPreserveResponse,
        PluridPreserveTransmission,

        IsoMatcherRouteResult,
    } from '@plurid/plurid-data';

    import {
        routing,
    } from '@plurid/plurid-engine';

    import {
        serverComputeMetastate,
        // getDirectPlaneMatch,

        PluridReactComponent,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import {
        ServerRequest,
        DebugLevels,

        PluridServerMiddleware,
        PluridServerService,
        PluridServerOptions,
        PluridServerPartialOptions,
        PluridServerConfiguration,
        PluridServerTemplateConfiguration,
        PluridPreserveReact,

        PTTPHandler,
    } from '~data/interfaces';

    import {
        environment,

        defaultStillerOptions,

        NOT_FOUND_ROUTE,
        DEFAULT_SERVER_PORT,
        DEFAULT_SERVER_OPTIONS,

        CATCH_ALL_ROUTE,
        PTTP_ROUTE,
    } from '~data/constants';

    import {
        NOT_FOUND_TEMPLATE,
        SERVER_ERROR_TEMPLATE,
    } from '~data/templates';

    import PluridRenderer from '../Renderer';
    import PluridContentGenerator from '../ContentGenerator';
    // import PluridStillsManager from '../StillsManager';

    import {
        recordToString,
    } from '~utilities/template';

    import {
        resolveElementFromPlaneMatch,
    } from '~utilities/pttp';
    // #endregion external
// #endregion imports



// #region module
const {
    IsoMatcher: PluridIsoMatcher,
} = routing;



class PluridServer {
    private routes: PluridRoute<PluridReactComponent>[];
    private planes: PluridRoutePlane<PluridReactComponent>[];
    private preserves: PluridPreserveReact[];
    private helmet: Helmet;
    private styles: string[];
    private middleware: PluridServerMiddleware[];
    private exterior: PluridReactComponent | undefined;
    private shell: PluridReactComponent | undefined;
    private routerProperties: Partial<PluridRouterProperties<PluridReactComponent>>;
    private services: PluridServerService[];
    private options: PluridServerOptions;
    private template: PluridServerTemplateConfiguration | undefined;
    public usePTTP: boolean;
    private pttpHandler: PTTPHandler | undefined;
    private elementqlEndpoint: string | undefined;

    private serverApplication: Express;
    private server: Server | undefined;
    private port: number | string;

    // private stills: PluridStillsManager;
    private isoMatcher: routing.IsoMatcher<PluridReactComponent>;


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
            routerProperties,
            services,
            options,
            template,
            usePTTP,
            pttpHandler,
            elementqlEndpoint,
        } = configuration;

        this.routes = routes;
        this.planes = planes || [];
        this.preserves = preserves;
        this.helmet = helmet;
        this.styles = styles || [];
        this.middleware = middleware || [];
        this.exterior = exterior;
        this.shell = shell;
        this.routerProperties = routerProperties || {};
        this.services = services || [];
        this.options = this.handleOptions(options);
        this.template = template;
        this.usePTTP = usePTTP ?? false;
        this.pttpHandler = pttpHandler;
        this.elementqlEndpoint = elementqlEndpoint;

        this.serverApplication = express();
        this.port = DEFAULT_SERVER_PORT;


        // const urlRoutes = this.routes.map(route => {
        //     const {
        //         value,
        //         parameters,
        //     } = route;

        //     return {
        //         value,
        //         parameters,
        //     };
        // });
        // this.urlRouter = new PluridURLRouter(urlRoutes);

        // this.stills = new PluridStillsManager(this.options);
        this.isoMatcher = new PluridIsoMatcher(
            {
                routes: this.routes,
                routePlanes: this.planes,
            },
            this.options.hostname,
        );


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
            CATCH_ALL_ROUTE,
            async (request, response, next) => {
                this.handleGetRequest(
                    request, response, next,
                );
            },
        );

        if (this.usePTTP) {
            this.serverApplication.post(
                PTTP_ROUTE,
                jsonParser() as any, // FORCED
                async (request, response, next) => {
                    this.handlePTTPRequest(
                        request, response,
                    );
                },
            );
        }
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


            const ignorable = this.ignoreGetRequest(
                request.path,
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
                request.originalUrl,
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
            // console.log('Route isoMatch', matchingPath, isoMatch);

            if (
                !isoMatch
            ) {
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

                const isoMatchNotFound = this.isoMatcher.match(
                    NOT_FOUND_ROUTE,
                    'route',
                );
                if (!isoMatchNotFound) {
                    if (this.debugAllows('info')) {
                        const requestTime = this.computeRequestTime(request);

                        console.info(
                            `[${time.stamp()} :: ${requestID}] (404 Not Found) Handled GET ${matchingPath}${requestTime}`,
                        );
                    }

                    response
                        .status(404)
                        .send(NOT_FOUND_TEMPLATE);

                    this.resolvePreserveAfterServe(
                        preserveAfterServe,
                        request,
                        response,
                    );

                    return;
                }


                const renderer = await this.renderApplication(
                    isoMatchNotFound,
                    preserveResult,
                );

                if (this.debugAllows('info')) {
                    const requestTime = this.computeRequestTime(request);

                    console.info(
                        `[${time.stamp()} :: ${requestID}] (404 Not Found) Handled GET ${matchingPath}${requestTime}`,
                    );
                }

                response
                    .status(404)
                    .send(renderer.html());

                this.resolvePreserveAfterServe(
                    preserveAfterServe,
                    request,
                    response,
                );

                response
                    .status(404)
                    .end();

                return;
            }


            const renderer = await this.renderApplication(
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
    ) {
        const requestID = (request as ServerRequest).requestID || uuid.generate();

        try {
            if (this.debugAllows('info')) {
                console.info(
                    `[${time.stamp()} :: ${requestID}] (000 Start) Handling POST ${request.path}`,
                );
            }


            response.setHeader('Access-Control-Allow-Origin', request.headers.origin || '');
            response.setHeader('Access-Control-Allow-Credentials', 'true');


            const data = request.body;
            if (!data && !data.path) {
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
                    if (this.debugAllows('info')) {
                        const requestTime = this.computeRequestTime(request);

                        console.info(
                            `[${time.stamp()} :: ${requestID}] (200 OK) Handled POST ${request.path}${requestTime} in custom handler`,
                        );
                    }

                    return;
                }
            }


            const planeMatch = this.isoMatcher.match(
                data.path,
            );
            if (!planeMatch) {
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


            const elementMatch = resolveElementFromPlaneMatch(
                planeMatch,
                this.elementqlEndpoint,
            );
            if (!elementMatch) {
                if (this.debugAllows('warn')) {
                    const requestTime = this.computeRequestTime(request);

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


            if (this.debugAllows('info')) {
                const requestTime = this.computeRequestTime(request);

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
            preserve => preserve.serve === CATCH_ALL_ROUTE,
        );

        const notFound = this.preserves.find(
            preserve => preserve.serve === NOT_FOUND_ROUTE,
        );

        const isoMatch = this.isoMatcher.match(
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
                    : this.preserves.find(
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
        preserveAfterServe: PluridPreserveAfterServe<
            IsoMatcherRouteResult<PluridReactComponent<any>> | undefined,
            express.Request,
            express.Response
        > | undefined,
        request: express.Request,
        response: express.Response,
    ) {
        if (preserveAfterServe) {
            const isoMatch = this.isoMatcher.match(
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
        isoMatch: IsoMatcherRouteResult<PluridReactComponent>,
        preserveResult: PluridPreserveResponse | undefined,
        matchedPlane?: any,
    ) {
        const globals = preserveResult?.globals;

        const mergedHtmlLanguage = preserveResult?.template?.htmlLanguage
            || this.template?.htmlLanguage;

        const pluridMetastate = await serverComputeMetastate(
            isoMatch,
            this.routes,
            globals,
            this.options.hostname,
        );

        const {
            content,
            styles,
        } = await this.getContentAndStyles(
            isoMatch,
            pluridMetastate,
            preserveResult,
            matchedPlane,
        );

        const stringedStyles = this.styles.reduce(
            (accumulator, style) => accumulator + style,
            '',
        );
        const preserveStyles = preserveResult?.template?.styles?.join(' ') || '';
        const mergedStyles = styles
            + stringedStyles
            + preserveStyles;

        const {
            helmet,
        }: any = this.helmet;

        const head = helmet ? `
            ${helmet.meta.toString()}
            ${helmet.title.toString()}
            ${helmet.base.toString()}
            ${helmet.link.toString()}
            ${helmet.style.toString()}
            ${helmet.noscript.toString()}
            ${helmet.script.toString()}
        ` : '';

        const htmlAttributes = {
            ...this.template?.htmlAttributes,
            ...helmet?.htmlAttributes.toComponent(),
        };
        const mergedHtmlAttributes = recordToString(htmlAttributes)
            + (preserveResult?.template?.htmlAttributes || '');

        const bodyAttributes = helmet?.bodyAttributes.toString() || '';
        const preserveBodyAttributes = preserveResult?.template?.bodyAttributes || '';
        const mergedBodyAttributes = bodyAttributes
            + preserveBodyAttributes;

        const headScripts = this.template?.headScripts || [];
        const mergedHeadScripts = [
            ...headScripts,
            ...(preserveResult?.template?.headScripts || []),
        ];

        const bodyScripts = this.template?.bodyScripts || [];
        const mergedBodyScripts = [
            ...bodyScripts,
            ...(preserveResult?.template?.bodyScripts || []),
        ];


        const renderer = new PluridRenderer({
            htmlLanguage: mergedHtmlLanguage,
            head,
            htmlAttributes: mergedHtmlAttributes,
            bodyAttributes: mergedBodyAttributes,
            defaultStyle: this.template?.defaultStyle,
            styles: mergedStyles,
            headScripts: mergedHeadScripts,
            bodyScripts: mergedBodyScripts,
            vendorScriptSource: this.template?.vendorScriptSource,
            mainScriptSource: this.template?.mainScriptSource,
            root: this.template?.root,
            content,
            defaultPreloadedPluridMetastate: this.template?.defaultPreloadedPluridMetastate,
            pluridMetastate: JSON.stringify(pluridMetastate),
            globals,
            minify: this.template?.minify,
        });

        return renderer;
    }

    private async getContentAndStyles(
        isoMatch: IsoMatcherRouteResult<PluridReactComponent>,
        pluridMetastate: any,
        preserveResult: PluridPreserveResponse | undefined,
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
                stylesheet,
                exterior: this.exterior,
                shell: this.shell,
                routerProperties: this.routerProperties,
                helmet: this.helmet,
                routes: this.routes,
                planes: this.planes,
                pluridMetastate,
                gateway,
                gatewayEndpoint,
                gatewayQuery,
                preserveResult,

                pathname: isoMatch.match.value,
                hostname: this.options.hostname,
                matchedPlane: isoMatch.kind === 'RoutePlane'
                    ? {
                        value: isoMatch.match.value,
                    }
                    : undefined,
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
            hostname: partialOptions?.hostname || DEFAULT_SERVER_OPTIONS.HOSTNAME,
            quiet: partialOptions?.quiet || DEFAULT_SERVER_OPTIONS.QUIET,
            debug: partialOptions?.debug
                ? partialOptions?.debug
                : environment.production ? 'error' : 'info',
            compression: partialOptions?.compression ?? DEFAULT_SERVER_OPTIONS.COMPRESSION,
            open: partialOptions?.open ?? DEFAULT_SERVER_OPTIONS.OPEN,
            buildDirectory: partialOptions?.buildDirectory || DEFAULT_SERVER_OPTIONS.BUILD_DIRECTORY,
            assetsDirectory: partialOptions?.assetsDirectory || DEFAULT_SERVER_OPTIONS.ASSETS_DIRECTORY,
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
