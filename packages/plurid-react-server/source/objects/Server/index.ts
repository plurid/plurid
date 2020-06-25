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
    PluridRoute,
    PluridPreserve,
    PluridPreserveOnServe,
    PluridPreserveAfterServe,
    PluridPreserveOnError,
    PluridPreserveResponse,
    PluridPreserveTransmission,
    PluridComponent,
} from '@plurid/plurid-data';

import {
    router,
} from '@plurid/plurid-engine';

import {
    serverComputeMetastate,
} from '@plurid/plurid-react';

import {
    environment,

    defaultStillerOptions,

    NOT_FOUND_ROUTE,
    DEFAULT_SERVER_PORT,
    DEFAULT_SERVER_OPTIONS,
} from '../../data/constants';

import {
    NOT_FOUND_TEMPLATE,
} from '../../data/templates';

import {
    PluridServerMiddleware,
    PluridServerService,
    PluridServerServicesData,
    PluridServerOptions,
    PluridServerPartialOptions,
    PluridServerConfiguration,
    PluridServerTemplateConfiguration,
} from '../../data/interfaces';

import PluridRenderer from '../Renderer';
import PluridContentGenerator from '../ContentGenerator';
import PluridsResponder from '../PluridsResponder';
import PluridStillsManager from '../StillsManager';



const {
    default: PluridRouter,
    URLRouter: PluridURLRouter,
} = router;


export default class PluridServer {
    private routes: PluridRoute[];
    private preserves: PluridPreserve[];
    private helmet: Helmet;
    private styles: string[];
    private middleware: PluridServerMiddleware[];
    private exterior: PluridComponent | undefined;
    private shell: PluridComponent | undefined;
    private services: PluridServerService[];
    private servicesData: PluridServerServicesData | undefined;
    private options: PluridServerOptions;
    private template: PluridServerTemplateConfiguration | undefined;

    private serverApplication: Express;
    private server: Server | undefined;
    private port: number | string;
    private renderer: PluridRenderer | undefined;


    constructor(
        configuration: PluridServerConfiguration,
    ) {
        const {
            routes,
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
        } = configuration;

        this.routes = routes;
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

        this.serverApplication = express();
        this.port = DEFAULT_SERVER_PORT;

        this.configureServer();

        this.computeApplication();

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

        if (!this.options.quiet) {
            console.info(`\n\tPlurid Server Started on Port ${port}: ${serverlink}\n`);
        }

        this.server = this.serverApplication.listen(port);

        this.open(serverlink);

        return this.server;
    }

