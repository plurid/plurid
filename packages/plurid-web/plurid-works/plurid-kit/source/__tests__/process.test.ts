// #region imports
    // #region libraries
    import net from 'net';
    // #endregion libraries


    // #region external
    import {
        createRestarter,
        isPortFree,
    } from '../cli/process';
    // #endregion external
// #endregion imports



// #region module
/** A fake child: `kill` schedules its `exit` listener asynchronously, like a real process. */
class FakeChild {
    public killed = false;
    private listeners: (() => void)[] = [];
    constructor(public id: number, private exitDelay = 5) {}
    kill() {
        this.killed = true;
        setTimeout(() => {
            for (const listener of this.listeners) {
                listener();
            }
        }, this.exitDelay);
        return true;
    }
    once(_event: 'exit', listener: () => void) {
        this.listeners.push(listener);
        return this;
    }
}

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));


describe('createRestarter()', () => {
    it('debounces a burst of restart requests into one serialized kill → exit → spawn', async () => {
        let spawned = 0;
        const restarter = createRestarter({
            spawnChild: () => new FakeChild(++spawned),
            debounceMs: 20,
        });
        const first = restarter.start();
        expect(spawned).toBe(1);

        restarter.restart();
        restarter.restart();
        restarter.restart();
        await wait(60);
        expect(first.killed).toBe(true);
        expect(spawned).toBe(2);
        expect(restarter.current()?.id).toBe(2);
    });

    it('a restart requested mid-restart runs after the current one, never overlapping', async () => {
        let spawned = 0;
        const children: FakeChild[] = [];
        const restarter = createRestarter({
            spawnChild: () => {
                const child = new FakeChild(++spawned, 30);
                children.push(child);
                return child;
            },
            debounceMs: 5,
        });
        restarter.start();
        restarter.restart();
        await wait(15);
        // the first restart is waiting for child 1 to exit; ask again
        restarter.restart();
        await wait(120);
        expect(spawned).toBe(3);
        // every spawn happened after the previous child was killed
        expect(children[0].killed).toBe(true);
        expect(children[1].killed).toBe(true);
        expect(children[2].killed).toBe(false);
        await restarter.stop();
        expect(children[2].killed).toBe(true);
    });
});


describe('isPortFree()', () => {
    it('reports a bound port as taken and a free one as free', async () => {
        const server = net.createServer();
        await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
        const port = (server.address() as net.AddressInfo).port;
        expect(await isPortFree(port, '127.0.0.1')).toBe(false);
        await new Promise<void>((resolve) => server.close(() => resolve()));
        expect(await isPortFree(port, '127.0.0.1')).toBe(true);
    });
});
// #endregion module
