import {
    Server,
} from 'http';

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
    router,
} from '@plurid/plurid-engine';

import {
    DEFAULT_SERVER_PORT,
    DEFAULT_SERVER_OPTIONS,
} from '../../data/constants';

import {
    PluridServerRouting,
    PluridServerMiddleware,
    PluridServerService,
    PluridServerServicesData,
    PluridServerOptions,
    PluridServerPartialOptions,
    PluridServerConfiguration,
} from '../../data/interfaces';

import PluridRenderer from '../Renderer';
import PluridContentGenerator from '../ContentGenerator';



const PluridRouter = router.default;


export default class PluridServer<T> {
    private routing: PluridServerRouting;
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
            routing,
            helmet,
            styles,
            middleware,
            services,
            servicesData,
            options,
        } = configuration;

        this.routing = routing;
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

    static analysis(pluridServer: PluridServer<any>) {
        return {
            routing: pluridServer.routing,
        };
    }

    public start(
        port = this.port,
    ) {
        this.port = port;

        const serverlink = `http://localhost:${port}`;

        if (!this.options.quiet) {
            console.log(`\n\tPlurid Server Started on Port ${port}: ${serverlink}\n`);
        }

        this.server = this.serverApplication.listen(port);

        const openProcess = process.env.PLURID_OPEN === 'false' ? false : true;
        if (this.options.open || openProcess) {
            open(serverlink);
        }

        return this.server;
    }

    public stop() {
        if (!this.options.quiet) {
            console.log(`\n\tPlurid Server Closed on Port ${this.port}\n`);
        }

        if (this.server) {
            this.server.close();
        }
    }

    private computeApplication() {
        this.loadMiddleware();

        const router = new PluridRouter<T>(this.routing.routes);

        this.serverApplication.get('*', (request, response) => {
            const url = request.originalUrl || request.url;
            const route = router.match(url);

            if (!route) {
                const notFoundRoute = router.match('/not-found');
                if (!notFoundRoute) {
                    response.send('Not Found');
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

    private renderApplication<T>(
        route: router.MatcherResponse<T>,
    ) {
        const {
            content,
            styles,
        } = this.getContentAndStyles<T>(
            route,
        );

        const stringedStyles = this.styles.reduce(
            (accumulator, style) => accumulator + style,
            '',
        );
        const mergedStyles = styles + stringedStyles;

        const {
            helmet,
        } = this.helmet;

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

    private getContentAndStyles<T>(
        route: router.MatcherResponse<T>,
    ) {
        const sheet = new ServerStyleSheet();
        let content = '';
        let styles = '';

        try {
            // based on the route get the specific plurids to be rendered
            const pluridContext = {};

            const contentHandler = new PluridContentGenerator<T>(
                this.services,
                this.servicesData,
                sheet,
                this.helmet,
                route,
                this.routing,
                pluridContext,
            );

            content = contentHandler.render();

            styles = sheet.getStyleTags();
        } catch (error) {
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
            compression: typeof partialOptions?.compression == 'boolean'
                ? partialOptions?.compression
                : true,
            open: typeof partialOptions?.open == 'boolean'
                ? partialOptions?.open
                : false,
            buildDirectory: partialOptions?.buildDirectory || DEFAULT_SERVER_OPTIONS.BUILD_DIRECTORY,
            root: partialOptions?.root || 'root',
            script: partialOptions?.script || '/index.js',
            vendorScript: partialOptions?.vendorScript || '/vendor.js',
        };
        return options;
    }

    private configureServer() {
        this.serverApplication.disable('x-powered-by');

        if (this.options.compression) {
            this.serverApplication.use(
                compression(),
            );
        }

        this.serverApplication.use(
            express.static(this.options.buildDirectory),
        );
    }

    private loadMiddleware() {
        for (const middleware of this.middleware) {
            this.serverApplication.use(
                (req, res, next) => middleware(req, res, next),
            );
        }
    }
}
