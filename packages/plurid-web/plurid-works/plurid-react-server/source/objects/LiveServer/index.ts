// #region imports
    // #region libraries
    import {
        Socket,
    } from 'net';
    import http from 'http';

    import express, {
        Application,
    } from 'express';
    // #endregion libraries


    // #region external
    import {
        PluridLiveServerOptions,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
class LiveServer {
    private options: PluridLiveServerOptions;
    private expressServer: Application;
    private httpServer: http.Server;
    private sockets: Socket[] = [];


    constructor(
        options?: Partial<PluridLiveServerOptions>,
    ) {
        this.options = this.resolveOptions(options);

        this.expressServer = express();
        this.setupExpressServer();

        this.httpServer = http.createServer(this.expressServer);
        this.setupHttpServer();
    }


    private resolveOptions = (
        options?: Partial<PluridLiveServerOptions>,
    ) => {
        const defaultServerPath = './source/server/index.ts';

        const resolvedOptions = {
            server: options?.server || defaultServerPath,
        };

        return resolvedOptions;
    }

    private setupExpressServer() {

    }

    private setupHttpServer() {
        this.httpServer.on('connection', (socket) => {
            this.sockets.push(socket);

            socket.once('close', () => {
                this.sockets.splice(this.sockets.indexOf(socket), 1);
            });
        });

        this.httpServer.on('error', (error) => {
            throw error;
        });
    }


    public start() {

    }
}
// #endregion module



// #region exports
export default LiveServer;
// #endregion exports
