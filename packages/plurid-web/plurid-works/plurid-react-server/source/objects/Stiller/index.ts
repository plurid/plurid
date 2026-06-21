// #region imports
    // #region external
    import {
        StillerOptions,
        StillerConfiguration,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
/**
 * Replace the rendering viewport resolution in order to reduce the loading flash.
 * Exported for unit testing — it is the one pure, deterministic piece of the Puppeteer-driven Stiller.
 * @param html
 */
export const replacePluridResolution = (
    html: string,
) => {
    const normalResolution = 'width: 1366px; height: 768px;';
    const zeroResolution = 'width: 0px; height: 0px;';
    return html.replace(normalResolution, zeroResolution);
}

/**
 * https://techoverflow.net/2019/11/08/how-to-fix-puppetteer-running-as-root-without-no-sandbox-is-not-supported/
 * `process.getuid` is POSIX-only (absent on Windows) — guard before calling so the Stiller doesn't
 * crash with `process.getuid is not a function`.
 */
const isCurrentUserRoot = () => {
    return typeof process.getuid === 'function' && process.getuid() === 0;
}

/**
 * Still a single route on an ALREADY-LAUNCHED browser (one browser is reused across all routes — see
 * `still()`). A fresh page per route; the page is always closed, even on navigation failure.
 */
const render = async (
    browser: any,
    host: string,
    route: string,
    configuration: StillerConfiguration,
) => {
    const start = Date.now();

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

        const pageContent = await page.content();
        const html = replacePluridResolution(pageContent);

        const stilltime = Date.now() - start;
        console.info(`\tStilled '${route}' in ${(stilltime / 1000).toFixed(2)} seconds.`);

        return {
            route,
            html,
            stilltime,
        };
    } catch (error) {
        // Preserve the underlying Puppeteer reason (timeout / navigation / DNS) — in the message (so it
        // surfaces everywhere) AND as the native `cause` (lib ES2022).
        const reason = error instanceof Error ? error.message : String(error);
        throw new Error(`Could not still '${route}': ${reason}`, { cause: error });
    } finally {
        await page.close();
    }
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
    private puppeteer: any = null;
    private host: string;
    private routes: string[];
    private configuration: StillerConfiguration;

    constructor(
        options: StillerOptions,
    ) {
        // `puppeteer` is an OPTIONAL dependency — only stills generation needs it, not SSR. Stay null on
        // a missing install; `still()` fails fast with an actionable message instead of an `undefined` crash.
        try {
            this.puppeteer = require('puppeteer');
        } catch (_error) {
            this.puppeteer = null;
        }

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
        if (!this.puppeteer) {
            throw new Error(
                "Plurid Stiller: the optional 'puppeteer' dependency is not installed. "
                + 'Install it to generate stills (npm install puppeteer).',
            );
        }

        // One browser for ALL routes — launching a browser costs seconds; a page is cheap. Always closed.
        const browser = await this.puppeteer.launch({
            defaultViewport: {
                width: 1366,
                height: 768,
            },
            headless: true,
            args: isCurrentUserRoot() ? ['--no-sandbox'] : undefined,
        });

        try {
            for (const route of this.routes) {
                yield await render(
                    browser,
                    this.host,
                    route,
                    this.configuration,
                );
            }
        } finally {
            await browser.close();
        }
    }
}
// #endregion module



// #region exports
export default Stiller;
// #endregion exports
