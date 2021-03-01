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
    // #endregion libraries


    // #region external
    import {
        environment,

        DEFAULT_SERVER_PORT,
        DEFAULT_SERVER_OPTIONS,
    } from '../../data/constants';

    import {
        PluridRoutesServerOptions,
        PluridRoutesServerPartialOptions,
        PluridRoutesServerConfiguration,
    } from '../../data/interfaces';
    // #endregion external
// #endregion imports



// #region module
class PluridRoutesServer {
    private options: PluridRoutesServerOptions;
    private serverApplication: Express;
    private server: Server | undefined;
    private port: number | string;


    constructor(
        configuration?: PluridRoutesServerConfiguration,
    ) {
        this.options = this.handleOptions(configuration?.options);

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
            console.info(`\n\t[${time.stamp()}]: ${this.options.serverName} Started on Port ${port}: ${serverlink}\n`);
        }

        this.server = this.serverApplication.listen(port);

        return this.server;
    }

    public stop() {
        if (!this.options.quiet) {
            console.info(`\n\t[${time.stamp()}]: ${this.options.serverName} Closed on Port ${this.port}\n`);
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
        this.serverApplication.get('*', async (request, response, next) => {
            try {
                console.log(
                    `[${time.stamp()}]: GET ${request.path}`,
                );

                response.json({
                    elementql: '/path/to/elementql',
                });

                return;
            } catch (error) {
                console.log(
                    `[${time.stamp()}]: Could not handle GET ${request.path}`,
                    error,
                );

                response
                    .status(500)
                    .send('Server Error');
                return;
            }
        });
    }

    private handleOptions(
        partialOptions?: PluridRoutesServerPartialOptions,
    ) {
        const options: PluridRoutesServerOptions = {
            serverName: partialOptions?.serverName || DEFAULT_SERVER_OPTIONS.SERVER_NAME,
            quiet: partialOptions?.quiet || DEFAULT_SERVER_OPTIONS.QUIET,
            debug: (partialOptions?.debug || environment.production) ? 'error' : 'info',
            ignore: partialOptions?.ignore || [],
        };
        return options;
    }

    private configureServer() {
        this.serverApplication.disable('x-powered-by');
    }
}
// #endregion module



// #region exports
export default PluridRoutesServer;
// #endregion exports
