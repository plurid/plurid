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

    try {
        await esbuild.build({
            entryPoints: [configPath],
            outfile: outputFile,
            bundle: true,
            platform: 'node',
            format: 'cjs',
            logLevel: 'silent',
            // The config imports the app's product surface (routes/shell), whose
            // graph can reach binary assets - and the asset loader map lives IN
            // the config being loaded. Break the cycle: evaluate assets as empty
            // modules (config evaluation runs module top-levels only, it never
            // renders), so any app's config bundles regardless of its assets.
            loader: {
                '.ttf': 'empty', '.woff': 'empty', '.woff2': 'empty',
                '.png': 'empty', '.jpg': 'empty', '.jpeg': 'empty',
                '.svg': 'empty', '.gif': 'empty', '.mov': 'empty',
                '.mp4': 'empty', '.webm': 'empty', '.ico': 'empty',
            },
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
    } catch (error) {
        // A config that cannot BUNDLE must not kill the CLI - warn loudly and
        // fall back to convention (the silent-{} failure mode hides real
        // problems, so name the file and the first error).
        process.stderr.write(
            `[plurid] could not bundle ${path.basename(configPath)}; `
            + `continuing without it: `
            + `${error instanceof Error ? error.message.split('\n')[0] : String(error)}\n`,
        );
        return {};
    }

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
