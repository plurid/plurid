// #region imports
    // #region libraries
    import fs from 'fs';
    import os from 'os';
    import path from 'path';
    // #endregion libraries


    // #region internal
    import {
        dev,
    } from '../cli/dev';
    // #endregion internal
// #endregion imports



jest.mock('../cli/process', () => ({
    ...jest.requireActual('../cli/process'),
    isPortFree: jest.fn(async () => false),
}));


// #region module
/**
 * `plurid dev` ON A BUSY PORT LEAVES THE BUILD IT FOUND (2026-10-22). It wrote its development manifest
 * before it checked the port: refused, it had already replaced a production build's manifest, and
 * `plurid start` refused the production build that was still there.
 */
describe('plurid dev', () => {
    it('refuses a busy port before it marks the build its own', async () => {
        const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'plurid-kit-dev-'));
        const manifest = path.join(directory, 'build', 'asset-manifest.json');
        fs.mkdirSync(path.join(directory, 'build'));
        fs.writeFileSync(path.join(directory, 'build', 'index.js'), '');
        fs.writeFileSync(manifest, JSON.stringify({ mode: 'production', main: '/index.js' }));
        const before = fs.readFileSync(manifest, 'utf8');

        const exit = jest.spyOn(process, 'exit').mockImplementation(((code?: number) => {
            throw new Error('exit ' + code);
        }) as never);
        const stderr = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
        const stdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
        // the handlers `dev` installs on the process are taken off again
        const events = ['exit', 'SIGINT', 'SIGTERM', 'SIGHUP'] as const;
        const listening = new Map(events.map((event) => [event, process.listeners(event as any)]));
        const cwd = process.cwd();
        process.chdir(directory);
        try {
            await expect(dev([])).rejects.toThrow('exit 1');
        } finally {
            process.chdir(cwd);
            exit.mockRestore();
            stderr.mockRestore();
            stdout.mockRestore();
            for (const event of events) {
                for (const listener of process.listeners(event as any)) {
                    if (!listening.get(event)!.includes(listener)) {
                        process.removeListener(event as any, listener);
                    }
                }
            }
        }
        expect(fs.readFileSync(manifest, 'utf8')).toBe(before);
        if (process.env.PLURID_PRESERVE_ARTIFACTS !== '1') fs.rmSync(directory, { recursive: true, force: true });
    });
});
// #endregion module
