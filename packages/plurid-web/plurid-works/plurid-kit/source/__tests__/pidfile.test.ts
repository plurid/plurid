// #region imports
    // #region libraries
    import { mkdtempSync, readFileSync, existsSync, rmSync } from 'fs';
    import { tmpdir } from 'os';
    import { join } from 'path';
    // #endregion libraries


    // #region external
    import {
        claimPidfile,
        releasePidfile,
    } from '../cli/process';
    // #endregion external
// #endregion imports



// #region module
describe('one plurid dev per root', () => {
    const root = mkdtempSync(join(tmpdir(), 'plurid-dev-'));
    const pidfile = join(root, 'build', 'dev.pid');
    afterAll(() => rmSync(root, { recursive: true, force: true }));

    it('claims a fresh root, and releases only its own claim', async () => {
        expect(await claimPidfile(pidfile, 4242)).toEqual({});
        expect(readFileSync(pidfile, 'utf8').trim()).toBe('4242');
        releasePidfile(pidfile, 1);
        expect(existsSync(pidfile)).toBe(true);
        releasePidfile(pidfile, 4242);
        expect(existsSync(pidfile)).toBe(false);
    });

    it('replaces an earlier dev still running on the root: told to stop, waited for', async () => {
        await claimPidfile(pidfile, 1001);
        let running = true;
        const killed: number[] = [];
        const claim = await claimPidfile(pidfile, 1002, {
            alive: (pid) => pid === 1001 && running,
            kill: (pid) => { killed.push(pid); setTimeout(() => { running = false; }, 20).unref(); },
            intervalMs: 5,
        });
        expect(killed).toEqual([1001]);
        expect(claim).toEqual({ replaced: 1001 });
        expect(readFileSync(pidfile, 'utf8').trim()).toBe('1002');
    });

    it('clears a stale file without killing anything, and refuses one that will not stop', async () => {
        const killed: number[] = [];
        const stale = await claimPidfile(pidfile, 1003, { alive: () => false, kill: (pid) => { killed.push(pid); } });
        expect(stale).toEqual({ stale: 1002 });
        expect(killed).toEqual([]);

        await expect(claimPidfile(pidfile, 1004, { alive: () => true, kill: () => {}, timeoutMs: 30, intervalMs: 5 }))
            .rejects.toThrow(/did not stop/);
    });
});
// #endregion module
