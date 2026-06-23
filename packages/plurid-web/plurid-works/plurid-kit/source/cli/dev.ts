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
        loadEnvironment,
        DEFAULT_DEV_PORT,
    } from './environment';
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
 * Matches denote's proven flow: a SINGLE node child. `--watch` keeps the client
 * + server BUNDLES rebuilding on change (the browser picks up client changes on
 * refresh); the node process is not auto-restarted on a server-bundle change
 * (restart `plurid dev` for server changes - same as `dev.cjs` today). Auto
 * server-restart is a deferred enhancement (a serialized relaunch on a
 * `build/index.js` file-watch), intentionally omitted here to avoid a
 * spawn/port race.
 */
export async function dev(
    argv: string[],
): Promise<void> {
    const mode = 'development';
    loadEnvironment(mode);

    const watch = argv.includes('--watch');
    const portArgument = readPort(argv);
    const port = portArgument
        || process.env.PORT
        || DEFAULT_DEV_PORT;

    const clientOptions = clientBuildOptions({ mode });
    const serverOptions = serverBuildOptions({ mode });

    const link = `http://localhost:${port}`;

    if (watch) {
        // Watch contexts rebuild the bundles on change; node is spawned once below
        // (matches dev.cjs: watch() then rebuild() to guarantee the first build).
        const clientContext = await esbuild.context(clientOptions);
        const serverContext = await esbuild.context(serverOptions);

        await clientContext.watch();
        await serverContext.watch();
        await clientContext.rebuild();
        await serverContext.rebuild();

        process.stdout.write('[plurid dev] watching client + server\n');
    } else {
        await esbuild.build(clientOptions);
        await esbuild.build(serverOptions);
        process.stdout.write('[plurid dev] built client + server\n');
    }

    process.stdout.write(`[plurid dev] starting server on ${link}\n`);

    const child: ChildProcess = spawn('node', ['build/index.js'], {
        stdio: 'inherit',
        env: {
            ...process.env,
            PORT: String(port),
            ENV_MODE: mode,
            NODE_ENV: mode,
        },
    });
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
