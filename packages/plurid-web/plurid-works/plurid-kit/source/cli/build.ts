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
        loadEnvironment,
    } from './environment';
    // #endregion internal
// #endregion imports



// #region module
/** The asset manifest the runtime reads to point the template at real emitted files. */
const ASSET_MANIFEST = 'build/asset-manifest.json';


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

    const clean = !argv.includes('--no-clean');
    if (clean && fs.existsSync('build')) {
        fs.rmSync('build', { recursive: true, force: true });
    }

    // client (browser, minified, single iife bundle) + server (node, minified)
    const clientResult = await esbuild.build(
        clientBuildOptions({ mode, metafile: true }),
    );
    await esbuild.build(
        serverBuildOptions({ mode, metafile: true }),
    );

    // copy the public directory (favicons, og, manifest, robots) into the build
    copyDirectory('source/public', 'build/public');

    // derive the real client entry path from the metafile -> asset manifest
    const mainScriptSource = mainEntryFromMetafile(clientResult.metafile);
    if (mainScriptSource) {
        fs.writeFileSync(
            ASSET_MANIFEST,
            JSON.stringify({ main: mainScriptSource }, null, 2),
        );
    }

    process.stdout.write(
        `[plurid build] built -> build/{index.js, client/**, public/**}`
        + (mainScriptSource ? ` (main ${mainScriptSource})` : '')
        + '\n',
    );
}


/**
 * Find the client entry's output path in the esbuild metafile and turn it into
 * a root-relative URL (`build/client/index.js` -> `/index.js`).
 */
function mainEntryFromMetafile(
    metafile: esbuild.Metafile | undefined,
): string | undefined {
    if (!metafile) {
        return undefined;
    }

    for (const [outputPath, output] of Object.entries(metafile.outputs)) {
        if (!output.entryPoint) {
            continue;
        }
        if (!outputPath.endsWith('.js')) {
            continue;
        }
        // strip the `build/client` prefix -> served at `/...`
        const relative = outputPath
            .replace(/^build\/client\//, '')
            .replace(/^build\//, '');
        return '/' + relative;
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
