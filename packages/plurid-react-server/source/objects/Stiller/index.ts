import puppeteer from 'puppeteer';

import {
    StillerOptions,
} from '../../data/interfaces';



const render = async (
    host: string,
    route: string,
) => {
    const start = Date.now();

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        /**
         * `networkidle0` waits for the network to be idle (no requests for 500ms).
         */
        const url = host + route;
        await page.goto(
            url,
            {
                waitUntil: 'networkidle0',
            },
        );
    } catch (err) {
        throw new Error(`${route} timed out.`);
    }

    const html = await page.content();
    await browser.close();

    const stilltime = Date.now() - start;
    console.info(`\tStilled '${route}' in: ${stilltime / 1000} seconds.`);

    return {
        route,
        html,
        stilltime,
    };
}


/**
 * The Server will parse the given application routes,
 * and will decide which ones to send to the Stiller.
 *
 * The Stiller spins a server, accesses the routes,
 * views the application routes as a browser,
 * extracts the HTML of the plurid pages,
 * and returns a data structure which will be used by the Server
 * to serve the adequate plurid space structure when asked for the given route.
 */
class Stiller {
    private host: string;
    private routes: string[];

    constructor(
        options: StillerOptions,
    ) {
        const {
            host,
            routes,
        } = options;

        this.host = host;
        this.routes = routes;
    }

    async * still() {
        for (const route of this.routes) {
            yield await render(this.host, route);
        }
    }
}


export default Stiller;
