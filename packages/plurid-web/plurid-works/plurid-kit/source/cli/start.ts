// #region imports
    // #region libraries
    import { spawn } from 'child_process';
    import fs from 'fs';
    // #endregion libraries


    // #region internal
    import {
        loadEnvironment,
    } from './environment';
    // #endregion internal
// #endregion imports



// #region module
/**
 * `plurid start` - run the production server (`node build/index.js`) with
 * `ENV_MODE=production`. The container `CMD`. Honours `$PORT` (createPluridServer
 * starts on it). Requires a prior `plurid build`.
 */
export async function start(
    argv: string[],
): Promise<void> {
    const mode = 'production';
    loadEnvironment(mode);

    if (!fs.existsSync('build/index.js')) {
        process.stderr.write(
            '[plurid start] build/index.js not found - run `plurid build` first.\n',
        );
        process.exit(1);
    }

    const port = readPort(argv) || process.env.PORT || '8080';

    const child = spawn('node', ['build/index.js'], {
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
