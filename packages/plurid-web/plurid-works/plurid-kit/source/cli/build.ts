// #region imports
    // #region libraries
    import fs from 'fs';
    import path from 'path';

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
    } from './environment';
    // #endregion internal
// #endregion imports



// #region module
/**
 * `plurid build` - the production esbuild pass. Replaces the legacy webpack /
 * rollup `scripts/workings/`.
 *
 * Produces `build/{index.js, client/**, public/**}` (the artifact the `web-app`
 * chart already serves), minified, `ENV_MODE=production`. Copies
 * `source/public/**` -> `build/public/` and writes `build/asset-manifest.json`
 * with the real client entry path (derived from the esbuild metafile), so the
 * server template points `<script src>` at the actually-emitted file instead of
 * a hardcoded `/index.js` / `/vendor.js`.
 */
export async function build(
    argv: string[],
): Promise<void> {
    const mode = 'production';
    loadEnvironment(mode);

    // `plurid.config.ts` build-time knobs (`bundle.*`) and the directories; absent config -> defaults.
    // Present but broken is FATAL here: the artifact would ignore its `buildDir`, `define`, `environment`.
    const config = await loadPluridConfig(process.cwd(), { strict: true });
    const bundle = config.bundle ?? {};
    const paths = resolvePaths(config);

    const clean = !argv.includes('--no-clean');
    if (clean && fs.existsSync(paths.buildDir)) {
        fs.rmSync(paths.buildDir, { recursive: true, force: true });
    }

    // client (browser, minified, single iife bundle) + server (node, minified)
    const clientResult = await esbuild.build(
        clientBuildOptions({
            mode,
            metafile: true,
            clientExternals: bundle.clientExternals,
            define: bundle.define,
            loaders: bundle.loaders,
            environment: bundle.environment,
            outdir: paths.clientDir,
        }),
    );
    await esbuild.build(
        serverBuildOptions({
            mode,
            metafile: true,
            forceBundle: bundle.forceBundle,
            define: bundle.define,
            loaders: bundle.loaders,
            outdir: paths.buildDir,
        }),
    );

    // copy the public directory (favicons, og, manifest, robots) into the build
    copyDirectory(paths.publicDir, paths.builtPublicDir);

    // derive the real client entry path from the metafile -> asset manifest
    const mainScriptSource = mainEntryFromMetafile(clientResult.metafile, paths.clientDir);
    if (mainScriptSource) {
        fs.writeFileSync(
            paths.assetManifest,
            JSON.stringify({ main: mainScriptSource }, null, 2),
        );
    }

    process.stdout.write(
        `[plurid build] built -> ${paths.buildDir}/{index.js, client/**, public/**}`
        + (mainScriptSource ? ` (main ${mainScriptSource})` : '')
        + '\n',
    );
}


/**
 * Find the client entry's output path in the esbuild metafile and turn it into the URL the server
 * serves it at: its path under the client directory, which is mounted at `/`
 * (`<buildDir>/client/index.js` -> `/index.js`). The metafile's paths are relative to the working
 * directory esbuild ran in. A literal `build/` prefix was stripped instead, so any other `buildDir`
 * wrote `/dist/client/index.js` into the manifest, a URL that 404s: the production page never
 * hydrated (2026-09-29).
 */
export function mainEntryFromMetafile(
    metafile: esbuild.Metafile | undefined,
    clientDir: string,
    workingDirectory: string = process.cwd(),
): string | undefined {
    if (!metafile) {
        return undefined;
    }

    const clientRoot = path.resolve(workingDirectory, clientDir);

    for (const [outputPath, output] of Object.entries(metafile.outputs)) {
        if (!output.entryPoint) {
            continue;
        }
        if (!outputPath.endsWith('.js')) {
            continue;
        }
        const relative = path.relative(clientRoot, path.resolve(workingDirectory, outputPath));
        if (relative.startsWith('..') || path.isAbsolute(relative)) {
            // not a client output (a server entry in the same metafile)
            continue;
        }
        return '/' + relative.split(path.sep).join('/');
    }

    return undefined;
}


/** Recursively copy a directory (no-op if the source does not exist). */
function copyDirectory(
    source: string,
    destination: string,
): void {
    if (!fs.existsSync(source)) {
        return;
    }

    fs.mkdirSync(destination, { recursive: true });

    for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
        const from = path.join(source, entry.name);
        const to = path.join(destination, entry.name);

        if (entry.isDirectory()) {
            copyDirectory(from, to);
        } else {
            fs.copyFileSync(from, to);
        }
    }
}
// #endregion module
