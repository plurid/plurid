// #region imports
    // #region libraries
    import fs from 'fs';
    import os from 'os';
    import path from 'path';

    import * as esbuild from 'esbuild';
    // #endregion libraries


    // #region internal
    import {
        mainEntryFromMetafile,
    } from '../cli/build';
    import {
        resolvePaths,
    } from '../cli/paths';
    // #endregion internal
// #endregion imports



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
            fs.rmSync(directory, { recursive: true, force: true });
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
