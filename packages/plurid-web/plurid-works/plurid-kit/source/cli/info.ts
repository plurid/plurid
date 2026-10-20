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
    import {
        CONFIG_FILES,
        loadPluridConfig,
    } from './config';
    import {
        resolvePaths,
    } from './paths';
    import {
        readBuildMode,
    } from './manifest';
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
    // the directories the config names, as `dev` and `build` read them (a broken config warns, as in
    // `dev`): the conventional paths were checked whatever the config said (2026-10-20)
    const paths = resolvePaths(await loadPluridConfig(cwd));
    const configFile = CONFIG_FILES.find((file) => exists(file)) ?? CONFIG_FILES[0];

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
        `    ${mark(configFile)}${configFile}`,
        `    ${mark('tsconfig.json')}tsconfig.json (esbuild reads ~ aliases)`,
        `    ${mark(paths.publicDir)}${paths.publicDir} (favicons, manifest, robots; \`publicDir\`)`,
        `    ${mark(paths.buildDir)}${paths.buildDir} (\`buildDir\`; ${exists(paths.buildDir) ? (readBuildMode(paths) ?? 'unknown') + ' build' : 'not built'})`,
        '',
    ];

    process.stdout.write(lines.join('\n') + '\n');
}
// #endregion module
