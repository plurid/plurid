// #region imports
    // #region libraries
    import fs from 'fs';
    // #endregion libraries


    // #region internal
    import {
        loadEnvironment,
    } from './environment';
    import {
        loadPluridConfig,
    } from './config';
    import {
        resolvePaths,
    } from './paths';
    import {
        isPortFree,
        superviseServer,
    } from './process';
    // #endregion internal
// #endregion imports



// #region module
/**
 * `plurid start` - run the production server (`build/index.js`) with
 * `ENV_MODE=production`. The container `CMD`. Honours `$PORT` (createPluridServer
 * starts on it). Requires a prior `plurid build`.
 *
 * A supervisor: the signals it receives reach the server, and it ends as the
 * server did (`superviseServer`). A present but broken `plurid.config.ts` is
 * fatal, as in `plurid build`: it names the build directory to run.
 */
export async function start(
    argv: string[],
): Promise<void> {
    const mode = 'production';
    loadEnvironment(mode);

    const paths = resolvePaths(await loadPluridConfig(process.cwd(), { strict: true }));
    if (!fs.existsSync(paths.serverEntry)) {
        process.stderr.write(
            `[plurid start] ${paths.serverEntry} not found - run \`plurid build\` first.\n`,
        );
        process.exit(1);
    }

    const port = readPort(argv) || process.env.PORT || '8080';

    // the same pre-flight as `plurid dev`: a busy port is a message, not a crashed child
    if (!(await isPortFree(Number(port)))) {
        process.stderr.write(`[plurid start] port ${port} is already in use — stop the other server or pass --port <n>\n`);
        process.exit(1);
    }

    superviseServer(paths.serverEntry, {
        ...process.env,
        PORT: String(port),
        ENV_MODE: mode,
        NODE_ENV: mode,
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
