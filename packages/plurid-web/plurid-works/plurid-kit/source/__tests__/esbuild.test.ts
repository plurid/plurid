// #region imports
    // #region libraries
    import path from 'path';
    import os from 'os';
    import fs from 'fs';
    // #endregion libraries


    // #region internal
    import {
        clientBuildOptions,
        serverBuildOptions,
        styledComponentsBrowserAlias,
    } from '../cli/esbuild';

    import {
        loadPluridConfig,
    } from '../cli/config';
    // #endregion internal
// #endregion imports



// #region module
describe('styledComponentsBrowserAlias', () => {
    it('resolves the browser ESM build when styled-components is installed', () => {
        // this package has styled-components as a devDependency -> resolvable
        const alias = styledComponentsBrowserAlias(__dirname);

        expect(alias['styled-components']).toBeDefined();
        expect(alias['styled-components']).toMatch(
            /styled-components\.browser\.esm\.js$/,
        );
        expect(fs.existsSync(alias['styled-components'])).toBe(true);
    });

    it('never returns a broken alias path (guarded by existsSync)', () => {
        // NOTE: the unresolvable-app negative case cannot be simulated under
        // jest - jest's createRequire falls back to its own resolver roots, so
        // styled-components resolves from the workspace regardless of the
        // "from" directory. Real node (the CLI) walks up from the app dir and
        // returns {} when nothing resolves. What IS guaranteed everywhere:
        // an alias, when returned, points at a real browser ESM file.
        const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'plurid-kit-'));
        try {
            const alias = styledComponentsBrowserAlias(empty);
            for (const target of Object.values(alias)) {
                expect(fs.existsSync(target)).toBe(true);
                expect(target).toMatch(/styled-components\.browser\.esm\.js$/);
            }
        } finally {
            fs.rmSync(empty, { recursive: true, force: true });
        }
    });
});


describe('clientBuildOptions', () => {
    it('pins the styled-components v6 workarounds (SPEEDY define + browser alias)', () => {
        const options = clientBuildOptions({ mode: 'development' });

        expect(options.define?.['process.env.SC_DISABLE_SPEEDY']).toBe('"true"');
        expect(options.alias?.['styled-components']).toMatch(
            /styled-components\.browser\.esm\.js$/,
        );
    });

    it('merges bundle knobs (define, loaders, environment) over the built-ins', () => {
        process.env.PLURID_TEST_KEY = 'from-env';
        const options = clientBuildOptions({
            mode: 'production',
            define: { 'process.env.CUSTOM': '"custom"' },
            loaders: { '.glb': 'file' },
            environment: ['PLURID_TEST_KEY'],
        });

        expect(options.define?.['process.env.CUSTOM']).toBe('"custom"');
        expect(options.define?.['process.env.PLURID_TEST_KEY']).toBe('"from-env"');
        expect((options.loader as any)?.['.glb']).toBe('file');
        expect((options.loader as any)?.['.png']).toBe('file');
        expect(options.minify).toBe(true);
    });
});


describe('serverBuildOptions', () => {
    it('externalizes bare imports via the plugin and honors define/loaders', () => {
        const options = serverBuildOptions({
            mode: 'production',
            define: { 'process.env.CUSTOM': '"custom"' },
            loaders: { '.glb': 'file' },
        });

        expect(options.platform).toBe('node');
        expect(options.plugins?.[0]?.name).toBe('externalize-bare');
        expect(options.define?.['process.env.CUSTOM']).toBe('"custom"');
        expect((options.loader as any)?.['.glb']).toBe('file');
    });
});


describe('environmentMode (the deployment target vs the build mode)', () => {
    it('inlines ENV_MODE from environmentMode while NODE_ENV keeps the build mode', () => {
        const options = clientBuildOptions({ mode: 'development', environmentMode: 'local' });
        expect(options.define?.['process.env.ENV_MODE']).toBe('"local"');
        expect(options.define?.['process.env.NODE_ENV']).toBe('"development"');

        const server = serverBuildOptions({ mode: 'development', environmentMode: 'local' });
        expect(server.define?.['process.env.ENV_MODE']).toBe('"local"');
        expect(server.define?.['process.env.NODE_ENV']).toBe('"development"');
    });

    it('defaults ENV_MODE to the build mode when environmentMode is absent (plurid build)', () => {
        const options = clientBuildOptions({ mode: 'production' });
        expect(options.define?.['process.env.ENV_MODE']).toBe('"production"');
    });
});


