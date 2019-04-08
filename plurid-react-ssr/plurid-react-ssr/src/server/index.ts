// import { IncomingMessage, ServerResponse } from 'http';
// import { parse as parseUrl, UrlWithParsedQuery } from 'url';
// import { parse as parseQs, ParsedUrlQuery } from 'querystring';



export interface ServerOptions {
    quiet: boolean;
}


export default class Server {
    quiet: boolean

    constructor(options: ServerOptions) {
        this.quiet = options.quiet;
    }

    private logError(...args: any): void {
        if (this.quiet) return
        // tslint:disable-next-line
        console.error(...args)
    }

    public logs(err: any) {
        this.logError(err);
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

}
