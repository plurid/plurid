// #region imports
    // #region libraries
    import path from 'path';
    import http from 'http';

    import {
        promises as fs,
    } from 'fs'

    import {
        fork,
        ChildProcess,
    } from 'child_process';

    import {
        createRequire,
    } from 'module';

    import {
        randomUUID,
    } from 'crypto';

    import detectPort from 'detect-port';

    import {
        PluridReactRoute,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import {
        StillsGeneratorOptions,
    } from '~data/interfaces';

    import Stiller, {
        loadPuppeteer,
    } from '../Stiller';
    import PluridServer from '../Server';
    // #endregion external
// #endregion imports



// #region module
/**
 * The built server's module: loaded through a `require` made for its own path, which works from this
 * package's ESM build as from its CommonJS one. A bare `require` in the ESM build is esbuild's shim, which
 * throws "Dynamic require … is not supported", so the generator could not run from ESM at all (2026-09-29).
 */
const loadServerModule = (
    serverPath: string,
) => createRequire(serverPath)(serverPath);


/** Resolves once `url` answers anything; rejects when the server process exits first, or after `timeout` ms. */
const waitForServer = (
    url: string,
    child: ChildProcess,
    timeout: number,
) => new Promise<void>((resolve, reject) => {
    const deadline = Date.now() + timeout;
    let settled = false;
    const settle = (error?: Error) => {
        if (settled) {
            return;
        }
        settled = true;
        child.removeListener('exit', onExit);
        if (error) {
            reject(error);
        } else {
            resolve();
        }
    };
    const onExit = (code: number | null, signal: NodeJS.Signals | null) => {
        settle(new Error(
            `Plurid StillsGenerator: the server exited (${signal || code}) before it answered at ${url}.`,
        ));
    };
    child.once('exit', onExit);

    const probe = () => {
        if (settled) {
            return;
        }
        const request = http.get(url, (response) => {
            response.resume();
            settle();
        });
        request.on('error', () => {
            if (Date.now() > deadline) {
                settle(new Error(`Plurid StillsGenerator: the server did not answer at ${url} within ${timeout} ms.`));
                return;
            }
            setTimeout(probe, 100);
        });
    };
    probe();
});


/** Stop the forked server and wait until it has gone (a hard kill if it does not go). */
const stopServer = (
    child: ChildProcess,
) => new Promise<void>((resolve) => {
    if (child.exitCode !== null || child.signalCode !== null) {
        resolve();
        return;
    }
    const fallback = setTimeout(() => {
        child.kill('SIGKILL');
    }, 5_000);
    child.once('exit', () => {
        clearTimeout(fallback);
        resolve();
    });
    child.kill('SIGTERM');
});


class StillsGenerator {
    private options: StillsGeneratorOptions;

    constructor(
        options?: Partial<StillsGeneratorOptions>,
    ) {
        this.options = this.resolveOptions(options);
    }

    resolveOptions(
        options?: Partial<StillsGeneratorOptions>,
    ) {
        const stillsGeneratorOptions: StillsGeneratorOptions = {
            server: options?.server ?? './build/server.js',
            build: options?.build ?? './build/',
        };

        return stillsGeneratorOptions;
    }

    async initialize() {
        // `resolve`, not `join`: an absolute path stays itself
        const serverPath = path.resolve(process.cwd(), this.options.server);
        const buildPath = path.resolve(process.cwd(), this.options.build);

        // The generator reads the application routes from the BUILT server bundle — fail with an actionable
        // message (not a raw MODULE_NOT_FOUND) if it hasn't been built yet. Handle either default-exported
        // (esbuild/tsup `export default`) or directly-exported server instances.
        let serverModule: any;
        try {
            serverModule = loadServerModule(serverPath);
        } catch (error) {
            const reason = error instanceof Error ? error.message : String(error);
            throw new Error(
                `Plurid StillsGenerator: could not load the built server at '${serverPath}'. `
                + 'Build the server first so the generator can read its routes. '
                + `(${reason})`,
                { cause: error },
            );
        }
        const pluridServer: PluridServer = serverModule?.default ?? serverModule;
        if (
            !pluridServer
            || !Array.isArray((pluridServer as any).routes)
            || !(pluridServer as any).options?.stiller
        ) {
            throw new Error(
                `Plurid StillsGenerator: the built server at '${serverPath}' does not export its PluridServer. `
                + 'Export the server instance (`export default server`) and start it only when the file is run '
                + '(`if (require.main === module) server.start(port)`); a kit entry that starts itself exports nothing.',
            );
        }
        const serverInformation = PluridServer.analysis(pluridServer);

        const stillerOptions = serverInformation.options.stiller;

        // The optional peer is checked BEFORE a server is forked: a missing puppeteer used to surface only
        // after the fork and a fixed wait.
        const puppeteer = await loadPuppeteer();

        const serverPort = await detectPort(9900) + '';
        const host = 'http://localhost:' + serverPort;

        // The server runs with the environment the generator was given (PATH, NODE_ENV, the secrets its
        // preserves read): it was given only PORT, and rendered without them (2026-09-29).
        const child = fork(serverPath, [], {
            stdio: 'pipe',
            env: {
                ...process.env,
                PORT: serverPort,
                PLURID_OPEN: 'false',
            },
        });

        // Always stop the forked server — even if stilling throws partway — so it never outlives the run.
        try {
            /**
             * Read the application routes.
             */
            const stillRoutes: PluridReactRoute[] = [];

            for (const route of serverInformation.routes) {
                if (route.value.includes('/:')) {
                    continue;
                }

                if (stillerOptions.ignore.includes(route.value)) {
                    continue;
                }

                stillRoutes.push(route);
            }

            const stillRoutesPaths = stillRoutes.map(stillRoute => stillRoute.value);

            console.info('\n\tParsed the following still routes:');

            for (const stillRoutePath of stillRoutesPaths) {
                console.info(`\t  ${stillRoutePath}`);
            }


            /**
             * The server is up when it answers (it was a fixed 1.5 s sleep).
             */
            await waitForServer(host + '/', child, stillerOptions.timeout || 30_000);

            const startTime = Date.now();
            const estimatedDuration = 3 * serverInformation.routes.length;
            console.info(`\n\tStarting to generate stills... (this may take about ${estimatedDuration} seconds)\n`);

            const stiller = new Stiller({
                host,
                routes: [
                    ...stillRoutesPaths,
                ],
                configuration: {
                    waitUntil: stillerOptions.waitUntil,
                    timeout: stillerOptions.timeout,
                },
                puppeteer,
            });

            // A Stiller failure (a navigation timeout, an error status) propagates out of this loop, aborting
            // the run with the underlying reason — rather than silently writing partial/empty stills.
            const sequence = stiller.still();
            const stills = [];
            let next;
            while (
                !(next = await sequence.next()).done
            ) {
                stills.push(next.value);
            }

            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;
            const plural = stills.length === 1 ? '' : 's';
            console.info(`\n\tGenerated ${stills.length} still${plural} in ${duration.toFixed(2)} seconds.\n`);


            /**
             * Generate the stills as .json in the `/stills` build directory
             * so they can be loaded by the Plurid Server
             *
             * Generate a metadata.json file.
             */
            const stillsPath = path.join(buildPath, './stills');
            await fs.mkdir(
                stillsPath,
                {
                    recursive: true,
                },
            );

            const metadataFile = [];

            for (const still of stills) {
                if (!still) {
                    continue;
                }

                // `randomUUID`: `uuid.generate()` answers '' where the global object is not tagged
                // `[object global]` (a vm context), and every still was written to the same `.json`
                const stillName = randomUUID() + '.json';
                const metadataItem = {
                    route: still.route,
                    name: stillName,
                };
                metadataFile.push(metadataItem);
                const stillJSON = JSON.stringify(still, null, 4);
                const stillFile = path.join(stillsPath, stillName);
                await fs.writeFile(stillFile, stillJSON);
            }

            const metadataFilePath = path.join(stillsPath, 'metadata.json');
            const metadataJSON = JSON.stringify(metadataFile, null, 4);
            await fs.writeFile(metadataFilePath, metadataJSON);
        } finally {
            /**
             * Gracefully stop the forked server (it handles SIGTERM via `attachSignalHandlers`), and wait for it.
             */
            await stopServer(child);
        }
    }
}
// #endregion module



// #region exports
export default StillsGenerator;
// #endregion exports
