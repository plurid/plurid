// #region imports
    // #region libraries
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
 * Build options for the CLIENT bundle (browser). Bundle EVERYTHING (react,
 * styled, engine must ship to the browser); no externalize-bare here.
 */
export function clientBuildOptions(
    options: {
        mode: 'development' | 'production';
        clientExternals?: string[];
        metafile?: boolean;
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
        define: {
            'process.env.ENV_MODE': JSON.stringify(options.mode),
            'process.env.NODE_ENV': JSON.stringify(options.mode),
            'process.env.SC_DISABLE_SPEEDY': JSON.stringify('true'),
            'process.env.PLURID_LIVE_SERVER': JSON.stringify(''),
            global: 'window',
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
        define: {
            'process.env.ENV_MODE': JSON.stringify(options.mode),
            'process.env.NODE_ENV': JSON.stringify(options.mode),
        },
    };
}
// #endregion module
