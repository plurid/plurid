// #region imports
    // #region libraries
    import fs from 'fs';
    import path from 'path';
    import { createRequire } from 'module';

    import type {
        BuildOptions,
        Plugin,
    } from 'esbuild';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * The shared esbuild base: bundle the app's OWN source, name assets under
 * `assets/`, and load binary/font assets as files. Mirrors denote's proven
 * `scripts/workings/live/common.js`.
 */
export const commonBuild: BuildOptions = {
    bundle: true,
    assetNames: 'assets/[name]',
    loader: {
        '.ttf': 'file',
        '.png': 'file',
        '.jpg': 'file',
        '.jpeg': 'file',
        '.svg': 'file',
        '.gif': 'file',
        '.mov': 'file',
        '.woff': 'file',
        '.woff2': 'file',
    },
};


/**
 * The load-bearing server plugin: bundle the app's own source (relative `.`/`/`
 * paths and `~`-tsconfig aliases) and externalize EVERY bare import, so node
 * loads third-party + the `@plurid/apps.*` workspace libs from `node_modules`
 * at runtime (no bundling of hostile packages, no stale styled-v5, no phantom
 * deps). Optional `forceBundle` re-includes specific bare ids (deep interop
 * paths) and `clientExternals` is unused on the server.
 *
 * Verbatim generalization of denote's `externalize-bare` plugin in `dev.cjs`.
 */
export function externalizeBare(
    forceBundle: Array<string | ((dependency: string) => string | undefined)> = [],
): Plugin {
    const matchesForceBundle = (id: string): boolean => {
        for (const rule of forceBundle) {
            if (typeof rule === 'string') {
                if (id === rule || id.startsWith(rule)) {
                    return true;
                }
            } else if (rule(id)) {
                return true;
            }
        }
        return false;
    };

    return {
        name: 'externalize-bare',
        setup(build) {
            build.onResolve({ filter: /.*/ }, (args) => {
                const id = args.path;

                // bundle the app's own source
                if (
                    id.startsWith('.')
                    || id.startsWith('/')
                    || id.startsWith('~')
                ) {
                    return undefined;
                }

                // force-bundle explicit bare ids (e.g. a requester deep path)
                if (matchesForceBundle(id)) {
                    return undefined;
                }

                // every other bare import -> runtime require
                return { path: id, external: true };
            });
        },
    };
}


/**
 * Resolve the APP's styled-components to its browser ESM build. esbuild's
 * browser resolution otherwise lands on the CJS browser build, whose
 * default-export interop breaks `styled.div` under bundling (the fleet's
 * "black screen" - the workaround every legacy `dev.cjs` carries by hand).
 *
 * Guarded: no styled-components in the app, or a future package layout
 * without `dist/styled-components.browser.esm.js` -> no alias (esbuild's
 * default resolution applies).
 */
export function styledComponentsBrowserAlias(
    applicationDirectory: string = process.cwd(),
): Record<string, string> {
    try {
        const requireFromApplication = createRequire(
            path.join(applicationDirectory, 'package.json'),
        );
        // v6 ships no `exports` map; main -> dist/styled-components.cjs.js
        const entry = requireFromApplication.resolve('styled-components');
        const browserESM = path.join(
            path.dirname(entry),
            'styled-components.browser.esm.js',
        );

        if (fs.existsSync(browserESM)) {
            return {
                'styled-components': browserESM,
            };
        }
    } catch {
        // styled-components not installed in the app
    }

    return {};
}


/**
 * Turn `bundle.environment` keys into esbuild `define` entries that inline
 * the BUILD-TIME `process.env.*` values into the client bundle.
 */
function environmentDefines(
    keys: string[] = [],
): Record<string, string> {
    const defines: Record<string, string> = {};
    for (const key of keys) {
        defines[`process.env.${key}`] = JSON.stringify(process.env[key] ?? '');
    }
    return defines;
}


/**
 * Build options for the CLIENT bundle (browser). Bundle EVERYTHING (react,
 * styled, engine must ship to the browser); no externalize-bare here.
 *
 * The two styled-components v6 workarounds every legacy app carried by hand
 * are built in: `SC_DISABLE_SPEEDY` (production style injection) and the
 * browser-ESM alias (CJS default-interop black screen).
 */
export function clientBuildOptions(
    options: {
        mode: 'development' | 'production';
        clientExternals?: string[];
        metafile?: boolean;
        alias?: Record<string, string>;
        define?: Record<string, string>;
        loaders?: Record<string, string>;
        environment?: string[];
    },
): BuildOptions {
    const development = options.mode === 'development';

    return {
        ...commonBuild,
        entryPoints: ['source/client/index.tsx'],
        outdir: 'build/client',
        platform: 'browser',
        // iife (esbuild's browser default) - a single `build/client/index.js`
        // loadable via the template's `<script src>`. Matches denote's proven
        // dev.cjs; NOT esm/splitting (which would need `<script type=module>`).
        minify: !development,
        sourcemap: development,
        metafile: options.metafile ?? false,
        external: options.clientExternals,
        logLevel: 'warning',
        loader: {
            ...commonBuild.loader,
            ...(options.loaders as BuildOptions['loader'] ?? {}),
        },
        alias: {
            ...styledComponentsBrowserAlias(),
            ...(options.alias ?? {}),
        },
        define: {
            'process.env.ENV_MODE': JSON.stringify(options.mode),
            'process.env.NODE_ENV': JSON.stringify(options.mode),
            'process.env.SC_DISABLE_SPEEDY': JSON.stringify('true'),
            'process.env.PLURID_LIVE_SERVER': JSON.stringify(''),
            global: 'window',
            ...environmentDefines(options.environment),
            ...(options.define ?? {}),
        },
    };
}


/**
 * Build options for the SERVER bundle (node). Externalize bare imports via the
 * plugin; only the app's own source is bundled into `build/index.js`.
 */
export function serverBuildOptions(
    options: {
        mode: 'development' | 'production';
        forceBundle?: Array<string | ((dependency: string) => string | undefined)>;
        metafile?: boolean;
        define?: Record<string, string>;
        loaders?: Record<string, string>;
    },
): BuildOptions {
    const development = options.mode === 'development';

    return {
        ...commonBuild,
        entryPoints: ['source/server/index.ts'],
        outdir: 'build',
        platform: 'node',
        format: 'cjs',
        plugins: [externalizeBare(options.forceBundle)],
        minify: !development,
        sourcemap: development,
        metafile: options.metafile ?? false,
        logLevel: 'warning',
        loader: {
            ...commonBuild.loader,
            ...(options.loaders as BuildOptions['loader'] ?? {}),
        },
        define: {
            'process.env.ENV_MODE': JSON.stringify(options.mode),
            'process.env.NODE_ENV': JSON.stringify(options.mode),
            ...(options.define ?? {}),
        },
    };
}
// #endregion module
