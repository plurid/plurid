// #region imports
    // #region libraries
    import { execFileSync, spawn, type ChildProcess } from 'child_process';
    import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
    import { constants } from 'os';
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

    // The hard kill is a FALLBACK: disarmed the moment the process exits, or every restart left a
    // timer behind that signalled a process already gone (and held a test runner open for 2 s)
    const exited = (process: T) => new Promise<void>((resolve) => {
        let done = false;
        let fallback: ReturnType<typeof setTimeout> | null = null;
        const finish = () => {
            if (fallback) {
                clearTimeout(fallback);
                fallback = null;
            }
            if (!done) {
                done = true;
                resolve();
            }
        };
        process.once('exit', finish);
        fallback = setTimeout(() => {
            fallback = null;
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


/** The signals a supervisor (`plurid start`, `plurid dev`) passes on to the server it runs. */
export const FORWARDED_SIGNALS: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGHUP'];


/**
 * Pass each of `signals` this process receives on to `child`. A supervisor that signals only the main
 * process (`kill <pid>`, supervisord, a container runtime where `plurid start` is PID 1) stopped
 * `plurid start` and left the server it had spawned running, orphaned, holding the port (2026-09-29).
 * Listening also keeps the supervisor from dying of the signal itself: it waits for the child (see
 * `superviseServer`). Returns the function that stops the forwarding.
 */
export const forwardSignals = (
    child: Pick<ChildProcess, 'kill'>,
    signals: NodeJS.Signals[] = FORWARDED_SIGNALS,
    target: NodeJS.EventEmitter = process,
): (() => void) => {
    const forwarders = signals.map((signal) => {
        const forward = () => {
            try {
                child.kill(signal);
            } catch (_) { /* gone already */ }
        };
        target.on(signal, forward);
        return () => {
            target.removeListener(signal, forward);
        };
    });

    return () => {
        for (const stop of forwarders) {
            stop();
        }
    };
};


/** A process's exit status as a shell reports it: the code, or `128 + n` for death by signal `n`. */
export const exitStatusOf = (
    code: number | null,
    signal: NodeJS.Signals | null,
): number => {
    if (signal) {
        return 128 + ((constants.signals as Record<string, number>)[signal] ?? 0);
    }
    return code ?? 1;
};


/**
 * End this process as its child ended: with the child's code, or — killed by a signal (the OOM
 * killer's SIGKILL, an operator's SIGTERM to the server alone) — by the same signal, re-raised on
 * itself, so whatever runs `plurid start` sees what happened to the server; `128 + n` where the
 * signal does not end it. `process.exit(code || 0)` reported a server killed by a signal as a success,
 * and `restart: on-failure` never restarted it (2026-09-29). Call it with no listener of this
 * process's own left on the signal.
 */
export const exitLikeChild = (
    code: number | null,
    signal: NodeJS.Signals | null,
): void => {
    const status = exitStatusOf(code, signal);
    if (!signal) {
        process.exit(status);
    }

    process.exitCode = status;
    try {
        process.kill(process.pid, signal);
    } catch (_) { /* a signal this platform cannot raise: the status stands */ }
    // still here (a signal that does not terminate, or not delivered yet): leave with the status
    setTimeout(() => {
        process.exit(status);
    }, 500);
};


/**
 * Run the built server as a supervised child: spawned with this very Node (`process.execPath`, not
 * whichever `node` is first on PATH), the stdio shared, the signals forwarded (`forwardSignals`), and
 * this process ending as the server did (`exitLikeChild`) once `onExit` (a pidfile's release) has run.
 */
export const superviseServer = (
    serverEntry: string,
    environment: NodeJS.ProcessEnv,
    options: { onExit?: () => void } = {},
): ChildProcess => {
    const child = spawn(process.execPath, [serverEntry], {
        stdio: 'inherit',
        env: environment,
    });
    const stopForwarding = forwardSignals(child);

    let ended = false;
    const end = () => {
        if (ended) {
            return false;
        }
        ended = true;
        stopForwarding();
        options.onExit?.();
        return true;
    };

    child.once('error', (error) => {
        if (end()) {
            process.stderr.write(`[plurid] could not run the server (${serverEntry}): ${error.message}\n`);
            process.exit(1);
        }
    });
    child.once('exit', (code, signal) => {
        if (end()) {
            exitLikeChild(code, signal);
        }
    });

    return child;
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
    /** whether a running process is a `plurid dev` (default: its command line, through `ps`) */
    identify?: (pid: number) => boolean;
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

/**
 * Whether `pid` is a `plurid dev`: its command line runs plurid, with `dev` as an argument after it.
 * A pidfile outlives a dev killed hard (SIGKILL, a crash), and by the next run its pid may belong to
 * an unrelated process, which the claim then SIGTERMed (2026-09-29). Where `ps` cannot answer (Windows),
 * the process is taken to be one, as before.
 */
const isPluridDev = (
    pid: number,
): boolean => {
    let command: string;
    try {
        command = execFileSync('ps', ['-o', 'command=', '-p', String(pid)], {
            stdio: ['ignore', 'pipe', 'ignore'],
        }).toString();
    } catch (_error) {
        return true;
    }
    const words = command.trim().split(/\s+/);
    const plurid = words.findIndex((word) => /plurid/.test(word));
    return plurid !== -1 && words.slice(plurid + 1).includes('dev');
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
    const identify = options.identify ?? isPluridDev;
    const kill = options.kill ?? ((target: number) => { process.kill(target, 'SIGTERM'); });
    const timeoutMs = options.timeoutMs ?? 3000;
    const intervalMs = options.intervalMs ?? 50;
    const claim: PidfileClaim = {};

    const previous = readPid(path);
    if (previous !== undefined && previous !== pid) {
        if (alive(previous) && identify(previous)) {
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

