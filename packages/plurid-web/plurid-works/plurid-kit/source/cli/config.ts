// #region imports
    // #region libraries
    import fs from 'fs';
    import path from 'path';
    import vm from 'vm';
    import { createRequire } from 'module';

    import * as esbuild from 'esbuild';
    // #endregion libraries


    // #region internal
    import type {
        PluridConfig,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
/** A CLI failure whose message is the whole story: `plurid` prints it without a stack. */
export class PluridCliError extends Error {
    constructor(
        message: string,
        options?: { cause?: unknown },
    ) {
        super(message, options);
        this.name = 'PluridCliError';
    }
}


export interface LoadPluridConfigOptions {
    /**
     * `plurid build` / `plurid start`: a config that is present but cannot be bundled or evaluated is
     * FATAL. Going on with the conventions built into the default `build/` — not the config's
     * `buildDir` — without its `define` / `environment` / `forceBundle`, and exited 0: CI went green on a
     * broken artifact (2026-09-29). `plurid dev` / `info` warn and go on with the conventions.
     */
    strict?: boolean;
}


const CONFIG_FILES = [
    'plurid.config.ts',
    'plurid.config.js',
];

/**
 * Why a config did not bundle, in one line a developer can act on: esbuild's first error with its
 * place (`plurid.config.ts:1:20: Could not resolve "./routes"`). Its message's first line alone
 * is `Build failed with 1 error:`, which named nothing.
 */
const bundleFailure = (
    error: unknown,
): string => {
    const first = (error as { errors?: esbuild.Message[] } | undefined)?.errors?.[0];
    if (first) {
        const location = first.location;
        const place = location ? `${path.basename(location.file)}:${location.line}:${location.column}: ` : '';
        return place + first.text;
    }
    return error instanceof Error ? error.message.split('\n').filter(Boolean).join(' ') : String(error);
};


/** An error's message whatever realm it was thrown in (the config runs in the main context). */
const messageOf = (
    error: unknown,
): string => (
    error && typeof (error as { message?: unknown }).message === 'string'
        ? (error as { message: string }).message
        : String(error)
);


/**
 * Evaluate the bundled config IN MEMORY, as the CommonJS module it is, with a `require` rooted at the
 * config's own path: its bare imports resolve from the application's `node_modules`, as they did when
 * the bundle was written to `node_modules/.plurid-kit/` and imported — which wrote into the image on
 * every `plurid start`, so a read-only root filesystem, or a non-root user over a root-owned `/app`,
 * stopped the server before it ran (2026-09-29).
 */
const evaluateBundle = (
    code: string,
    configPath: string,
): unknown => {
    const module = { exports: {} as unknown };
    const wrapper = vm.runInThisContext(
        '(function (exports, require, module, __filename, __dirname) {' + code + '\n})',
        { filename: configPath },
    );
    wrapper(module.exports, createRequire(configPath), module, configPath, path.dirname(configPath));
    return module.exports;
};


/**
 * Load the app's `plurid.config.ts` for the CLI (the build-time subset:
 * `bundle.*`, the directories). The config is esbuild-bundled IN MEMORY to
 * CommonJS (bare imports externalized, so importing the config never drags
 * the app's runtime modules into the CLI process) and evaluated there;
 * nothing is written.
 *
 * Tolerates absence: an app without a config file gets `{}` (all defaults) -
 * the CLI works on convention alone. A config that is present but broken is
 * fatal under `strict` (build, start) and a warning otherwise (dev, info).
 */
export async function loadPluridConfig(
    applicationDirectory: string = process.cwd(),
    options: LoadPluridConfigOptions = {},
): Promise<Partial<PluridConfig>> {
    const configPath = CONFIG_FILES
        .map((file) => path.join(applicationDirectory, file))
        .find((file) => fs.existsSync(file));

    if (!configPath) {
        process.stdout.write('[plurid] no plurid.config.ts found — using the conventions (add one for bundle.* knobs)\n');
        return {};
    }

    const configName = path.basename(configPath);

    let code: string;
    try {
        const result = await esbuild.build({
            entryPoints: [configPath],
            // never written (`write: false`): names the output only
            outfile: path.join(applicationDirectory, 'plurid.config.cjs'),
            write: false,
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
        code = result.outputFiles[0].text;
    } catch (error) {
        if (options.strict) {
            throw new PluridCliError(
                `could not bundle ${configName}: ${bundleFailure(error)}`,
                { cause: error },
            );
        }
        // A config that cannot BUNDLE must not kill `plurid dev` - warn loudly and
        // fall back to convention (the silent-{} failure mode hides real
        // problems, so name the file and the first error).
        process.stderr.write(
            `[plurid] could not bundle ${configName}; `
            + `continuing without it: `
            + `${bundleFailure(error)}\n`,
        );
        return {};
    }

    try {
        const loaded = evaluateBundle(code, configPath) as { default?: unknown } | undefined;
        const config = loaded && typeof loaded === 'object' && 'default' in loaded
            ? loaded.default
            : loaded;
        if (config !== undefined && (config === null || typeof config !== 'object')) {
            throw new Error('its default export is not a configuration object (export default defineConfig({ … }))');
        }
        return (config ?? {}) as Partial<PluridConfig>;
    } catch (error) {
        const reason = messageOf(error);
        if (options.strict) {
            throw new PluridCliError(
                `could not load ${configName}: ${reason}`,
                { cause: error },
            );
        }
        process.stderr.write(
            `[plurid] could not load ${configName}: `
            + `${reason}\n`,
        );
        return {};
    }
}
// #endregion module
