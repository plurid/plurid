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

/** Whether `error` is the module system saying `name` itself is not installed (not one of its own imports). */
const isMissingPackage = (
    error: unknown,
    name: string,
) => {
    const code = (error as NodeJS.ErrnoException | undefined)?.code;
    const message = error instanceof Error ? error.message : String(error);
    return (code === 'ERR_MODULE_NOT_FOUND' || code === 'MODULE_NOT_FOUND')
        && (message.includes(`'${name}'`) || message.includes(`"${name}"`));
};


/**
 * THE OPTIONAL PEER, LOADED WHEN STILLS ARE MADE: `puppeteer` (>= 22) through a dynamic `import()`,
 * which both builds of this package keep native. It was a `require`, which the ESM build turns into a
 * shim that throws "Dynamic require … is not supported" — and the catch then reported an INSTALLED
 * puppeteer as not installed (2026-09-29). "Not installed" is said only when puppeteer itself is
 * missing; any other failure is reported as a failure to load, with its reason.
 */
export const loadPuppeteer = async (): Promise<any> => {
    let namespace: any;
    try {
        namespace = await import('puppeteer');
    } catch (error) {
        if (isMissingPackage(error, 'puppeteer')) {
            throw new Error(
                "Plurid Stiller: the optional 'puppeteer' dependency is not installed. "
                + 'Install it to generate stills (npm install puppeteer).',
                { cause: error },
            );
        }

        const reason = error instanceof Error ? error.message : String(error);
        throw new Error(
            `Plurid Stiller: 'puppeteer' is installed but could not be loaded: ${reason}`,
            { cause: error },
        );
    }

    // the instance (the ESM default, a CommonJS `module.exports`), else the namespace's named `launch`
    const puppeteer = typeof namespace?.default?.launch === 'function'
        ? namespace.default
        : namespace;
    if (!puppeteer || typeof puppeteer.launch !== 'function') {
        throw new Error(
            "Plurid Stiller: the loaded 'puppeteer' has no `launch`; install puppeteer >= 22.",
        );
    }
    return puppeteer;
};


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
        const response = await page.goto(
            url,
            {
                waitUntil: configuration.waitUntil,
                timeout: configuration.timeout,
            },
        );

        // A still is served as the route's page with a 200: a 404 or 500 answered here would become
        // one (2026-09-29, the status was never read).
        const status = typeof response?.status === 'function'
            ? response.status()
            : undefined;
        if (typeof status === 'number' && status >= 400) {
            throw new Error(`the server answered ${status}`);
        }

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
    private puppeteer: any;
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
            puppeteer,
        } = options;

        // `puppeteer` is an OPTIONAL dependency — only stills generation needs it, not SSR: loaded by
        // `still()` (`loadPuppeteer`, with an actionable message) unless the caller already has it.
        this.puppeteer = puppeteer;
        this.host = host;
        this.routes = routes;
        this.configuration = configuration;
    }

    async * still() {
        const puppeteer = this.puppeteer ?? await loadPuppeteer();

        // One browser for ALL routes — launching a browser costs seconds; a page is cheap. Always closed.
        const browser = await puppeteer.launch({
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
