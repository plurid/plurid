// #region imports
    // #region libraries
    import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
    import { dirname } from 'path';
    import net from 'net';
    // #endregion libraries
// #endregion imports



// #region module
export interface Restartable {
    kill: (signal?: NodeJS.Signals) => boolean | void;
    once: (event: 'exit', listener: (...arguments_: any[]) => void) => unknown;
}

export interface RestarterOptions<T extends Restartable> {
    /** Spawn a fresh server process. */
    spawnChild: () => T;
    /** Coalesce restart requests arriving within this window (a rebuild emits several). Default `150`. */
    debounceMs?: number;
    /** Give the old process this long to exit before it is killed harder. Default `2000`. */
    exitTimeoutMs?: number;
    log?: (message: string) => void;
}

export interface Restarter<T extends Restartable> {
    /** The running child (after `start`). */
    current: () => T | undefined;
    start: () => T;
    /** Request a restart: debounced, SERIALIZED (kill → wait for exit → spawn), never overlapping. */
    restart: () => void;
    /** Stop everything (no respawn). */
    stop: () => Promise<void>;
}


/**
 * A serialized restarter for the dev server child: restart requests are debounced (esbuild's
 * watch emits a burst per change), and a restart never overlaps another — the old process is
 * killed and awaited before the new one is spawned, so two servers never race for the port.
 */
export const createRestarter = <T extends Restartable>(
    options: RestarterOptions<T>,
): Restarter<T> => {
    const debounceMs = options.debounceMs ?? 150;
    const exitTimeoutMs = options.exitTimeoutMs ?? 2000;
    const log = options.log ?? (() => {});

    let child: T | undefined;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let restarting: Promise<void> | null = null;
    let pending = false;
    let stopped = false;

    const exited = (process: T) => new Promise<void>((resolve) => {
        let done = false;
        const finish = () => {
            if (!done) {
                done = true;
                resolve();
            }
        };
        process.once('exit', finish);
        setTimeout(() => {
            try {
                process.kill('SIGKILL');
            } catch (_) { /* gone already */ }
            finish();
        }, exitTimeoutMs);
    });

    const performRestart = async () => {
        if (stopped) {
            return;
        }
        const previous = child;
        if (previous) {
            log('restarting server');
            const wait = exited(previous);
            try {
                previous.kill('SIGTERM');
            } catch (_) { /* gone already */ }
            await wait;
        }
        if (stopped) {
            return;
        }
        child = options.spawnChild();
    };

    const run = () => {
        if (restarting) {
            pending = true;
            return;
        }
        restarting = performRestart().finally(() => {
            restarting = null;
            if (pending) {
                pending = false;
                run();
            }
        });
    };

    return {
        current: () => child,
        start: () => {
            child = options.spawnChild();
            return child;
        },
        restart: () => {
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(() => {
                timer = null;
                run();
            }, debounceMs);
        },
        stop: async () => {
            stopped = true;
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            if (restarting) {
                await restarting;
            }
            const previous = child;
            child = undefined;
            if (previous) {
                const wait = exited(previous);
                try {
                    previous.kill('SIGTERM');
                } catch (_) { /* gone already */ }
                await wait;
            }
        },
    };
};


/** Whether a TCP port can be bound on this host (a pre-flight check before spawning the server). */
export const isPortFree = (
    port: number,
    host = '0.0.0.0',
): Promise<boolean> => new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once('error', () => {
        resolve(false);
    });
    server.listen({ port, host }, () => {
        server.close(() => {
            resolve(true);
        });
    });
});


/** ONE `plurid dev` PER ROOT: what the pidfile it claims records. */
export interface PidfileClaim {
    /** the earlier dev on this root that was told to stop, and did */
    replaced?: number;
    /** a pidfile left by a dev that is no longer running */
    stale?: number;
}

export interface PidfileOptions {
    /** whether a process is running (default: `process.kill(pid, 0)`) */
    alive?: (pid: number) => boolean;
    /** how an earlier dev is told to stop (default: `SIGTERM`) */
    kill?: (pid: number) => void;
    /** how long to wait for it to go, in ms (default 3000) */
    timeoutMs?: number;
    /** the poll, in ms */
    intervalMs?: number;
}

const processAlive = (
    pid: number,
): boolean => {
    try {
        process.kill(pid, 0);
        return true;
    } catch (_error) {
        return false;
    }
};

const readPid = (
    path: string,
): number | undefined => {
    if (!existsSync(path)) {
        return undefined;
    }
    const value = Number.parseInt(readFileSync(path, 'utf8').trim(), 10);
    return Number.isFinite(value) && value > 0 ? value : undefined;
};

/**
 * Claim the root's pidfile for this dev. An earlier dev still running on the same root is told
 * to stop and waited for (two watchers on one root rebuild the same tree behind each other, and
 * the older one keeps serving what the newer one just replaced); one that is gone is stale and
 * simply overwritten. The claim outlives a crash only as a stale file, which the next claim clears.
 */
export const claimPidfile = async (
    path: string,
    pid: number,
    options: PidfileOptions = {},
): Promise<PidfileClaim> => {
    const alive = options.alive ?? processAlive;
    const kill = options.kill ?? ((target: number) => { process.kill(target, 'SIGTERM'); });
    const timeoutMs = options.timeoutMs ?? 3000;
    const intervalMs = options.intervalMs ?? 50;
    const claim: PidfileClaim = {};

    const previous = readPid(path);
    if (previous !== undefined && previous !== pid) {
        if (alive(previous)) {
            kill(previous);
            const deadline = Date.now() + timeoutMs;
            while (alive(previous) && Date.now() < deadline) {
                await new Promise((resolve) => setTimeout(resolve, intervalMs));
            }
            if (alive(previous)) {
                throw new Error(`[plurid dev] an earlier dev (pid ${previous}) on this root did not stop; stop it, or remove ${path}`);
            }
            claim.replaced = previous;
        } else {
            claim.stale = previous;
        }
    }

    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, String(pid) + '\n');
    return claim;
};

/** Release the pidfile, if it is still this dev's (a later claim is the later dev's to keep). */
export const releasePidfile = (
    path: string,
    pid: number,
): void => {
    if (readPid(path) === pid) {
        rmSync(path, { force: true });
    }
};
// #endregion module

