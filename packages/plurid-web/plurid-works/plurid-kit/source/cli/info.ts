// #region imports
    // #region libraries
    import fs from 'fs';
    import path from 'path';
    // #endregion libraries


    // #region internal
    import {
        loadEnvironment,
        DEFAULT_DEV_PORT,
    } from './environment';
    // #endregion internal
// #endregion imports



// #region module
/**
 * `plurid info` - print the resolved environment and the files the CLI will use,
 * without building anything. A quick sanity check before `plurid dev`.
 */
export async function info(
    _argv: string[],
): Promise<void> {
    const mode = process.env.ENV_MODE || 'development';
    loadEnvironment(mode);

    const cwd = process.cwd();
    const exists = (relative: string) => fs.existsSync(path.resolve(cwd, relative));
    const mark = (relative: string) => (exists(relative) ? 'ok ' : '-- ');

    const lines = [
        'plurid info',
        '',
        `  cwd            ${cwd}`,
        `  mode           ${mode}`,
        `  port           ${process.env.PORT || DEFAULT_DEV_PORT}`,
        '',
        '  entry points',
        `    ${mark('source/server/index.ts')}source/server/index.ts`,
        `    ${mark('source/client/index.tsx')}source/client/index.tsx`,
        '',
        '  conventions',
        `    ${mark('plurid.config.ts')}plurid.config.ts`,
        `    ${mark('tsconfig.json')}tsconfig.json (esbuild reads ~ aliases)`,
        `    ${mark('source/public')}source/public (favicons, manifest, robots)`,
        '',
    ];

    process.stdout.write(lines.join('\n') + '\n');
}
// #endregion module
