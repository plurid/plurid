/**
 * EACH REQUEST ITS OWN STORE (2026-10-21). A service's store was built once, with the server
 * (`store(undefined)` in the kit), and every request rendered into it: what one reader's request put
 * in the store was in the next reader's page. The state a render left in a store never reached the
 * page either, so the browser rebuilt the store empty unless a preserve serialized it. Needs
 * `@plurid/plurid-react` BUILT, as every real-server test does.
 */

// #region imports
    // #region libraries
    import React from 'react';
    import http from 'http';
    import vm from 'vm';
    import type {
        AddressInfo,
    } from 'net';
    // #endregion libraries


    // #region external
    import PluridServer from '../';
    import {
        PluridServerConfiguration,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
const Page = () => (<div>page content</div>);
const Shell = () => (<div>shell</div>);

interface TestStore {
    state: Record<string, unknown>;
    getState: () => Record<string, unknown>;
}
let made = 0;
const createStore = (
    state: Record<string, unknown> = {},
): TestStore => {
    const store: TestStore = {
        state: { made: ++made, ...state },
        getState: () => store.state,
    };
    return store;
};

/** Writes into its store during the render, as a component loading its data does. */
const Provider = ({
    store,
    children,
}: {
    store?: TestStore;
    children?: React.ReactNode;
}) => {
    if (store) {
        store.state = { ...store.state, rendered: true };
    }
    return <>{children}</>;
};

const configuration = (
    overrides: Partial<PluridServerConfiguration> = {},
): PluridServerConfiguration => ({
    routes: [
        { value: '/', exterior: Shell, planes: [['/p', Page]], view: ['/p'] },
        { value: '/own', exterior: Shell, planes: [['/q', Page]], view: ['/q'] },
    ],
    preserves: [],
    options: {
        quiet: true,
        debug: 'none',
        attachSignalHandlers: false,
        compression: false,
        hostname: 'localhost',
    },
    template: {
        minify: false,
        mainScriptSource: '/main.js',
        vendorScriptSource: '',
    },
    ...overrides,
});

const listen = (server: PluridServer) => new Promise<http.Server>((resolve) => {
    const instance = server.instance().listen(0, () => resolve(instance));
});

const page = (
    instance: http.Server,
    path: string,
) => new Promise<{ status: number; body: string }>((resolve, reject) => {
    const { port, family } = instance.address() as AddressInfo;
    const host = family === 'IPv6' ? '::1' : '127.0.0.1';
    const outgoing = http.request({ host, port, path }, (response) => {
        let body = '';
        response.on('data', (chunk) => { body += chunk; });
        response.on('end', () => resolve({ status: response.statusCode || 0, body }));
    });
    outgoing.on('error', reject);
    outgoing.end();
});

const close = (instance: http.Server) => new Promise<void>((resolve) => { instance.close(() => resolve()); });

/** What the page's inline script sets `window.__PRELOADED_REDUX_STATE__` to. */
const preloaded = (body: string) => {
    const inline = body.match(/<script>([\s\S]*?)<\/script>/);
    const window: Record<string, any> = {};
    vm.runInNewContext(inline![1], { window });
    return window.__PRELOADED_REDUX_STATE__;
};

const serve = async (
    server: PluridServer,
    run: (instance: http.Server) => Promise<void>,
) => {
    const instance = await listen(server);
    try {
        await run(instance);
    } finally {
        await close(instance);
    }
};


describe('a service store, per request', () => {
    it('each request renders into a store of its own, whose state the page carries', async () => {
        const server = new PluridServer(configuration({
            services: [{ name: 'redux', Provider, store: () => createStore() }],
        }));
        await serve(server, async (instance) => {
            const first = preloaded((await page(instance, '/')).body);
            const second = preloaded((await page(instance, '/')).body);
            expect(first.rendered).toBe(true);
            expect(second.rendered).toBe(true);
            expect(first.made).not.toBe(second.made);
        });
    });

    it('a preserve\'s store, or its own state global, wins, and its globals are left as they are', async () => {
        const globals = { other: '1' };
        const server = new PluridServer(configuration({
            services: [{ name: 'redux', Provider, store: () => createStore() }],
            preserves: [
                { serve: '/', onServe: async () => ({ providers: { redux: { store: createStore({ from: 'preserve' }) } }, globals }) },
                { serve: '/own', onServe: async () => ({ globals: { __PRELOADED_REDUX_STATE__: JSON.stringify({ own: true }) } }) },
            ],
        }));
        await serve(server, async (instance) => {
            const state = preloaded((await page(instance, '/')).body);
            expect(state.from).toBe('preserve');
            expect(state.rendered).toBe(true);
            expect(globals).toEqual({ other: '1' });
            expect(preloaded((await page(instance, '/own')).body)).toEqual({ own: true });
        });
    });

    it('serializes no static store, nor the stores of two services, nor none', async () => {
        const cases: PluridServerConfiguration['services'][] = [
            [{ name: 'static', Provider, properties: { store: createStore() } }],
            [{ name: 'a', Provider, store: () => createStore() }, { name: 'b', Provider, store: () => createStore() }],
            [],
        ];
        for (const services of cases) {
            await serve(new PluridServer(configuration({ services })), async (instance) => {
                const { status, body } = await page(instance, '/');
                expect(status).toBe(200);
                expect(preloaded(body)).toBeUndefined();
            });
        }
    });

    it('gives each service its own store, whatever their names (2026-10-22)', async () => {
        // The stores were looked up by name: two services of one name shared the last one's store, and
        // a service named `constructor` was handed Object as its store.
        const seen = new Map<string, unknown>();
        const recording = (label: string) => ({ store, children }: { store?: TestStore; children?: React.ReactNode }) => {
            seen.set(label, store);
            return <>{children}</>;
        };
        const server = new PluridServer(configuration({
            services: [
                { name: 'x', Provider: recording('first'), store: () => createStore({ which: 'first' }) },
                { name: 'x', Provider: recording('second'), store: () => createStore({ which: 'second' }) },
                { name: 'constructor', Provider: recording('constructor') },
            ],
        }));
        await serve(server, async (instance) => {
            expect((await page(instance, '/')).status).toBe(200);
        });
        expect((seen.get('first') as TestStore).state.which).toBe('first');
        expect((seen.get('second') as TestStore).state.which).toBe('second');
        expect(seen.get('constructor')).toBeUndefined();
    });

    it('a state carrying `</script>` stays one string in the script', async () => {
        const payload = '</script><script>alert(document.domain)</script><!--';
        const server = new PluridServer(configuration({
            services: [{ name: 'redux', Provider, store: () => createStore({ search: payload }) }],
        }));
        await serve(server, async (instance) => {
            const { body } = await page(instance, '/');
            expect(body).not.toContain('<script>alert(document.domain)');
            expect(preloaded(body).search).toBe(payload);
        });
    });

    it('a state that cannot be serialized fails the request, naming the service', async () => {
        const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        try {
            const server = new PluridServer(configuration({
                services: [{ name: 'counter', Provider, store: () => createStore({ count: BigInt(1) }) }],
                options: { quiet: false, debug: 'error', attachSignalHandlers: false, compression: false, hostname: 'localhost' },
            }));
            await serve(server, async (instance) => {
                expect((await page(instance, '/')).status).toBe(500);
            });
            expect(error.mock.calls.some((call) => String(call[1]).includes('counter'))).toBe(true);
        } finally {
            error.mockRestore();
        }
    });
});
// #endregion module
