// #region imports
    // #region libraries
    import fs from 'fs';
    import os from 'os';
    import path from 'path';
    import { execFileSync } from 'child_process';

    import * as esbuild from 'esbuild';
    // #endregion libraries


    // #region internal
    import {
        DEFAULT_DEDUPE,
    } from '../index';
    import {
        dedupeMatcher,
        dedupePlugin,
        describeLinked,
        linkedPackages,
        linkedWatchFiles,
        serverDedupeBanner,
        workspaceRoot,
    } from '../cli/dedupe';
    import {
        clientBuildOptions,
        externalizeBare,
        serverBuildOptions,
    } from '../cli/esbuild';
    // #endregion internal
// #endregion imports



// #region module
/**
 * A LINKED PACKAGE RUNS ON THE APPLICATION'S REACT (2026-10-22).
 *
 * The fixture is the case that broke: an application in a workspace, and a package linked into its
 * node_modules from another checkout, which has its own `react` beside it. Each "react" says whose
 * copy it is. Without the dedupe the linked package gets its own; with it, the application's.
 */
const write = (
    file: string,
    content: string,
) => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
};

const fakePackage = (
    directory: string,
    name: string,
    main: string,
    extra: Record<string, unknown> = {},
) => {
    write(path.join(directory, 'package.json'), JSON.stringify({ name, version: '1.0.0', main, ...extra }));
    write(path.join(directory, main), '');
};

const fixture = () => {
    const base = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'plurid-kit-dedupe-')));
    const workspace = path.join(base, 'workspace');
    const application = path.join(workspace, 'app');
    const checkout = path.join(base, 'checkout');
    write(path.join(workspace, 'pnpm-workspace.yaml'), 'packages:\n  - app\n  - libraries/*\n');

    // the application's own copy, as a registry install puts it (a directory in node_modules)
    fakePackage(path.join(application, 'node_modules', 'react'), 'react', 'index.js');
    write(path.join(application, 'node_modules', 'react', 'index.js'), 'module.exports = { copy: "application" };\n');
    write(path.join(application, 'node_modules', 'react', 'jsx-runtime.js'), 'module.exports = { copy: "application jsx" };\n');

    // the linked package, CommonJS, with its own react and a dependency the application lacks
    const linked = path.join(checkout, 'packages', 'linked');
    fakePackage(linked, 'linked', 'distribution/index.js');
    write(path.join(linked, 'distribution', 'index.js'), [
        'const react = require("react");',
        'const jsx = require("react/jsx-runtime");',
        'const own = require("only-in-checkout");',
        'module.exports = { react: react.copy, jsx: jsx.copy, own };',
        '',
    ].join('\n'));
    fakePackage(path.join(linked, 'node_modules', 'react'), 'react', 'index.js');
    write(path.join(linked, 'node_modules', 'react', 'index.js'), 'module.exports = { copy: "checkout" };\n');
    write(path.join(linked, 'node_modules', 'react', 'jsx-runtime.js'), 'module.exports = { copy: "checkout jsx" };\n');
    fakePackage(path.join(linked, 'node_modules', 'only-in-checkout'), 'only-in-checkout', 'index.js');
    write(path.join(linked, 'node_modules', 'only-in-checkout', 'index.js'), 'module.exports = "the checkout\'s own";\n');

    // the same, as an ES module (a `"type": "module"` library)
    const linkedModule = path.join(checkout, 'packages', 'linked-module');
    fakePackage(linkedModule, '@scope/linked-module', 'index.js', { type: 'module' });
    write(path.join(linkedModule, 'index.js'), 'import react from "react";\nexport const copy = react.copy;\n');
    fakePackage(path.join(linkedModule, 'node_modules', 'react'), 'react', 'index.js');
    write(path.join(linkedModule, 'node_modules', 'react', 'index.js'), 'module.exports = { copy: "checkout" };\n');

    // a package that ships both formats, counting how many times it is evaluated
    const dual = path.join(application, 'node_modules', 'dual');
    write(path.join(dual, 'package.json'), JSON.stringify({
        name: 'dual',
        version: '1.0.0',
        exports: { '.': { import: './index.mjs', require: './index.cjs' } },
    }));
    write(path.join(dual, 'index.mjs'), 'globalThis.dualEvaluations = (globalThis.dualEvaluations || 0) + 1;\nexport const instance = {};\n');
    write(path.join(dual, 'index.cjs'), 'globalThis.dualEvaluations = (globalThis.dualEvaluations || 0) + 1;\nexports.instance = {};\n');
    // an ES module importing it and a CommonJS module requiring it
    write(path.join(application, 'source', 'imports.mjs'), 'import { instance } from "dual";\nexport default instance;\n');
    write(path.join(application, 'source', 'requires.cjs'), 'module.exports = require("dual").instance;\n');

    // a workspace library: inside the workspace, so not linked
    const library = path.join(workspace, 'libraries', 'library');
    fakePackage(library, 'library', 'index.js');

    fs.symlinkSync(linked, path.join(application, 'node_modules', 'linked'), 'dir');
    fs.mkdirSync(path.join(application, 'node_modules', '@scope'), { recursive: true });
    fs.symlinkSync(linkedModule, path.join(application, 'node_modules', '@scope', 'linked-module'), 'dir');
    fs.symlinkSync(library, path.join(application, 'node_modules', 'library'), 'dir');

    return {
        base,
        workspace,
        application,
        linked,
        linkedModule,
        cleanup: () => {
            if (process.env.PLURID_PRESERVE_ARTIFACTS !== '1') {
                fs.rmSync(base, { recursive: true, force: true });
            }
        },
    };
};


