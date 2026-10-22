// #region imports
    // #region libraries
    import fs from 'fs';
    import path from 'path';

    import type {
        Plugin,
    } from 'esbuild';
    // #endregion libraries


    // #region internal
    import {
        DEFAULT_DEDUPE,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
/**
 * ONE COPY OF EACH SINGLETON, THE APPLICATION'S (2026-10-22).
 *
 * A package linked from another checkout (`link:`, `pnpm link`, a `file:` symlink) resolves its own
 * imports from where it really is, which is that checkout and ITS node_modules: the application
 * then runs two Reacts (hooks throw, a context provided by one is not seen by the other, the server
 * renders with one and hydrates with the other), two styled-components (no theme), two
 * react-reduxes (no store). These helpers make every import of such a package, whoever imports it,
 * resolve from the application's root, and fall back to the importer's own copy when the
 * application has none.
 */


/** Matches an import path against the dedupe list: a name and its subpaths, or `@scope/*`. */
export const dedupeMatcher = (
    packages: readonly string[],
): ((id: string) => boolean) => {
    const scopes = packages
        .filter((entry) => entry.endsWith('/*'))
        .map((entry) => entry.slice(0, -1));
    const names = new Set(packages.filter((entry) => !entry.endsWith('/*')));

    return (id) => {
        if (names.has(id)) {
            return true;
        }
        for (const scope of scopes) {
            if (id.startsWith(scope)) {
                return true;
            }
        }
        // `react/jsx-runtime`, `react-dom/client`, `@apollo/client/react`
        const parts = id.split('/');
        const name = id.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
        return name !== id && names.has(name);
    };
};


/** The list a build uses: the config's `bundle.dedupe`, or the defaults. */
export const resolveDedupe = (
    dedupe: readonly string[] | undefined,
): string[] => [...(dedupe ?? DEFAULT_DEDUPE)];


const SKIP = 'plurid-dedupe:resolving';

/**
 * The CLIENT's resolve plugin: a bare import on the dedupe list resolves as if the application's root
 * imported it - with every other esbuild rule (conditions, `browser`, `alias`) as usual. Not
 * installed in the application, it resolves as it would have.
 *
 * A `require` of it resolves as an `import` does. A package that ships both formats was bundled
 * twice, its ES module for the modules that import it and its CommonJS build for those that require
 * it (a CommonJS workspace library): two instances, and two sets of styled components, which
 * styled-components numbers in creation order, so every class after them differed from the
 * server's and the page did not hydrate (2026-10-22).
 */
export function dedupePlugin(
    options: {
        packages: readonly string[];
        root: string;
    },
): Plugin {
    const matches = dedupeMatcher(options.packages);

    return {
        name: 'plurid-dedupe',
        setup(build) {
            build.onResolve({ filter: /^[^./~]/ }, async (args) => {
                if (
                    args.pluginData?.[SKIP]
                    || !matches(args.path)
                ) {
                    return undefined;
                }

                const result = await build.resolve(args.path, {
                    kind: args.kind === 'require-call'
                        ? 'import-statement'
                        : args.kind,
                    resolveDir: options.root,
                    pluginData: { [SKIP]: true },
                });
                if (result.errors.length > 0) {
                    // the application has none: the importer's own copy
                    return undefined;
                }

                return {
                    path: result.path,
                    external: result.external,
                    namespace: result.namespace,
                    suffix: result.suffix,
                    sideEffects: result.sideEffects,
                    pluginData: result.pluginData,
                };
            });
        },
    };
}


/**
 * The SERVER's counterpart, as the first lines of the server bundle: Node resolves a dedupe-listed
 * package from the bundle's own place in the application, whoever requires it - a linked package,
 * a workspace library, a published one. The server bundle keeps every bare import external (the
 * packages load from node_modules as they always have), so this is where the duplicates would come
 * from. `module.registerHooks` (Node 22.15) covers `require` and `import` alike; before it, the
 * CommonJS resolver is wrapped.
 *
 * Each kind keeps its own conditions: a `require` gets the application's CommonJS resolution, an
 * `import` its ES module one. Handing an `import` the CommonJS build too broke `@reduxjs/toolkit`:
 * its ES module re-exports `redux`, a CommonJS module's namespace carries a `module.exports`
 * export, and `require(esm)` of the toolkit then returned redux (2026-10-22).
 */
export const serverDedupeBanner = (
    packages: readonly string[],
): string => {
    if (packages.length === 0) {
        return '';
    }

    return `/* plurid-kit: one copy of each of ${JSON.stringify(packages)}, the application's */
(() => {
    const scopes = ${JSON.stringify(packages.filter((entry) => entry.endsWith('/*')).map((entry) => entry.slice(0, -1)))};
    const names = new Set(${JSON.stringify(packages.filter((entry) => !entry.endsWith('/*')))});
    const matches = (id) => {
        if (typeof id !== 'string' || id.startsWith('.') || id.startsWith('/') || id.startsWith('node:')) return false;
        if (names.has(id) || scopes.some((scope) => id.startsWith(scope))) return true;
        const parts = id.split('/');
        return names.has(id.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]);
    };
    const Module = require('module');
    const application = Module.createRequire(__filename);
    if (typeof Module.registerHooks === 'function') {
        const { pathToFileURL } = require('url');
        const parentURL = pathToFileURL(__filename).href;
        Module.registerHooks({
            resolve(specifier, context, nextResolve) {
                // the application's own resolutions come back through here: let them through
                if (matches(specifier) && context.parentURL !== parentURL) {
                    try {
                        // a require's next step resolves from the requiring module whatever
                        // \`parentURL\` says; an import's takes it
                        return (context.conditions || []).includes('require')
                            ? { url: pathToFileURL(application.resolve(specifier)).href, shortCircuit: true }
                            : nextResolve(specifier, { ...context, parentURL });
                    } catch {}
                }
                return nextResolve(specifier, context);
            },
        });
        return;
    }
    const resolveFilename = Module._resolveFilename;
    Module._resolveFilename = function (request, parent, isMain, options) {
        if (matches(request) && !options) {
            try {
                return application.resolve(request);
            } catch {}
        }
        return resolveFilename.call(this, request, parent, isMain, options);
    };
})();`;
};


/** The directory holding the workspace an application is in: the nearest `pnpm-workspace.yaml`, else its own. */
export const workspaceRoot = (
    root: string,
): string => {
    let directory = path.resolve(root);
    for (;;) {
        if (
            fs.existsSync(path.join(directory, 'pnpm-workspace.yaml'))
            || fs.existsSync(path.join(directory, 'lerna.json'))
        ) {
            return directory;
        }
        try {
            const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
            if (manifest.workspaces) {
                return directory;
            }
        } catch {
            // no package.json here
        }
        const parent = path.dirname(directory);
        if (parent === directory) {
            return path.resolve(root);
        }
        directory = parent;
    }
};


const inside = (
    outer: string,
    inner: string,
) => inner === outer || inner.startsWith(outer + path.sep);


/**
 * The application's LINKED dependencies: a `node_modules` entry whose real path is outside the
 * application's workspace and in no `node_modules` (a registry install lives in one; a workspace
 * package is inside the workspace). Name to real directory.
 */
export const linkedPackages = (
    root: string,
): Map<string, string> => {
    const linked = new Map<string, string>();
    const modules = path.join(root, 'node_modules');
    if (!fs.existsSync(modules)) {
        return linked;
    }
    const workspace = fs.realpathSync(workspaceRoot(root));

    const consider = (name: string) => {
        let real: string;
        try {
            real = fs.realpathSync(path.join(modules, name));
        } catch {
            return;
        }
        if (
            inside(workspace, real)
            || real.split(path.sep).includes('node_modules')
        ) {
            return;
        }
        linked.set(name, real);
    };

    for (const entry of fs.readdirSync(modules)) {
        if (entry.startsWith('.')) {
            continue;
        }
        if (entry.startsWith('@')) {
            for (const scoped of fs.readdirSync(path.join(modules, entry))) {
                consider(`${entry}/${scoped}`);
            }
        } else {
            consider(entry);
        }
    }
    return linked;
};


/**
 * One line naming the linked packages and where they are, for `plurid dev` and `plurid build` to say
 * what they build against; empty without any.
 */
export const describeLinked = (
    linked: ReadonlyMap<string, string>,
    root: string,
): string => {
    if (linked.size === 0) {
        return '';
    }
    const directories = [...linked.values()];
    // the deepest directory every linked package is in: the other checkout
    let common = path.dirname(directories[0]);
    while (!directories.every((directory) => inside(common, directory)) && path.dirname(common) !== common) {
        common = path.dirname(common);
    }
    return `${linked.size} linked package${linked.size === 1 ? '' : 's'} from ${path.relative(root, common) || common}: `
        + [...linked.keys()].sort().join(', ');
};


/**
 * The files `plurid dev --watch` watches for a linked package, so the server restarts on a rebuild
 * of it (the client bundles the package, so its own watch sees the change): the package's
 * manifest and the built files its entries point into.
 */
export const linkedWatchFiles = (
    directory: string,
): string[] => {
    const files = [path.join(directory, 'package.json')];
    const walk = (current: string, depth: number) => {
        let entries: fs.Dirent[] = [];
        try {
            entries = fs.readdirSync(current, { withFileTypes: true });
        } catch {
            return;
        }
        for (const entry of entries) {
            const next = path.join(current, entry.name);
            if (entry.isDirectory()) {
                if (depth < 3 && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
                    walk(next, depth + 1);
                }
            } else if (/\.(c|m)?js$/.test(entry.name)) {
                files.push(next);
            }
        }
    };
    for (const built of ['distribution', 'dist', 'build', 'lib']) {
        const directoryOfBuilt = path.join(directory, built);
        if (fs.existsSync(directoryOfBuilt)) {
            walk(directoryOfBuilt, 0);
        }
    }
    return files;
};
// #endregion module
