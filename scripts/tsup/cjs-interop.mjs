/**
 * Build-time interop for externals whose packaging breaks under NATIVE Node ESM.
 *
 * The problem: `import styled from 'styled-components'` is left as-is in our ESM output (the
 * package is a peer). Node resolves styled-components@6 to its CommonJS build, so under native
 * ESM the default import is the whole `module.exports` object — `styled.div` is undefined while
 * `styled.default.div` is the function. `react-helmet-async` ships CommonJS with no `exports`
 * map, so `import { HelmetProvider }` throws: Node cannot detect its named exports. Bundlers
 * (Vite, webpack) and CommonJS consumers never see either problem, which is why the existing
 * gates passed while a plain `node` import of the packed package failed.
 *
 * The fix: every import of a listed module is redirected to a virtual module that imports the
 * real one as a NAMESPACE and resolves the default and each named export through the possible
 * interop shapes (a real ESM namespace, a CommonJS `module.exports` with `__esModule`, or a
 * doubly wrapped default). The real module stays external. Nothing changes in the sources or
 * the declarations; only the emitted JavaScript reads through the shim.
 */

/** The externals that need it, with the named exports our sources (and consumers) use. */
export const INTEROP_MODULES = {
    'styled-components': {
        named: [
            'css',
            'keyframes',
            'createGlobalStyle',
            'StyleSheetManager',
            'ServerStyleSheet',
            'ThemeProvider',
            'ThemeContext',
            'ThemeConsumer',
            'useTheme',
            'withTheme',
            'isStyledComponent',
            'createTheme',
            'styled',
            '__PRIVATE__',
        ],
    },
    'react-helmet-async': {
        named: [
            'Helmet',
            'HelmetProvider',
            'HelmetData',
        ],
    },
};

const NAMESPACE = 'plurid-cjs-interop';

const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const shim = (moduleName, definition) => `
import * as namespace from ${JSON.stringify(moduleName)};

/* the module as a bundler sees it (an ESM namespace), as Node sees a CommonJS package
   (\`default\` = module.exports, possibly with its own \`default\`), or as esbuild's own CJS interop
   presents it */
const resolveDefault = (source) => {
    const value = source && source.default;
    if (typeof value === 'function') {
        return value;
    }
    if (value && typeof value === 'object' && typeof value.default === 'function') {
        return value.default;
    }
    return value !== undefined ? value : source;
};

const resolveNamed = (source, key) => {
    if (source && source[key] !== undefined) {
        return source[key];
    }
    const value = source && source.default;
    if (value && value[key] !== undefined) {
        return value[key];
    }
    if (value && value.default && value.default[key] !== undefined) {
        return value.default[key];
    }
    return undefined;
};

const resolved = resolveDefault(namespace);
export default resolved;
${definition.named.map((name) => `export const ${name} = resolveNamed(namespace, ${JSON.stringify(name)});`).join('\n')}
`;


/**
 * The esbuild plugin (pass through tsup's \`esbuildPlugins\`). Runs before esbuild's own
 * resolution, so it intercepts the module even when tsup lists it as external; the shim's own
 * import of the real module is the one marked external.
 */
export const cjsInteropPlugin = (
    modules = INTEROP_MODULES,
) => {
    const names = Object.keys(modules);
    const filter = new RegExp('^(' + names.map(escape).join('|') + ')$');

    return {
        name: NAMESPACE,
        setup(build) {
            build.onResolve({ filter }, (args) => {
                if (args.namespace === NAMESPACE) {
                    return {
                        path: args.path,
                        external: true,
                    };
                }
                return {
                    path: args.path,
                    namespace: NAMESPACE,
                };
            });

            build.onLoad({ filter: /.*/, namespace: NAMESPACE }, (args) => ({
                contents: shim(args.path, modules[args.path]),
                loader: 'js',
            }));
        },
    };
};