describe('loadPluridConfig', () => {
    it('returns {} where no config file exists', async () => {
        const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'plurid-kit-'));
        try {
            const config = await loadPluridConfig(empty);
            expect(config).toEqual({});
        } finally {
            fs.rmSync(empty, { recursive: true, force: true });
        }
    });

    it('round-trips a config file (bundle knobs)', async () => {
        const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'plurid-kit-'));
        try {
            fs.writeFileSync(
                path.join(directory, 'plurid.config.ts'),
                `export default {
                    serverName: 'fixture',
                    hostname: 'fixture.plurid.com',
                    bundle: {
                        clientExternals: ['geoip-lite'],
                        environment: ['PLURID_TEST_KEY'],
                    },
                };`,
            );

            const config = await loadPluridConfig(directory);
            expect(config.serverName).toBe('fixture');
            expect(config.bundle?.clientExternals).toEqual(['geoip-lite']);
        } finally {
            fs.rmSync(directory, { recursive: true, force: true });
        }
    });

    it('bundles a config whose import graph reaches binary assets', async () => {
        // the loader-map chicken-and-egg: the asset loaders live IN the config,
        // so config evaluation itself must tolerate assets (empty modules)
        const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'plurid-kit-'));
        try {
            fs.writeFileSync(path.join(directory, 'logo.png'), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
            fs.writeFileSync(
                path.join(directory, 'routes.ts'),
                `import logo from './logo.png';
                export const routes = [{ value: '/', logo }];`,
            );
            fs.writeFileSync(
                path.join(directory, 'plurid.config.ts'),
                `import { routes } from './routes';
                export default {
                    serverName: 'asset-fixture',
                    routes,
                    bundle: { loaders: { '.png': 'file' } },
                };`,
            );

            const config = await loadPluridConfig(directory);
            expect(config.serverName).toBe('asset-fixture');
            expect((config.bundle?.loaders as any)?.['.png']).toBe('file');
        } finally {
            fs.rmSync(directory, { recursive: true, force: true });
        }
    });

    it('warns and returns {} for a config that cannot bundle', async () => {
        const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'plurid-kit-'));
        try {
            fs.writeFileSync(
                path.join(directory, 'plurid.config.ts'),
                `import missing from './does-not-exist';
                export default { serverName: missing };`,
            );

            const written: string[] = [];
            const spy = jest.spyOn(process.stderr, 'write').mockImplementation((chunk: any) => {
                written.push(String(chunk));
                return true;
            });
            try {
                const config = await loadPluridConfig(directory);
                expect(config).toEqual({});
            } finally {
                spy.mockRestore();
            }
            // the warning names the cause and its place, not esbuild's `Build failed with 1 error:`
            expect(written.join('')).toMatch(/could not bundle plurid\.config\.ts; continuing without it: plurid\.config\.ts:1:\d+: Could not resolve "\.\/does-not-exist"/);
        } finally {
            fs.rmSync(directory, { recursive: true, force: true });
        }
    });
});


describe('server-only thunks, told apart without counting parameters (2026-09-29)', () => {
    it('a value that is never a function (preserves, load): any function is its thunk, a module unwrapped', async () => {
        const { resolveServerOnly } = await import('../shared');
        expect(await resolveServerOnly(() => 'produced')).toBe('produced');
        expect(await resolveServerOnly(() => Promise.resolve({ default: ['a preserve'] }))).toEqual(['a preserve']);
        expect(await resolveServerOnly(['as is'])).toEqual(['as is']);
    });

    it('a value that IS a function (document, handlers): a bare function is the value — even with no parameters', async () => {
        const { resolveServerOnlyFunction } = await import('../shared');
        const handler = (server: unknown) => server;
        expect(await resolveServerOnlyFunction(handler)).toBe(handler);
        // a context-free document hook was called at startup as a thunk, and every request failed
        const contextFree = jest.fn(() => ({ meta: [{ name: 'robots', content: 'noindex' }] }));
        expect(await resolveServerOnlyFunction(contextFree)).toBe(contextFree);
        expect(contextFree).not.toHaveBeenCalled();
    });

    it('a thunk marked with serverOnly is called once and what it produced is the value', async () => {
        const { resolveServerOnlyFunction } = await import('../shared');
        const { serverOnly } = await import('../index');
        const hook = () => ({ title: 'hooked' });
        const thunk = jest.fn(() => Promise.resolve({ default: hook }));
        expect(await resolveServerOnlyFunction(serverOnly(thunk))).toBe(hook);
        expect(thunk).toHaveBeenCalledTimes(1);
    });
});
// #endregion module
