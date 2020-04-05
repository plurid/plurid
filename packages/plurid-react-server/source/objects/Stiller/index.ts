import puppeteer from 'puppeteer';

import {
    StillerOptions,
} from '../../data/interfaces';



const render = async (
    url: string,
) => {
    const start = Date.now();

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        /**
         * `networkidle0` waits for the network to be idle (no requests for 500ms).
         */
        await page.goto(
            url,
            {
                waitUntil: 'networkidle0',
            },
        );
    } catch (err) {
        console.error(err);
        throw new Error('page timed out.');
    }

    const html = await page.content();
    await browser.close();

    const ttRenderMs = Date.now() - start;
    console.info(`Rendered ${url} in: ${ttRenderMs}ms`);

    return {
        html,
        ttRenderMs,
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
    private routes: string[];

    constructor(
        options: StillerOptions,
    ) {
        const {
            routes,
        } = options;

        this.routes = routes;
    }

    async * still() {
        for (const route of this.routes) {
            yield await render(route);
        }
    }
}


export default Stiller;
