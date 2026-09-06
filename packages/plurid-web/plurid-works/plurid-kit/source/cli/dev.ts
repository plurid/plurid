// #region imports
    // #region libraries
    import { spawn, type ChildProcess } from 'child_process';

    import * as esbuild from 'esbuild';
    // #endregion libraries


    // #region internal
    import {
        clientBuildOptions,
        serverBuildOptions,
    } from './esbuild';

    import {
        loadPluridConfig,
    } from './config';
    import {
        resolvePaths,
    } from './paths';

    import {
        loadEnvironment,
        DEFAULT_DEV_PORT,
    } from './environment';

    import {
        createRestarter,
        isPortFree,
    } from './process';
    // #endregion internal
// #endregion imports



// #region module
/**
 * `plurid dev` - generalizes denote's `scripts/dev.cjs`.
 *
 * Loads `.env.development`, builds the client + server with esbuild (watch
 * contexts when `--watch`), then `spawn`s `node build/index.js` once with
 * `PORT` / `ENV_MODE`. esbuild auto-reads the app's `tsconfig.json` for the `~`
 * path aliases (the load-bearing detail).
 *
 * ONE node child at a time. `--watch` keeps the client + server BUNDLES rebuilding on change
 * (the browser picks up client changes on refresh) and RESTARTS the node process when the
 * server bundle is rebuilt — serialized (kill → wait for exit → spawn) and debounced, so two
 * servers never race for the port. A pre-flight check refuses to start on a port that is
 * already taken, with a clear message instead of a crash from the child.
 */
export async function dev(
    argv: string[],
): Promise<void> {
    const mode = 'development';
    // The deployment TARGET the bundles talk to, distinct from the build
    // semantics: 'local' (the default - constants' API URLs point at the local
    // mesh, matching the legacy dev.cjs behavior) vs 'development'/'production'
    // (the plurid.dev/.com domains). Overridable via ENV_MODE, e.g.
    // `ENV_MODE=development plurid dev` to develop against the dev cloud.
    const environmentMode = process.env.ENV_MODE || 'local';
    loadEnvironment(mode);

    const watch = argv.includes('--watch');
    const portArgument = readPort(argv);
    const port = portArgument
        || process.env.PORT
        || DEFAULT_DEV_PORT;

    // `plurid.config.ts` build-time knobs (`bundle.*`); absent config -> defaults.
    const config = await loadPluridConfig();
    const paths = resolvePaths(config);
    const bundle = config.bundle ?? {};

    const clientOptions = clientBuildOptions({
        mode,
        environmentMode,
        clientExternals: bundle.clientExternals,
        define: bundle.define,
        loaders: bundle.loaders,
        environment: bundle.environment,
        outdir: paths.clientDir,
    });
    const serverOptions = serverBuildOptions({
        mode,
        environmentMode,
        forceBundle: bundle.forceBundle,
        define: bundle.define,
        loaders: bundle.loaders,
        outdir: paths.buildDir,
    });

    const link = `http://localhost:${port}`;

    if (!(await isPortFree(Number(port)))) {
        process.stderr.write(`[plurid dev] port ${port} is already in use — stop the other server or pass --port <n>\n`);
        process.exit(1);
    }

    const spawnChild = (): ChildProcess => {
        const child = spawn('node', [paths.serverEntry], {
            stdio: 'inherit',
            env: {
                ...process.env,
                PORT: String(port),
                ENV_MODE: environmentMode,
                NODE_ENV: mode,
            },
        });
        return child;
    };

    if (watch) {
        // Watch contexts rebuild the bundles on change; the server child is restarted (serialized,
        // debounced) after each server-bundle rebuild.
        const restarter = createRestarter<ChildProcess>({
            spawnChild,
            debounceMs: 150,
            log: (message) => process.stdout.write(`[plurid dev] ${message}\n`),
        });
        let firstBuild = true;
        const clientContext = await esbuild.context(clientOptions);
        const serverContext = await esbuild.context({
            ...serverOptions,
            plugins: [
                ...(serverOptions.plugins || []),
                {
                    name: 'plurid-dev-restart',
                    setup(build) {
                        build.onEnd((result) => {
                            if (firstBuild || result.errors.length > 0) {
                                return;
                            }
                            restarter.restart();
                        });
                    },
                },
            ],
        });

        await clientContext.watch();
        await serverContext.watch();
        await clientContext.rebuild();
        await serverContext.rebuild();
        firstBuild = false;

        process.stdout.write('[plurid dev] watching client + server (the server restarts on server changes)\n');
        process.stdout.write(`[plurid dev] starting server on ${link}\n`);

        const child = restarter.start();
        const shutdown = async () => {
            await restarter.stop();
            await clientContext.dispose();
            await serverContext.dispose();
            process.exit(0);
        };
        process.once('SIGINT', shutdown);
        process.once('SIGTERM', shutdown);
        child.on('exit', () => { /* restarts are expected; the restarter owns the lifecycle */ });
        return;
    } else {
        await esbuild.build(clientOptions);
        await esbuild.build(serverOptions);
        process.stdout.write('[plurid dev] built client + server\n');
    }

    process.stdout.write(`[plurid dev] starting server on ${link}\n`);

    const child = spawnChild();
    child.on('exit', (code) => {
        process.exit(code || 0);
    });
}


function readPort(
    argv: string[],
): string | undefined {
    const index = argv.findIndex((argument) => argument === '--port' || argument === '-p');
    if (index !== -1 && argv[index + 1]) {
        return argv[index + 1];
    }

    const inline = argv.find((argument) => argument.startsWith('--port='));
    if (inline) {
        return inline.slice('--port='.length);
    }

    return undefined;
}
// #endregion module
