// #region imports
    // #region libraries
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
// #endregion module
