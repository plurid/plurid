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
});
// #endregion module
