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
        PluridCliError,
    } from './config';

    import {
        resolvePaths,
        PluridPaths,
    } from './paths';

    import {
        writeBuildManifest,
    } from './manifest';

    import {
        loadEnvironment,
    } from './environment';
    // #endregion internal
// #endregion imports



// #region module
/**
 * A build empties its `buildDir` first, so only a directory that holds a build is emptied. It was
 * removed whatever it named: `buildDir: '.'`, `'source'`, the public directory or a folder of
 * something else went with everything in it (2026-10-20). A previous build is told by its own files:
 * `asset-manifest.json`, or the server entry beside the client directory.
 */
export const assertBuildOutput = (
    paths: PluridPaths,
    root = process.cwd(),
): void => {
    const target = path.resolve(root, paths.buildDir);
    const contains = (outer: string, inner: string) => inner === outer || inner.startsWith(outer + path.sep);
    for (const kept of [path.resolve(root), path.resolve(root, 'source'), path.resolve(root, paths.publicDir)]) {
        if (contains(target, kept)) {
            throw new PluridCliError(
                `buildDir '${paths.buildDir}' holds ${path.relative(root, kept) || 'the application'}: `
                + 'a build empties its buildDir first, so give it a directory of its own (the default is `build`).',
            );
        }
    }
    if (!fs.statSync(target).isDirectory()) {
        throw new PluridCliError(`buildDir '${paths.buildDir}' is not a directory.`);
    }
    const entries = fs.readdirSync(target);
    const previous = entries.length === 0
        || entries.includes('asset-manifest.json')
        || (entries.includes('index.js') && entries.includes('client'));
    if (!previous) {
        throw new PluridCliError(
            `buildDir '${paths.buildDir}' is not a previous build (no asset-manifest.json): a build empties `
            + 'its buildDir first. Move that directory aside, or choose another buildDir.',
        );
    }
};


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

    const clean = !argv.includes('--no-clean') && process.env.PLURID_PRESERVE_ARTIFACTS !== '1';
    if (clean && fs.existsSync(paths.buildDir)) {
        assertBuildOutput(paths);
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
    // and the build's mode, which `plurid start` reads
    writeBuildManifest(paths, {
        mode,
        ...(mainScriptSource ? { main: mainScriptSource } : {}),
    });

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
