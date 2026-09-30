// #region imports
    // #region libraries
    import http, {
        Server,
    } from 'http';
    import type {
        AddressInfo,
    } from 'net';

    import express, {
        Express,
    } from 'express';


    import {
        time,
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
        PluridDocument,
    } from '@plurid/plurid-data';
    import {
        routing,
    } from '@plurid/plurid-engine';

    import {
        serverComputeMetastate,
        createDocumentRegistry,
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

        PluridServerDocumentHook,
        PluridServerRenderMode,
        PTTPHandler,
    } from '~data/interfaces';

    import {
        environment,

        defaultStillerOptions,

        NOT_FOUND_ROUTE,
        DEFAULT_SERVER_PORT,
        DEFAULT_SERVER_OPTIONS,

        CATCH_ALL_ROUTE,
        CATCH_ALL_ROUTE_PATTERN,
        PTTP_ROUTE,
    } from '~data/constants';


    import PluridStillsManager from '../StillsManager';
    import {
        PluridServerContext,
    } from './context';
    import {
        resolveServerOptions,
        debugAllows,
    } from './options';
    import {
        configureExpress,
        handleErrors,
        openBrowser,
    } from './express';
    import {
        handleGetRequest,
    } from './pipeline';
    import {
        handlePTTPRequest,
    } from './pttp';
    import {
        documentFromTemplate,
    } from './document';

    // #endregion external
// #endregion imports



// #region module
const {
    IsoMatcher: PluridIsoMatcher,
} = routing;



class PluridServer implements PluridServerContext {
    public readonly routes: PluridRoute<PluridReactComponent>[];
    public readonly planes: PluridRoutePlane<PluridReactComponent>[];
    public readonly preserves: PluridPreserveReact[];
    public readonly documentHook: PluridServerDocumentHook | undefined;
    public readonly renderMode: PluridServerRenderMode;
    public readonly styles: string[];
    public readonly middleware: PluridServerMiddleware[];
    public readonly exterior: PluridReactComponent | undefined;
    public readonly shell: PluridReactComponent | undefined;
    public readonly routerProperties: Partial<PluridRouterProperties<PluridReactComponent>>;
    public readonly services: PluridServerService[];
    public readonly options: PluridServerOptions;
    public readonly template: PluridServerTemplateConfiguration | undefined;
    public readonly templateDocument: PluridDocument;
    public usePTTP: boolean;
    public readonly pttpHandler: PTTPHandler | undefined;
    public readonly elementqlEndpoint: string | undefined;

    private serverApplication: Express;
    /** The host's routes (`handle()`), mounted ahead of the page's catch-all. */
    private hostRouter: express.Router;
    private server: Server | undefined;
    private listening: Promise<Server> | undefined;
    private port: number | string;

    public readonly stills: PluridStillsManager;
    public readonly isoMatcher: routing.IsoMatcher<PluridReactComponent>;


    constructor(
        configuration: PluridServerConfiguration,
    ) {
        const {
            routes,
            planes,
            preserves,
            document,
            render,
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
            handlers,
        } = configuration;

        this.routes = routes;
        this.planes = planes || [];
        this.preserves = preserves;
        this.documentHook = document;
        this.renderMode = render || 'string';
        this.styles = styles || [];
        this.middleware = middleware || [];
        this.exterior = exterior;
        this.shell = shell;
        this.routerProperties = routerProperties || {};
        this.services = services || [];
        this.options = resolveServerOptions(options);
        this.template = template;
        this.templateDocument = documentFromTemplate(template);
        this.usePTTP = usePTTP ?? false;
        this.pttpHandler = pttpHandler;
        this.elementqlEndpoint = elementqlEndpoint;

        this.serverApplication = express();
        this.hostRouter = express.Router();
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

        this.stills = new PluridStillsManager(this.options);
        this.isoMatcher = new PluridIsoMatcher(
            {
                routes: this.routes,
                routePlanes: this.planes,
            },
            this.options.hostname,
        );


        configureExpress(this.serverApplication, this.options, this.middleware);
        // THE HOST'S ROUTES COME BEFORE THE PAGE (2026-09-29). The page is a catch-all `GET`: a route
        // registered after it never answers, and `handle()` had no `get` — the kit's `handlers(server)`
        // ran after construction, so its `GET /status` health probe answered 404. `handle()` registers
        // on this router, ahead of the catch-all at any time; `handlers` runs here, before it.
        this.serverApplication.use(this.hostRouter);
        if (handlers) {
            handlers(this);
        }
        this.handleEndpoints();

        // Opt-out (default on for the CLI). A bound, stored handler is registered ONCE and
        // removed in `stop()`, so multiple server instances don't pile up duplicate handlers,
        // and an embedding host can disable process termination entirely.
        if (this.options.attachSignalHandlers) {
            this.attachSignalHandlers();
        }
    }

    private signalStopping = false;

    /**
     * SIGINT / SIGTERM: stop gracefully — the requests in flight are answered — and exit `0` once the
     * server has closed. It exited at once, and every rolling deploy dropped the pages being rendered
     * (2026-09-29). A second delivery while it drains (a terminal's Ctrl+C reaches both `plurid start`
     * and the server, and `plurid start` forwards it too) is not a second, harder stop: the drain is
     * bounded by `stopTimeout`.
     */
    private handleProcessSignal = () => {
        if (this.signalStopping) {
            return;
        }
        this.signalStopping = true;

        this.drain().finally(() => {
            this.detachSignalHandlers();
            process.exit(0);
        });
    };

    private signalHandlersAttached = false;

