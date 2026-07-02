// #region imports
    // #region libraries
    import fs from 'fs';
    import path from 'path';
    import { pathToFileURL } from 'url';

    import * as esbuild from 'esbuild';
    // #endregion libraries


    // #region internal
    import type {
        PluridConfig,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
const CONFIG_FILES = [
    'plurid.config.ts',
    'plurid.config.js',
];


/**
 * Load the app's `plurid.config.ts` for the CLI (the build-time subset:
 * `bundle.*`). The config is esbuild-bundled to a temp CJS file under
 * `node_modules/.plurid-kit/` (bare imports externalized, so importing the
 * config never drags the app's runtime modules into the CLI process) and
 * `require`d.
 *
 * Tolerates absence: an app without a config file gets `{}` (all defaults) -
 * the CLI works on convention alone.
 */
export async function loadPluridConfig(
    applicationDirectory: string = process.cwd(),
): Promise<Partial<PluridConfig>> {
    const configPath = CONFIG_FILES
        .map((file) => path.join(applicationDirectory, file))
        .find((file) => fs.existsSync(file));

    if (!configPath) {
        return {};
    }

    const outputDirectory = path.join(
        applicationDirectory, 'node_modules', '.plurid-kit',
    );
    const outputFile = path.join(outputDirectory, 'plurid.config.cjs');
    fs.mkdirSync(outputDirectory, { recursive: true });

    await esbuild.build({
        entryPoints: [configPath],
        outfile: outputFile,
        bundle: true,
        platform: 'node',
        format: 'cjs',
        logLevel: 'silent',
        plugins: [
            {
                name: 'externalize-bare-config',
                setup(build) {
                    build.onResolve({ filter: /.*/ }, (arguments_) => {
                        const id = arguments_.path;
                        if (
                            id.startsWith('.')
                            || id.startsWith('/')
                            || id.startsWith('~')
                        ) {
                            return undefined;
                        }
                        return { path: id, external: true };
                    });
                },
            },
        ],
    });

    // bust node's require cache so `plurid dev` watch relaunches see edits
    const url = pathToFileURL(outputFile).href + `?t=${Date.now()}`;
    try {
        const loaded = await import(url);
        const config = loaded.default?.default ?? loaded.default ?? loaded;
        return (config ?? {}) as Partial<PluridConfig>;
    } catch (error) {
        process.stderr.write(
            `[plurid] could not load ${path.basename(configPath)}: `
            + `${error instanceof Error ? error.message : String(error)}\n`,
        );
        return {};
    }
}
// #endregion module
