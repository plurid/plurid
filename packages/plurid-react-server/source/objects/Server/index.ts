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
    PluridRouterPath,
} from '@plurid/plurid-data';

import {
    router,
} from '@plurid/plurid-engine';

import {
    environment,

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
} from '../../data/interfaces';

import PluridRenderer from '../Renderer';
import PluridContentGenerator from '../ContentGenerator';
import PluridsResponder from '../PluridsResponder';
import PluridStillsManager from '../StillsManager';



const PluridRouter = router.default;


export default class PluridServer {
    private paths: PluridRouterPath[];
    private helmet: Helmet;
    private styles: string[];
    private middleware: PluridServerMiddleware[];
    private services: PluridServerService[];
    private servicesData: PluridServerServicesData | undefined;
    private options: PluridServerOptions;

    private serverApplication: Express;
    private server: Server | undefined;
    private port: number | string;
    private renderer: PluridRenderer | undefined;

    constructor(
        configuration: PluridServerConfiguration,
    ) {
        const {
            paths,
            helmet,
            styles,
            middleware,
            services,
            servicesData,
            options,
        } = configuration;

        this.paths = paths;
        this.helmet = helmet;
        this.styles = styles || [];
        this.middleware = middleware || [];
        this.services = services || [];
        this.servicesData = servicesData;
        this.options = this.handleOptions(options);

        this.serverApplication = express();
        this.port = DEFAULT_SERVER_PORT;

        this.configureServer();

        this.computeApplication();

        process.addListener('SIGINT', () => {
            this.stop();
            process.exit(0);
        });
    }

    static analysis(pluridServer: PluridServer) {
        return {
            paths: pluridServer.paths,
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

    private computeApplication() {
        this.loadMiddleware();

        const stills = new PluridStillsManager(this.options);
        const router = new PluridRouter(this.paths);
        const pluridsResponder = new PluridsResponder();

        this.serverApplication.get('*', (request, response) => {
            const path = request.path;
            // const url = request.originalUrl || request.url;

            if (path === this.options.gatewayEndpoint) {
                console.log('handle gateway');
            }

            if (pluridsResponder.search(path)) {
                response.send(pluridsResponder);
                return;
            }

            // check if the url is plurids
            // http://example.com/plurids/<route>/<space>/<page>
            // http://example.com/plurids/index/12345/54321

            const still = stills.get(path);
            if (still) {
                response.send(still);
                return;
            }

            const route = router.match(path);

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

                this.renderer = this.renderApplication(notFoundRoute);
                response.send(this.renderer?.html());
                return;
            }

            this.renderer = this.renderApplication(route);
            response.send(this.renderer?.html());
        });
    }

    private renderApplication(
        route: router.MatcherResponse,
    ) {
        const {
            content,
            styles,
        } = this.getContentAndStyles(
            route,
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

        const store = this.servicesData?.reduxStore ?
            JSON.stringify(
                this.servicesData?.reduxStore(
                    this.servicesData?.reduxStoreValue || {},
                ).getState()
            ) : '';

        const {
            root,
            script,
            vendorScript,
        } = this.options;

        const stripeScript = this.servicesData?.stripeScript;

        const renderer = new PluridRenderer({
            content,
            head,
            styles: mergedStyles,
            store,
            root,
            script,
            vendorScript,
            stripeScript,
            htmlAttributes,
            bodyAttributes,
        });

        return renderer;
    }

    private getContentAndStyles(
        route: router.MatcherResponse,
    ) {
        const sheet = new ServerStyleSheet();
        let content = '';
        let styles = '';

        try {
            // based on the route get the specific plurids to be rendered
            const pluridContext = {};

            const contentHandler = new PluridContentGenerator(
                this.services,
                this.servicesData,
                sheet,
                this.helmet,
                route,
                this.paths,
                pluridContext,
            );

            content = contentHandler.render();

            styles = sheet.getStyleTags();
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
            sheet.seal();
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
            debug: partialOptions?.debug || environment.production ? 'error' : 'info',
            compression: partialOptions?.compression ?? true,
            open: partialOptions?.open ?? false,
            buildDirectory: partialOptions?.buildDirectory || DEFAULT_SERVER_OPTIONS.BUILD_DIRECTORY,
            stillsDirectory: partialOptions?.stillsDirectory || DEFAULT_SERVER_OPTIONS.STILLS_DIRECTORY,
            root: partialOptions?.root || 'root',
            script: partialOptions?.script || '/index.js',
            vendorScript: partialOptions?.vendorScript || '/vendor.js',
            gatewayEndpoint: partialOptions?.gatewayEndpoint || '/gateway',
        };
        return options;
    }

    private configureServer() {
        const clientPath = path.join(this.options.buildDirectory, './client');
        const vendorBrotliExists = fs.existsSync(path.join(clientPath, 'vendor.js.br'));

        this.serverApplication.disable('x-powered-by');

        if (this.options.compression) {
            this.serverApplication.use(
                compression(),
            );

            this.serverApplication.get(
                '/vendor.js',
                (request, response, next) => {
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
            express.static(clientPath),
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
            let opened = false;
            if (
                typeof process.env.PLURID_OPEN !== 'string'
                && this.options.open
            ) {
                opened = true;
                open(serverlink);
            }

            const openProcess = process.env.PLURID_OPEN === 'false' ? false : true;
            if (openProcess && !opened) {
                open(serverlink);
            }
        } catch (error) {
            return;
        }
    }
}