    public attachSignalHandlers() {
        if (this.signalHandlersAttached) {
            return;
        }
        process.on('SIGINT', this.handleProcessSignal);
        process.on('SIGTERM', this.handleProcessSignal);
        this.signalHandlersAttached = true;
    }

    public detachSignalHandlers() {
        process.removeListener('SIGINT', this.handleProcessSignal);
        process.removeListener('SIGTERM', this.handleProcessSignal);
        this.signalHandlersAttached = false;
    }

    static analysis(
        pluridServer: PluridServer,
    ) {
        return {
            routes: pluridServer.routes,
            options: pluridServer.options,
        };
    }


    /**
     * Listen on `port`. Resolves with the listening `http.Server` once it is bound (the start is logged
     * then, not before) and rejects on a listen error (`EADDRINUSE`): the port was busy, the log said
     * "Started" all the same, and the process died on an unhandled `'error'` event (2026-09-29).
     * Idempotent: a second call returns the same promise; after a failed start, it tries again.
     */
    public start(
        port = this.port,
    ): Promise<Server> {
        if (this.listening) {
            return this.listening;
        }

        this.port = port;
        const server = http.createServer(this.serverApplication);
        this.server = server;

        const listening = new Promise<Server>((resolve, reject) => {
            const onError = (error: Error) => {
                server.removeListener('listening', onListening);
                if (this.server === server) {
                    this.server = undefined;
                }
                if (this.listening === listening) {
                    this.listening = undefined;
                }

                if (debugAllows(this.options, 'error')) {
                    console.error(
                        `\n\t[${time.stamp()}] ${this.options.serverName} could not start on port ${port}: ${error.message}\n`,
                    );
                }

                reject(error);
            };
            const onListening = () => {
                server.removeListener('error', onError);

                const address = server.address() as AddressInfo | null;
                const boundPort = address?.port ?? port;
                const serverlink = `http://localhost:${boundPort}`;
                if (debugAllows(this.options, 'info')) {
                    console.info(
                        `\n\t[${time.stamp()}] ${this.options.serverName} Started on Port ${boundPort}: ${serverlink}\n`,
                    );
                }

                openBrowser(this.options, serverlink);

                resolve(server);
            };

            server.once('error', onError);
            server.once('listening', onListening);
            server.listen(port);
        });
        this.listening = listening;

        return listening;
    }

    /**
     * Stop listening and close gracefully: the requests in flight are answered, idle keep-alive
     * connections close now, and whatever is still open after `timeout` ms (default
     * `options.stopTimeout`) is cut. Resolves once the server has closed; harmless when stopped.
     * Removes the signal handlers.
     */
    public async stop(
        timeout = this.options.stopTimeout,
    ): Promise<void> {
        this.detachSignalHandlers();

        await this.drain(timeout);
    }

    private async drain(
        timeout = this.options.stopTimeout,
    ): Promise<void> {
        const starting = this.listening;
        if (starting) {
            await starting.catch(() => undefined);
        }

        const server = this.server;
        this.server = undefined;
        this.listening = undefined;

        if (!server) {
            if (debugAllows(this.options, 'info')) {
                console.info(
                    `\n\t[${time.stamp()}] ${this.options.serverName} Could not be Stopped on Port ${this.port}\n`,
                );
            }
            return;
        }

        await new Promise<void>((resolve) => {
            const cut = setTimeout(() => {
                server.closeAllConnections();
            }, timeout);

            server.close(() => {
                clearTimeout(cut);
                resolve();
            });
            server.closeIdleConnections();
        });

        if (debugAllows(this.options, 'info')) {
            console.info(
                `\n\t[${time.stamp()}] ${this.options.serverName} Stopped on Port ${this.port}\n`,
            );
        }
    }

    /**
     * Route registrars for the host's own endpoints, ahead of the page's catch-all `GET` whenever
     * they are called (a `get` added through `instance()` after construction sits behind it).
     */
    public handle() {
        return {
            get: (
                path: string,
                ...handlers: express.RequestHandler[]
            ) => {
                this.hostRouter.get(path, ...handlers);

                return this.serverApplication;
            },
            post: (
                path: string,
                ...handlers: express.RequestHandler[]
            ) => {
                this.hostRouter.post(path, ...handlers);

                return this.serverApplication;
            },
            patch: (
                path: string,
                ...handlers: express.RequestHandler[]
            ) => {
                this.hostRouter.patch(path, ...handlers);

                return this.serverApplication;
            },
            put: (
                path: string,
                ...handlers: express.RequestHandler[]
            ) => {
                this.hostRouter.put(path, ...handlers);

                return this.serverApplication;
            },
            delete: (
                path: string,
                ...handlers: express.RequestHandler[]
            ) => {
                this.hostRouter.delete(path, ...handlers);

                return this.serverApplication;
            },
        };
    }

    public instance() {
        return this.serverApplication;
    }


    /**
     * The page's catch-all `GET`, the PTTP `POST`, and the last handler. A rejection reaches
     * Express's `next` (and so the last handler): it was a floating promise, and an unhandled
     * rejection ends the process.
     */
    private handleEndpoints() {
        this.serverApplication.get(
            CATCH_ALL_ROUTE_PATTERN,
            (request, response, next) => {
                handleGetRequest(
                    this, request, response, next,
                ).catch(next);
            },
        );

        if (this.usePTTP) {
            this.serverApplication.post(
                PTTP_ROUTE,
                express.json() as any, // body parsing is built into Express 5
                (request, response, next) => {
                    handlePTTPRequest(
                        this, request, response,
                    ).catch(next);
                },
            );
        }

        this.serverApplication.use(
            handleErrors(this.options, this.template?.errorHtml),
        );
    }


}
// #endregion module


// #region exports
export default PluridServer;
// #endregion exports
