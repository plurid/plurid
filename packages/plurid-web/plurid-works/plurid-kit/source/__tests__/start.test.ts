// #region imports
    // #region libraries
    import fs from 'fs';
    import os from 'os';
    import path from 'path';
    // #endregion libraries


    // #region internal
    import {
        start,
    } from '../cli/start';
    import {
        superviseServer,
    } from '../cli/process';
    // #endregion internal
// #endregion imports



jest.mock('../cli/process', () => ({
    isPortFree: jest.fn(async () => true),
    superviseServer: jest.fn(),
}));


// #region module
/**
 * `plurid start` RUNS A PRODUCTION BUILD (2026-10-20). `plurid dev` writes the same `buildDir`, and
 * `start` ran whatever was there: a development build, unminified, its source maps public, its
 * constants on the local mesh, under a production environment.
 */
describe('plurid start', () => {
    const run = async (manifest: object | undefined) => {
        const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'plurid-kit-start-'));
        fs.mkdirSync(path.join(directory, 'build'));
        fs.writeFileSync(path.join(directory, 'build', 'index.js'), '');
        if (manifest) {
            fs.writeFileSync(path.join(directory, 'build', 'asset-manifest.json'), JSON.stringify(manifest));
        }
        const exit = jest.spyOn(process, 'exit').mockImplementation(((code?: number) => {
            throw new Error('exit ' + code);
        }) as never);
        const written: string[] = [];
        const stderr = jest.spyOn(process.stderr, 'write').mockImplementation((chunk: any) => {
            written.push(String(chunk));
            return true;
        });
        const cwd = process.cwd();
        process.chdir(directory);
        (superviseServer as jest.Mock).mockClear();
        try {
            const outcome = await start([]).then(() => 'started', (error: Error) => error.message);
            return { outcome, supervised: (superviseServer as jest.Mock).mock.calls.length, said: written.join('') };
        } finally {
            process.chdir(cwd);
            exit.mockRestore();
            stderr.mockRestore();
        }
    };

    it('refuses the build `plurid dev` left, and says how to make a production one', async () => {
        const { outcome, supervised, said } = await run({ mode: 'development' });
        expect(outcome).toBe('exit 1');
        expect(supervised).toBe(0);
        expect(said).toMatch(/plurid build/);
    });

    it('runs a production build, and one from before builds named their mode', async () => {
        expect((await run({ mode: 'production', main: '/index.js' })).supervised).toBe(1);
        expect((await run({ main: '/index.js' })).supervised).toBe(1);
    });
});
// #endregion module