describe('dedupeMatcher', () => {
    it('matches a name, its subpaths and a scope, and nothing that only starts like one', () => {
        const matches = dedupeMatcher(['react', 'react-dom', '@apollo/client', '@plurid/*']);

        expect(matches('react')).toBe(true);
        expect(matches('react/jsx-runtime')).toBe(true);
        expect(matches('react-dom/client')).toBe(true);
        expect(matches('@apollo/client/react')).toBe(true);
        expect(matches('@plurid/plurid-react')).toBe(true);
        expect(matches('@plurid/plurid-react/testing')).toBe(true);

        expect(matches('react-dnd')).toBe(false);
        expect(matches('reactive')).toBe(false);
        expect(matches('@apollo/client-extra')).toBe(false);
        expect(matches('@pluridal/other')).toBe(false);
    });

    it('defaults to React, styled-components, the Redux stack, Apollo, graphql and @plurid', () => {
        const matches = dedupeMatcher(DEFAULT_DEDUPE);
        for (const id of [
            'react', 'react/jsx-runtime', 'react-dom/server', 'scheduler', 'styled-components',
            'react-redux', 'redux', '@reduxjs/toolkit', 'react-helmet-async', '@apollo/client/react',
            'graphql', '@plurid/plurid-ui-components-react',
        ]) {
            expect(matches(id)).toBe(true);
        }
    });
});


describe('dedupePlugin (the client bundle)', () => {
    const bundle = async (
        entry: string,
        plugins: esbuild.Plugin[],
    ) => {
        const result = await esbuild.build({
            entryPoints: [entry],
            bundle: true,
            write: false,
            platform: 'node',
            format: 'cjs',
            logLevel: 'silent',
            plugins,
        });
        const module = { exports: {} as any };
        new Function('module', 'exports', result.outputFiles[0].text)(module, module.exports);
        return module.exports;
    };

    it('bundles the application\'s react for a linked package, and its own copy of what the application lacks', async () => {
        const { application, cleanup } = fixture();
        try {
            const entry = path.join(application, 'entry.js');
            write(entry, 'module.exports = require("linked");\n');

            // the fixture reproduces the duplicate
            expect(await bundle(entry, [])).toEqual({
                react: 'checkout',
                jsx: 'checkout jsx',
                own: 'the checkout\'s own',
            });

            expect(await bundle(entry, [dedupePlugin({ packages: ['react'], root: application })])).toEqual({
                react: 'application',
                jsx: 'application jsx',
                own: 'the checkout\'s own',
            });
        } finally {
            cleanup();
        }
    });

    it('bundles one build of a package that ships two, whether it is imported or required', async () => {
        const { application, cleanup } = fixture();
        try {
            const entry = path.join(application, 'entry.mjs');
            write(entry, [
                'import imported from "./source/imports.mjs";',
                'import required from "./source/requires.cjs";',
                'module.exports = { same: imported === required, evaluations: globalThis.dualEvaluations };',
            ].join('\n'));
            const evaluate = async (plugins: esbuild.Plugin[]) => {
                delete (globalThis as any).dualEvaluations;
                return bundle(entry, plugins);
            };

            // the fixture reproduces the duplicate: the ES module and the CommonJS build
            expect(await evaluate([])).toEqual({ same: false, evaluations: 2 });

            expect(await evaluate([dedupePlugin({ packages: ['dual'], root: application })])).toEqual({ same: true, evaluations: 1 });
        } finally {
            delete (globalThis as any).dualEvaluations;
            cleanup();
        }
    });

    it('is in the client build by default, and out with `dedupe: []`', () => {
        const names = (options: esbuild.BuildOptions) => (options.plugins ?? []).map((plugin) => plugin.name);

        expect(names(clientBuildOptions({ mode: 'development' }))).toContain('plurid-dedupe');
        expect(names(clientBuildOptions({ mode: 'development', dedupe: [] }))).not.toContain('plurid-dedupe');
    });
});


