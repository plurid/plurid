// #region imports
    // #region libraries
    import {
        Server,
    } from 'http';

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
    private server: Server | undefined;
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
            helmet,
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
        if (helmet !== undefined && !this.options.quiet) {
            console.warn(
                `[${this.options.serverName}] the \`helmet\` option is ignored: the head is the document model now (template.head, a route's / plane's head, <PluridDocument>, a preserve's document, the document hook).`,
            );
        }
        this.template = template;
        this.templateDocument = documentFromTemplate(template);
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

        this.stills = new PluridStillsManager(this.options);
        this.isoMatcher = new PluridIsoMatcher(
            {
                routes: this.routes,
                routePlanes: this.planes,
            },
            this.options.hostname,
        );


        configureExpress(this.serverApplication, this.options, this.middleware);
        this.handleEndpoints();

        // Opt-out (default on for the CLI). A bound, stored handler is registered ONCE and
        // removed in `stop()`, so multiple server instances don't pile up duplicate handlers,
        // and an embedding host can disable process termination entirely.
        if (this.options.attachSignalHandlers) {
            this.attachSignalHandlers();
        }
    }

    private handleProcessSignal = () => {
        this.stop();
        process.exit(0);
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


    public start(
        port = this.port,
    ) {
        this.port = port;

        const serverlink = `http://localhost:${port}`;

        if (debugAllows(this.options, 'info')) {
            console.info(
                `\n\t[${time.stamp()}] ${this.options.serverName} Started on Port ${port}: ${serverlink}\n`,
            );
        }

        this.server = this.serverApplication.listen(port);

        openBrowser(this.options, serverlink);

        return this.server;
    }

    public stop() {
        this.detachSignalHandlers();

        if (this.server) {
            if (debugAllows(this.options, 'info')) {
                console.info(
                    `\n\t[${time.stamp()}] ${this.options.serverName} Stopped on Port ${this.port}\n`,
                );
            }

            this.server.close();
        } else {
            if (debugAllows(this.options, 'info')) {
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
            CATCH_ALL_ROUTE_PATTERN,
            async (request, response, next) => {
                handleGetRequest(
                    this, request, response, next,
                );
            },
        );

        if (this.usePTTP) {
            this.serverApplication.post(
                PTTP_ROUTE,
                express.json() as any, // body parsing is built into Express 5
                async (request, response, next) => {
                    handlePTTPRequest(
                        this, request, response,
                    );
                },
            );
        }
    }


}
// #endregion module


// #region exports
export default PluridServer;
// #endregion exports
