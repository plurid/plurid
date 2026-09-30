/**
 * `plurid start` / `plurid dev` as a supervisor, with real processes: the supervisor script below runs
 * `superviseServer` (this package's `cli/process.ts`, bundled here by esbuild) over a stand-in server,
 * and the test signals and kills them the way a container runtime, supervisord or the OOM killer does.
 */

// #region imports
    // #region libraries
    import { spawn, type ChildProcess } from 'child_process';
    import fs from 'fs';
    import os from 'os';
    import path from 'path';

    import * as esbuild from 'esbuild';
    // #endregion libraries


    // #region internal
    import {
        exitStatusOf,
    } from '../cli/process';
    // #endregion internal
// #endregion imports



// #region module
/** The stand-in server: reports its pid, exits `EXIT_ON_TERM` on SIGTERM / SIGINT (marking that it did). */
const SERVER = `
const fs = require('fs');
const marker = process.env.PLURID_TEST_MARKER;
const leave = (signal) => {
    fs.writeFileSync(marker, signal);
    process.exit(Number(process.env.PLURID_TEST_EXIT_ON_TERM || 0));
};
process.on('SIGTERM', () => leave('SIGTERM'));
process.on('SIGINT', () => leave('SIGINT'));
if (process.env.PLURID_TEST_EXIT_AT_ONCE) {
    process.exit(Number(process.env.PLURID_TEST_EXIT_AT_ONCE));
}
process.stdout.write('server ' + process.pid + '\\n');
setInterval(() => {}, 1000);
`;

const SUPERVISOR = (bundle: string) => `
const { superviseServer } = require(${JSON.stringify(bundle)});
superviseServer(process.argv[2], process.env, {
    onExit: () => require('fs').writeFileSync(process.env.PLURID_TEST_RELEASED, 'released'),
});
`;


describe('superviseServer() (2026-09-29)', () => {
    let directory: string;
    let supervisor: string;
    let server: string;

    beforeAll(async () => {
        directory = fs.mkdtempSync(path.join(os.tmpdir(), 'plurid-kit-supervise-'));
        const bundle = path.join(directory, 'process.cjs');
        await esbuild.build({
            entryPoints: [path.join(__dirname, '..', 'cli', 'process.ts')],
            outfile: bundle,
            bundle: true,
            platform: 'node',
            format: 'cjs',
            logLevel: 'silent',
        });
        supervisor = path.join(directory, 'supervisor.cjs');
        fs.writeFileSync(supervisor, SUPERVISOR(bundle));
        server = path.join(directory, 'server.cjs');
        fs.writeFileSync(server, SERVER);
    });

    afterAll(() => {
        fs.rmSync(directory, { recursive: true, force: true });
    });

    const run = (
        environment: Record<string, string> = {},
    ) => {
        const marker = path.join(directory, 'marker-' + Math.random().toString(36).slice(2));
        const released = marker + '.released';
        const child = spawn(process.execPath, [supervisor, server], {
            env: { ...process.env, PLURID_TEST_MARKER: marker, PLURID_TEST_RELEASED: released, ...environment },
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        const serverPid = new Promise<number>((resolve) => {
            let output = '';
            child.stdout!.on('data', (chunk) => {
                output += chunk.toString();
                const match = output.match(/server (\d+)/);
                if (match) {
                    resolve(Number(match[1]));
                }
            });
        });
        const exited = new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolve) => {
            child.once('exit', (code, signal) => resolve({ code, signal }));
        });
        return { child, marker, released, serverPid, exited };
    };

    const alive = (pid: number) => {
        try {
            process.kill(pid, 0);
            return true;
        } catch {
            return false;
        }
    };

    const kill = (child: ChildProcess, signal: NodeJS.Signals) => {
        child.kill(signal);
    };

    it('passes SIGTERM on to the server, waits for it, and exits as the server did', async () => {
        const supervised = run({ PLURID_TEST_EXIT_ON_TERM: '0' });
        const pid = await supervised.serverPid;
        kill(supervised.child, 'SIGTERM');
        expect(await supervised.exited).toEqual({ code: 0, signal: null });
        expect(fs.readFileSync(supervised.marker, 'utf8')).toBe('SIGTERM');
        expect(fs.readFileSync(supervised.released, 'utf8')).toBe('released');
        expect(alive(pid)).toBe(false);
    });

    it('passes SIGINT and SIGHUP on too; a server leaving with 3 makes the supervisor leave with 3', async () => {
        const interrupted = run({ PLURID_TEST_EXIT_ON_TERM: '3' });
        await interrupted.serverPid;
        kill(interrupted.child, 'SIGINT');
        expect(await interrupted.exited).toEqual({ code: 3, signal: null });
        expect(fs.readFileSync(interrupted.marker, 'utf8')).toBe('SIGINT');

        // SIGHUP: the stand-in does not handle it, so it dies of it, and so does the supervisor
        const hungUp = run();
        const pid = await hungUp.serverPid;
        kill(hungUp.child, 'SIGHUP');
        const status = await hungUp.exited;
        expect(status.signal === 'SIGHUP' || status.code === 129).toBe(true);
        expect(alive(pid)).toBe(false);
    });

    it('a server killed by a signal (the OOM killer\'s SIGKILL) is not a success: the supervisor dies of it too', async () => {
        const supervised = run();
        const pid = await supervised.serverPid;
        process.kill(pid, 'SIGKILL');
        const status = await supervised.exited;
        expect(status.signal === 'SIGKILL' || status.code === 137).toBe(true);
        expect(fs.readFileSync(supervised.released, 'utf8')).toBe('released');
    });

    it('a server that exits on its own hands its code up', async () => {
        const supervised = run({ PLURID_TEST_EXIT_AT_ONCE: '7' });
        expect(await supervised.exited).toEqual({ code: 7, signal: null });
    });
});


describe('exitStatusOf()', () => {
    it('is the code, or 128 + the signal\'s number', () => {
        expect(exitStatusOf(0, null)).toBe(0);
        expect(exitStatusOf(2, null)).toBe(2);
        expect(exitStatusOf(null, 'SIGTERM')).toBe(143);
        expect(exitStatusOf(null, 'SIGKILL')).toBe(137);
        expect(exitStatusOf(null, 'SIGINT')).toBe(130);
    });
});
// #endregion module
