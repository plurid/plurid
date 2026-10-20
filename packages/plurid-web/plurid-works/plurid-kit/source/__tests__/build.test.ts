// #region imports
    // #region libraries
    import fs from 'fs';
    import os from 'os';
    import path from 'path';

    import * as esbuild from 'esbuild';
    // #endregion libraries


    // #region internal
    import {
        build as buildCommand,
        mainEntryFromMetafile,
    } from '../cli/build';
    import {
        resolvePaths,
    } from '../cli/paths';
    // #endregion internal
// #endregion imports



// #region module
/**
 * A BUILD EMPTIES ONLY A BUILD (2026-10-20). `plurid build` removed whatever `buildDir` named before it
 * built: the application's own directory, its sources, a folder of something else. `fs.rmSync` is
 * replaced in these tests, so nothing is ever removed, whatever the code under test asks for.
 */
describe('build() and its output directory', () => {
    const inApplication = async (
        config: string,
        prepare: (directory: string) => void,
        removal: () => void,
    ) => {
        const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'plurid-kit-build-dir-'));
        prepare(directory);
        fs.writeFileSync(path.join(directory, 'plurid.config.js'), 'module.exports = ' + config + ';\n');
        const removed = jest.spyOn(fs, 'rmSync').mockImplementation(removal);
        const written = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
        const preserve = process.env.PLURID_PRESERVE_ARTIFACTS;
        const cwd = process.cwd();
        delete process.env.PLURID_PRESERVE_ARTIFACTS;
        process.chdir(directory);
        try {
            const outcome = await buildCommand([]).then(() => undefined, (error: Error) => error);
            return { outcome, removed: removed.mock.calls.length };
        } finally {
            process.chdir(cwd);
            if (preserve !== undefined) process.env.PLURID_PRESERVE_ARTIFACTS = preserve;
            removed.mockRestore();
            written.mockRestore();
        }
    };
    const refuse = () => {
        throw new Error('this test removes nothing');
    };

    it('refuses to empty a directory that holds the application or is not a previous build', async () => {
        const cases: [string, (directory: string) => void][] = [
            ["{ buildDir: 'keep' }", (directory) => {
                fs.mkdirSync(path.join(directory, 'keep'));
                fs.writeFileSync(path.join(directory, 'keep', 'sentinel.txt'), 'mine');
            }],
            ["{ buildDir: '.' }", () => {}],
            ["{ buildDir: 'source' }", (directory) => fs.mkdirSync(path.join(directory, 'source'))],
            ["{ buildDir: 'source/public/..' }", (directory) => fs.mkdirSync(path.join(directory, 'source', 'public'), { recursive: true })],
        ];
        for (const [config, prepare] of cases) {
            const { outcome, removed } = await inApplication(config, prepare, refuse);
            expect([config, outcome?.message]).toEqual([config, expect.stringMatching(/buildDir/)]);
            expect([config, removed]).toEqual([config, 0]);
        }
    });

    it('empties a previous build before building', async () => {
        const { outcome, removed } = await inApplication("{ buildDir: 'build' }", (directory) => {
            fs.mkdirSync(path.join(directory, 'build', 'client'), { recursive: true });
            fs.writeFileSync(path.join(directory, 'build', 'index.js'), '');
        }, () => {});
        expect(removed).toBe(1);
        expect(outcome?.message ?? '').not.toMatch(/buildDir/);
    });
});
// #endregion module



// #region module
/**
 * THE CLIENT SCRIPT'S URL IS ITS PATH UNDER THE CLIENT DIRECTORY (2026-09-29). The server serves
 * `<buildDir>/client` at `/`; the manifest stripped a literal `build/` prefix, so `buildDir: 'dist'`
 * wrote `"main": "/dist/client/index.js"`, the page asked for a script that 404s, and nothing hydrated.
 */
describe('mainEntryFromMetafile()', () => {
    const build = async (
        buildDir: string | undefined,
        workingDirectory: string,
    ) => {
        const paths = resolvePaths({ buildDir });
        const result = await esbuild.build({
            absWorkingDir: workingDirectory,
            entryPoints: ['source/client/index.ts'],
            outdir: paths.clientDir,
            bundle: true,
            metafile: true,
            write: false,
            logLevel: 'silent',
        });
        return mainEntryFromMetafile(result.metafile, paths.clientDir, workingDirectory);
    };

    it('is `/index.js` for any build directory, as esbuild names the output', async () => {
        const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'plurid-kit-build-'));
        try {
            fs.mkdirSync(path.join(directory, 'source', 'client'), { recursive: true });
            fs.writeFileSync(path.join(directory, 'source', 'client', 'index.ts'), 'console.log("client");');
            expect(await build(undefined, directory)).toBe('/index.js');
            expect(await build('dist', directory)).toBe('/index.js');
            expect(await build('out/web/', directory)).toBe('/index.js');
        } finally {
            if (process.env.PLURID_PRESERVE_ARTIFACTS !== '1') fs.rmSync(directory, { recursive: true, force: true });
        }
    });

    it('keeps a nested output\'s path under the client directory, and ignores what lies outside it', () => {
        const metafile = {
            inputs: {},
            outputs: {
                'dist/client/index.js.map': { imports: [], exports: [], inputs: {}, bytes: 1 },
                'dist/index.js': { imports: [], exports: [], inputs: {}, bytes: 1, entryPoint: 'source/server/index.ts' },
                'dist/client/app/main.js': { imports: [], exports: [], inputs: {}, bytes: 1, entryPoint: 'source/client/index.tsx' },
            },
        } as esbuild.Metafile;
        expect(mainEntryFromMetafile(metafile, 'dist/client')).toBe('/app/main.js');
    });
});
// #endregion module
