import React from 'react';

import {
    Server,
} from 'http';

import express, {
    Express,
} from 'express';

import {
    DEFAULT_SERVER_PORT,
} from '../../data/constants';

import {
    PluridServerRoute,
    PluridServerMiddleware,
    PluridServerOptions,
    PluridServerPartialOptions,
    PluridServerConfiguration,
} from '../../data/interfaces';



export default class PluridServer {
    private Application: React.FC<any>;
    private routes: PluridServerRoute[];
    private index: string;
    private middleware: PluridServerMiddleware[];
    private options: PluridServerOptions;

    private serverApplication: Express;
    private server: Server | undefined;
    private port: number = DEFAULT_SERVER_PORT;

    constructor(
        configuration: PluridServerConfiguration,
    ) {
        const {
            Application,
            routes,
            index,
            middleware,
            options,
        } = configuration;

        this.Application = Application;
        this.routes = routes;
        this.index = index;
        this.middleware = middleware || [];
        this.options = this.handleOptions(options);

        this.serverApplication = express();

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
        console.log(
            this.Application,
            this.routes,
            this.index,
            this.middleware,
            this.options,
        );

        this.serverApplication.get('*', (request, response) => {
            console.log('Request on path:', request.path);
            response.send('<b>Plurid Server is on</b>');
        });
    }

    private handleOptions (
        partialOptions?: PluridServerPartialOptions,
    ) {
        const options: PluridServerOptions = {
            quiet: partialOptions?.quiet || false,
        };
        return options;
    }
}











    // private handleRequest(
    //     req: IncomingMessage,
    //     res: ServerResponse,
    //     parsedUrl?: UrlWithParsedQuery,
    // ): Promise<void> {
    //     // Parse url if parsedUrl not provided
    //     if (!parsedUrl || typeof parsedUrl !== 'object') {
    //         const url: any = req.url
    //         parsedUrl = parseUrl(url, true)
    //     }

    //     // Parse the querystring ourselves if the user doesn't handle querystring parsing
    //     if (typeof parsedUrl.query === 'string') {
    //         parsedUrl.query = parseQs(parsedUrl.query)
    //     }

    //     res.statusCode = 200
    //     return this.run(req, res, parsedUrl).catch((err) => {
    //         this.logError(err)
    //         res.statusCode = 500
    //         res.end('Internal Server Error')
    //     })
    // }

    // private async run(
    //     req: IncomingMessage,
    //     res: ServerResponse,
    //     parsedUrl: UrlWithParsedQuery,
    // ) {
    //     try {
    //         const fn = this.router.match(req, res, parsedUrl)
    //         if (fn) {
    //             await fn()
    //             return
    //         }
    //     } catch (err) {
    //         if (err.code === 'DECODE_FAILED') {
    //             res.statusCode = 400
    //             return this.renderError(null, req, res, '/_error', {})
    //         }
    //         throw err
    //     }

    //     if (req.method === 'GET' || req.method === 'HEAD') {
    //         await this.render404(req, res, parsedUrl)
    //     } else {
    //         res.statusCode = 501
    //         res.end('Not Implemented')
    //     }
    // }






// import { IncomingMessage, ServerResponse } from 'http';
// import { parse as parseUrl, UrlWithParsedQuery } from 'url';
// import { parse as parseQs, ParsedUrlQuery } from 'querystring';


// import path from 'path';
// import fs from 'fs';

// import React from 'react';
// import express from 'express';
// import { renderToString } from 'react-dom/server';

// import App from '../../../client/App';



// const PORT = process.env.PORT || 3366;
// const app = express();


// app.use(express.static('./build'));

// app.get('/*', (req, res) => {
//     const renderedApp = renderToString(<App />);

//     const indexFile = path.resolve('./build/index.html');
//     fs.readFile(indexFile, 'utf8', (err, data) => {
//         if (err) {
//             console.error('Something went wrong:', err);
//             return res.status(500).send('Oops, better luck next time!');
//         }

//         return res.send(
//             data.replace('<div id="root"></div>', `<div id="root">${renderedApp}</div>`)
//         );
//     });
// });

// app.listen(PORT, () => {
//     console.log(`Server is listening on port ${PORT}`);
// });





//     // import express, { Request, Response } from 'express';

//     // import { renderToString } from 'react-dom/server';
//     // import App from '../client/App';


//     // const works = 'Server-Side Rendering of Plurid Applications Frontend';
//     // console.log(works);
//     // const app = express();

//     // const PORT = process.env.PORT || 3360;


//     // app.get('/*', (req: Request, res: Response) => {
//     //     const reactDom = renderToString(App);

//     //     res.writeHead( 200, { "Content-Type": "text/html" } );
//     //     res.end(htmlTemplate(reactDom));
//     // });

//     // app.listen(PORT, () => {
//     //     console.log(`Listening on ${PORT}`);
//     // });


//     // function htmlTemplate(reactDom: any) {
//     //     return `
//     //         <!DOCTYPE html>
//     //         <html>
//     //         <head>
//     //             <meta charset="utf-8">
//     //             <title>React SSR</title>
//     //         </head>

//     //         <body>
//     //             <div id="app">${reactDom}</div>
//     //             <script src="./app.bundle.js"></script>
//     //         </body>
//     //         </html>
//     //     `;
//     // }