    public stop() {
        if (!this.options.quiet) {
            console.info(`\n\tPlurid Server Closed on Port ${this.port}\n`);
        }

        if (this.server) {
            this.server.close();
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


    private computeApplication() {
        this.loadMiddleware();

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
        const urlRouter = new PluridURLRouter(urlRoutes);

        const stills = new PluridStillsManager(this.options);
        const router = new PluridRouter(this.routes);
        const pluridsResponder = new PluridsResponder();

        this.serverApplication.get('*', async (request, response) => {
            const path = request.path;

            if (this.options.ignore.includes(path)) {
                return;
            }

            const urlMatch = urlRouter.match(path);

            let preserveOnServe: undefined | PluridPreserveOnServe<any>;
            let preserveAfterServe: undefined | PluridPreserveAfterServe<any>;
            let preserveOnError: undefined | PluridPreserveOnError<any>;
            if (urlMatch?.target) {
                const preserve = this.preserves.find(
                    preserve => preserve.serve === urlMatch.target
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
                        path,
                    },
                };

                try {
                    preserveResult = await preserveOnServe(transmission);

                    if (preserveResult) {
                        if (preserveResult.responded) {
                            return;
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
                                return;
                            }

                            if (!onErrorResponse.depreserve) {
                                return;
                            }
                        }
                    }
                }
            }


            // HANDLE GATEWAY
            const {
                gatewayEndpoint,
            } = this.options;

            if (path === gatewayEndpoint) {
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
                this.renderer = await this.renderApplication(
                    gatewayRoute,
                    preserveResult,
                );
                response.send(this.renderer?.html());
                return;
            }


            // HANDLE PLURIDS ???
            // check if the url is plurids
            // http://example.com/plurids/<route>/<space>/<page>
            // http://example.com/plurids/index/12345/54321

            // if (pluridsResponder.search(path)) {
            //     response.send(pluridsResponder);
            //     return;
            // }


            // HANDLE STILLS
            // const still = stills.get(path);
            // if (still) {
            //     response.send(still);
            //     return;
            // }


            let redirect: undefined | string;
            if (preserveResult) {
                redirect = preserveResult.redirect;
            }

            const matchingPath = redirect || path;

            const route = router.match(matchingPath);
            if (!route) {
                const notFoundStill = stills.get(NOT_FOUND_ROUTE);
                if (notFoundStill) {
                    response.status(404).send(notFoundStill);
                    return;
                }

                const notFoundRoute = router.match(NOT_FOUND_ROUTE);
                if (!notFoundRoute) {
                    response.status(404).send(NOT_FOUND_TEMPLATE);
                    return;
                }

                this.renderer = await this.renderApplication(
                    notFoundRoute,
                    preserveResult,
                );
                response.send(this.renderer?.html());
                return;
            }

            this.renderer = await this.renderApplication(
                route,
                preserveResult,
            );
            response.send(this.renderer?.html());
        });
    }

    private async renderApplication(
        route: router.MatcherResponse,
        preserveResult: any,
    ) {
        // console.log('RENDER route', route);
        const pluridMetastate = serverComputeMetastate(
            route,
            this.routes,
        );

        const {
            content,
            styles,
        } = await this.getContentAndStyles(
            route,
            pluridMetastate,
            preserveResult,
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

        const htmlAttributes = helmet.htmlAttributes.toString();
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
            htmlAttributes: this.template?.htmlAttributes,
            head,
            defaultStyle: this.template?.defaultStyle,
            styles: mergedStyles,
            headScripts: mergedHeadScripts,
            vendorScriptSource: this.template?.vendorScriptSource,
            mainScriptSource: this.template?.mainScriptSource,
            bodyAttributes,
            content,
            root: this.template?.root,
            windowSizerScript: this.template?.windowSizerScript,
            defaultPreloadedReduxState: this.template?.defaultPreloadedReduxState,
            reduxState: store,
            defaultPreloadedPluridMetastate: this.template?.defaultPreloadedPluridMetastate,
            pluridMetastate: JSON.stringify(pluridMetastate),
            bodyScripts: this.template?.bodyScripts,
        });

        return renderer;
    }

    private async getContentAndStyles(
        matchedRoute: router.MatcherResponse,
        pluridMetastate: any,
        preserveResult: any,
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
            const gateway = matchedRoute.pathname === '/gateway';
            const gatewayQuery = matchedRoute.query.__gatewayQuery;
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
                matchedRoute,
                routes: this.routes,
                pluridMetastate,
                gateway,
                gatewayEndpoint,
                gatewayQuery,
                preserveResult,
            });

            content = await contentHandler.render();

            styles = stylesheet.getStyleTags();
        } catch (error) {
            if (this.options.debug !== 'none' && !this.options.quiet) {
                const errorText = 'Plurid Server Error: Something went wrong in getContentAndStyles().'
                if (this.options.debug === 'error') {
                    console.error(errorText, error);
                } else {
                    console.log(errorText);
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

    private handleOptions(
        partialOptions?: PluridServerPartialOptions,
    ) {
        const options: PluridServerOptions = {
            quiet: partialOptions?.quiet || DEFAULT_SERVER_OPTIONS.QUIET,
            debug: (partialOptions?.debug || environment.production) ? 'error' : 'info',
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
}
