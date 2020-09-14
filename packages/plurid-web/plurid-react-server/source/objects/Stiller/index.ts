import puppeteer from 'puppeteer';

import {
    StillerOptions,
    StillerConfiguration,
} from '../../data/interfaces';



/**
 * Replace the rendering viewport resolution in order to reduce the loading flash.
 * @param html
 */
const replacePluridResolution = (
    html: string,
) => {
    const normalResolution = 'width: 1366px; height: 768px;';
    const zeroResolution = 'width: 0px; height: 0px;';
    return html.replace(normalResolution, zeroResolution);
}

/**
 * https://techoverflow.net/2019/11/08/how-to-fix-puppetteer-running-as-root-without-no-sandbox-is-not-supported/
 */
const isCurrentUserRoot = () => {
    // UID 0 is always root
    return process.getuid() == 0;
}

const render = async (
    host: string,
    route: string,
    configuration: StillerConfiguration,
) => {
    const start = Date.now();

    const browser = await puppeteer.launch({
        defaultViewport: {
            width: 1366,
            height: 768,
        },
        headless: true,
        args: isCurrentUserRoot() ? ['--no-sandbox'] : undefined,
    });
    const page = await browser.newPage();

    try {
        /**
         * `networkidle0` waits for the network to be idle (no requests for 500ms).
         */
        const url = host + route;
        await page.goto(
            url,
            {
                waitUntil: configuration.waitUntil,
                timeout: configuration.timeout,
            },
        );
    } catch (err) {
        throw new Error(`${route} timed out.`);
    }

    const pageContent = await page.content();
    const html = replacePluridResolution(pageContent);
    await browser.close();

    const stilltime = Date.now() - start;
    console.info(`\tStilled '${route}' in ${(stilltime / 1000).toFixed(2)} seconds.`);

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
    private configuration: StillerConfiguration;

    constructor(
        options: StillerOptions,
    ) {
        const {
            host,
            routes,
            configuration,
        } = options;

        this.host = host;
        this.routes = routes;
        this.configuration = configuration;
    }

    async * still() {
        for (const route of this.routes) {
            yield await render(
                this.host,
                route,
                this.configuration,
            );
        }
    }
}


export default Stiller;