describe('serverDedupeBanner (the server, at run time)', () => {
    const run = (
        application: string,
        banner: string,
        body: string,
    ) => {
        const file = path.join(application, 'build', 'index.js');
        write(file, banner + '\n' + body);
        return JSON.parse(execFileSync(process.execPath, [file], { encoding: 'utf8' }));
    };

    const body = [
        'const linked = require("linked");',
        'const { copy } = require("@scope/linked-module");',
        'console.log(JSON.stringify({ ...linked, module: copy }));',
    ].join('\n');

    it('gives every importer the application\'s copy, CommonJS and ES modules alike', () => {
        const { application, cleanup } = fixture();
        try {
            // the fixture reproduces the duplicate
            expect(run(application, '', body)).toEqual({
                react: 'checkout',
                jsx: 'checkout jsx',
                own: 'the checkout\'s own',
                module: 'checkout',
            });

            expect(run(application, serverDedupeBanner(['react']), body)).toEqual({
                react: 'application',
                jsx: 'application jsx',
                own: 'the checkout\'s own',
                module: 'application',
            });
        } finally {
            cleanup();
        }
    });

    it('keeps each kind\'s own build on the server: a require gets CommonJS, an import the ES module', () => {
        const { application, cleanup } = fixture();
        try {
            // an ES module that re-exports a CommonJS one (`@reduxjs/toolkit` over `redux`): handed the
            // CommonJS build, its namespace carried `module.exports` and \`require\` returned the wrong module
            const toolkit = path.join(application, 'node_modules', 'toolkit');
            write(path.join(toolkit, 'package.json'), JSON.stringify({
                name: 'toolkit',
                version: '1.0.0',
                exports: { '.': { 'module-sync': './index.mjs', import: './index.mjs', require: './index.cjs' } },
            }));
            write(path.join(toolkit, 'index.mjs'), 'export * from "dual";\nexport const own = "toolkit";\n');
            write(path.join(toolkit, 'index.cjs'), 'exports.own = "toolkit";\n');

            const body = 'console.log(JSON.stringify({ own: require("toolkit").own }));';
            expect(run(application, serverDedupeBanner(['toolkit', 'dual']), body)).toEqual({ own: 'toolkit' });
        } finally {
            cleanup();
        }
    });

    it('is the server bundle\'s banner by default, and absent with `dedupe: []`', () => {
        expect(serverBuildOptions({ mode: 'production' }).banner?.js).toContain('registerHooks');
        expect(serverBuildOptions({ mode: 'production', dedupe: [] }).banner).toBeUndefined();
    });
});


describe('linkedPackages', () => {
    it('finds the dependencies whose real path is outside the workspace and in no node_modules', () => {
        const { workspace, application, linked, linkedModule, cleanup } = fixture();
        try {
            expect(workspaceRoot(application)).toBe(workspace);

            const found = linkedPackages(application);
            expect([...found.keys()].sort()).toEqual(['@scope/linked-module', 'linked']);
            expect(found.get('linked')).toBe(linked);
            expect(found.get('@scope/linked-module')).toBe(linkedModule);

            expect(describeLinked(found, application)).toBe('2 linked packages from ../../checkout/packages: @scope/linked-module, linked');
            expect(describeLinked(new Map(), application)).toBe('');
        } finally {
            cleanup();
        }
    });

    it('has the server restart on a rebuild of a linked package (`plurid dev --watch`)', async () => {
        const { application, linked, cleanup } = fixture();
        try {
            const files = linkedWatchFiles(linked);
            expect(files).toContain(path.join(linked, 'package.json'));
            expect(files).toContain(path.join(linked, 'distribution', 'index.js'));
            expect(files.some((file) => file.includes('node_modules'))).toBe(false);

            // the externalize plugin hands those files to esbuild's watch with the external import
            let resolve: ((args: { path: string }) => esbuild.OnResolveResult | undefined) | undefined;
            externalizeBare([], linkedPackages(application)).setup({
                onResolve: (_options: unknown, callback: typeof resolve) => {
                    resolve = callback;
                },
            } as unknown as esbuild.PluginBuild);

            expect(resolve!({ path: 'linked' })).toEqual({ path: 'linked', external: true, watchFiles: files });
            expect(resolve!({ path: 'react' })).toEqual({ path: 'react', external: true });
            expect(resolve!({ path: './own' })).toBeUndefined();
        } finally {
            cleanup();
        }
    });
});
// #endregion module
