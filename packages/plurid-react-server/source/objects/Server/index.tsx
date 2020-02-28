import {
    Server,
} from 'http';

import express, {
    Express,
} from 'express';

import open from 'open';

import React from 'react';

import {
    ServerStyleSheet,
} from 'styled-components';

import {
    Helmet,
} from 'react-helmet-async';

import {
    DEFAULT_SERVER_PORT,
    DEFAULT_SERVER_OPTIONS,
} from '../../data/constants';

import {
    PluridServerRoute,
    PluridServerMiddleware,
    PluridServerService,
    PluridServerServicesData,
    PluridServerOptions,
    PluridServerPartialOptions,
    PluridServerConfiguration,
} from '../../data/interfaces';

import Renderer from '../Renderer';
import Router from '../Router';
import ContentHandler from '../ContentHandler';



export default class PluridServer {
    private Application: React.FC<any>;
    private routes: PluridServerRoute[];
    private helmet: Helmet;
    private styles: string[];
    private middleware: PluridServerMiddleware[];
    private services: PluridServerService[];
    private servicesData: PluridServerServicesData | undefined;
    private options: PluridServerOptions;

    private serverApplication: Express;
    private server: Server | undefined;
    private port: number;
    private renderer: Renderer | undefined;

    constructor(
        configuration: PluridServerConfiguration,
    ) {
        const {
            Application,
            routes,
            helmet,
            styles,
            middleware,
            services,
            servicesData,
            options,
        } = configuration;

        this.Application = Application;
        this.routes = routes;
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

    public start(
        port = this.port,
    ) {
        this.port = port;

        const serverlink = `http://localhost:${port}`;

        if (!this.options.quiet) {
            console.log(`\n\tPlurid Server Started on Port ${port}: ${serverlink}\n`);
        }

        this.server = this.serverApplication.listen(port);

        if (this.options.open) {
            open(serverlink);
        }
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

        const router = new Router({
            routes: this.routes,
        });

        this.serverApplication.get('*', (request, response) => {
            const url = request.originalUrl || request.url;
            const route = router.match(url);

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
            } = this.helmet;

            const head = `
                ${helmet.meta.toString()}
                ${helmet.title.toString()}
                ${helmet.link.toString()}
            `;

            const store = this.servicesData?.reduxStore ?
                JSON.stringify(
                    this.servicesData?.reduxStore(
                        this.servicesData?.reduxStoreValue || {},
                    ).getState()
                ) : '';

            const {
                root,
                script,
            } = this.options;

            const stripeScript = this.servicesData?.stripeScript;

            this.renderer = new Renderer({
                content,
                head,
                styles: mergedStyles,
                store,
                root,
                script,
                stripeScript,
            });

            response.send(this.renderer?.html());
        });
    }

    private handleOptions(
        partialOptions?: PluridServerPartialOptions,
    ) {
        const options: PluridServerOptions = {
            quiet: partialOptions?.quiet || DEFAULT_SERVER_OPTIONS.QUIET,
            open: partialOptions?.open || false,
            buildDirectory: partialOptions?.buildDirectory || DEFAULT_SERVER_OPTIONS.BUILD_DIRECTORY,
            root: partialOptions?.root || 'root',
            script: partialOptions?.script || '/index.js',
        };
        return options;
    }

    private configureServer() {
        this.serverApplication.disable('x-powered-by');

        this.serverApplication.use(
            express.static(this.options.buildDirectory),
        );
    }

    private loadMiddleware() {
        for (const middleware of this.middleware) {
            this.serverApplication.use(
                middleware,
            );
        }
    }

    private getContentAndStyles(
        route: PluridServerRoute,
    ) {
        const sheet = new ServerStyleSheet();
        let content = '';
        let styles = '';

        try {
            const contentHandler = new ContentHandler(
                this.Application,
                this.services,
                this.servicesData,
                sheet,
                this.helmet,
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
}
