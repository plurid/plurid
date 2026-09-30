/**
 * The server as production meets it (2026-09-29): a hostile query, a failing `afterServe`, a preserve
 * that answers without saying so, a body the JSON parser refuses, a route the host adds, a busy port and
 * a stop with a request in flight — what each must NOT do: run script from a query, crash the process,
 * leak a stack, serve `{}` as a page, drop the request. Needs `@plurid/plurid-react` BUILT (`pnpm verify`
 * builds first).
 */

// #region imports
    // #region libraries
    import React from 'react';
    import http from 'http';
    import net from 'net';
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
const Boom = () => {
    throw new Error('plane exploded');
};

const configuration = (
    overrides: Partial<PluridServerConfiguration> = {},
): PluridServerConfiguration => ({
    routes: [
        {
            value: '/',
            exterior: Shell,
            planes: [['/p', Page]],
            view: ['/p'],
            // the document's language from the query: the one field that reached the page unescaped
            head: ({ query }) => ({ lang: query.lang || 'en' }),
        },
        {
            value: '/boom',
            exterior: Shell,
            planes: [['/b', Boom]],
            view: ['/b'],
        },
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

interface Answer {
    status: number;
    headers: http.IncomingHttpHeaders;
    body: string;
}

const listen = (server: PluridServer) => new Promise<http.Server>((resolve) => {
    const instance = server.instance().listen(0, () => resolve(instance));
});

const portOf = (instance: http.Server) => (instance.address() as AddressInfo).port;

const request = (
    port: number,
    path: string,
    options: { method?: string; headers?: Record<string, string>; body?: string } = {},
) => new Promise<Answer>((resolve, reject) => {
    const outgoing = http.request({ host: '127.0.0.1', port, path, method: options.method || 'GET', headers: options.headers }, (response) => {
        let body = '';
        response.on('data', (chunk) => { body += chunk; });
        response.on('end', () => resolve({ status: response.statusCode || 0, headers: response.headers, body }));
    });
    outgoing.on('error', reject);
    outgoing.end(options.body);
});

const close = (instance: http.Server) => new Promise<void>((resolve) => { instance.close(() => resolve()); });

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

/** Every unhandled rejection while `run` runs (one would end a production process: Node's default is to throw). */
const observeUnhandled = async (run: () => Promise<void>) => {
    const unhandled: unknown[] = [];
    const onUnhandled = (reason: unknown) => { unhandled.push(reason); };
    process.on('unhandledRejection', onUnhandled);
    try {
        await run();
        await wait(40);
    } finally {
        process.off('unhandledRejection', onUnhandled);
    }
    return unhandled;
};


describe('the built-in error pages', () => {
    it('the default 404 and 500 are HTML documents, not the `{}` a pending minification serialized to', async () => {
        const server = new PluridServer(configuration());
        const instance = await listen(server);
        try {
            const missing = await request(portOf(instance), '/nope');
            expect(missing.status).toBe(404);
            expect(missing.headers['content-type']).toMatch(/^text\/html/);
            expect(missing.body).toContain('[404] Not Found');

            const failed = await request(portOf(instance), '/boom');
            expect(failed.status).toBe(500);
            expect(failed.headers['content-type']).toMatch(/^text\/html/);
            expect(failed.body).toContain('[500] Server Error');
        } finally {
            await close(instance);
        }
    });

    it('`template.notFoundHtml` replaces the built-in 404 page', async () => {
        const server = new PluridServer(configuration({
            template: {
                minify: false,
                vendorScriptSource: '',
                notFoundHtml: '<html><body>our own 404</body></html>',
            },
        }));
        const instance = await listen(server);
        try {
            const missing = await request(portOf(instance), '/nope');
            expect(missing.status).toBe(404);
            expect(missing.body).toBe('<html><body>our own 404</body></html>');
        } finally {
            await close(instance);
        }
    });
});


describe('what a request can put in the page', () => {
    it('a preserve global carrying `</script>` stays a string: the script is not closed, the value reads back', async () => {
        const payload = '</script><script>alert(document.domain)</script><!--';
        const server = new PluridServer(configuration({
            preserves: [{
                serve: '/',
                onServe: async ({ request }) => ({
                    globals: {
                        __PRELOADED_REDUX_STATE__: JSON.stringify({ search: request.query.q, separators: '\u2028\u2029' }),
                    },
                }),
            }],
        }));
        const instance = await listen(server);
        try {
            const { status, body } = await request(portOf(instance), '/?q=' + encodeURIComponent(payload));
            expect(status).toBe(200);
            expect(body).not.toContain('<script>alert(document.domain)');
            // the inline script is ONE script: it closes where the template closes it
            const inline = body.match(/<script>([\s\S]*?)<\/script>/);
            expect(inline).not.toBeNull();
            expect(inline![1]).toContain('__PRELOADED_REDUX_STATE__');
            expect(inline![1]).toContain('__PRELOADED_PLURID_METASTATE__');
            // and it evaluates to what the preserve serialized
            const window: Record<string, any> = {};
            vm.runInNewContext(inline![1], { window });
            expect(window.__PRELOADED_REDUX_STATE__).toEqual({ search: payload, separators: '\u2028\u2029' });
        } finally {
            await close(instance);
        }
    });

    it('a global whose name is not an identifier is refused (500), never written into the script', async () => {
        const server = new PluridServer(configuration({
            preserves: [{
                serve: '/',
                onServe: async () => ({ globals: { 'x = alert(1); window.y': '1' } }),
            }],
        }));
        const instance = await listen(server);
        try {
            const { status, body } = await request(portOf(instance), '/');
            expect(status).toBe(500);
            expect(body).not.toContain('alert(1)');
        } finally {
            await close(instance);
        }
    });

    it('the document language from a query is escaped like every other attribute', async () => {
        const server = new PluridServer(configuration());
        const instance = await listen(server);
        try {
            const attack = 'en"><script>alert(1)</script><x a="';
            const { status, body } = await request(portOf(instance), '/?lang=' + encodeURIComponent(attack));
            expect(status).toBe(200);
            expect(body).not.toContain('<script>alert(1)</script>');
            expect(body).toContain('<html lang="en&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;&lt;x a=&quot;"');
        } finally {
            await close(instance);
        }
    });
});


describe('a request never takes the process down', () => {
    it('a failing afterServe on the 404 and redirect paths is observed: the responses stand, nothing is unhandled', async () => {
        const afterServe = async () => { throw new Error('analytics down'); };
        const server = new PluridServer(configuration({
            preserves: [
                { serve: '*', onServe: async ({ request }) => (request.path === '/away' ? { redirect: 'https://example.com/' } : undefined), afterServe },
            ],
        }));
        const instance = await listen(server);
        try {
            const unhandled = await observeUnhandled(async () => {
                const missing = await request(portOf(instance), '/does-not-exist');
                expect(missing.status).toBe(404);
                const away = await request(portOf(instance), '/away');
                expect(away.status).toBe(302);
                expect(away.headers.location).toBe('https://example.com/');
            });
            expect(unhandled).toEqual([]);
            // and the server still answers
            expect((await request(portOf(instance), '/')).status).toBe(200);
        } finally {
            await close(instance);
        }
    });

    it('a preserve that responds without `responded: true` keeps its response; the render is skipped, nothing throws', async () => {
        const server = new PluridServer(configuration({
            preserves: [{
                serve: '/',
                onServe: async ({ request, response }) => {
                    if (!request.headers.cookie) {
                        response.redirect('/login');
                    }
                    return undefined;
                },
            }],
        }));
        const instance = await listen(server);
        try {
            const unhandled = await observeUnhandled(async () => {
                const redirected = await request(portOf(instance), '/');
                expect(redirected.status).toBe(302);
                expect(redirected.headers.location).toBe('/login');
            });
            expect(unhandled).toEqual([]);
            const rendered = await request(portOf(instance), '/', { headers: { cookie: 'session=1' } });
            expect(rendered.status).toBe(200);
            expect(rendered.body).toContain('page content');
        } finally {
            await close(instance);
        }
    });

    it('an error reaching Express answers with its status and a generic body: no stack, no path, whatever NODE_ENV says', async () => {
        const server = new PluridServer(configuration({
            usePTTP: true,
            middleware: [
                (request, _response, next) => {
                    if (request.path === '/throws') {
                        throw new Error('middleware exploded at /secret/path.js');
                    }
                    next();
                },
            ],
        }));
        const instance = await listen(server);
        try {
            const malformed = await request(portOf(instance), '/pttp', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: '{bad json',
            });
            expect(malformed.status).toBe(400);
            expect(malformed.body).not.toMatch(/SyntaxError|node_modules|\n\s+at /);

            const thrown = await request(portOf(instance), '/throws');
            expect(thrown.status).toBe(500);
            expect(thrown.body).toContain('[500] Server Error');
            expect(thrown.body).not.toMatch(/exploded|secret|\n\s+at /);
        } finally {
            await close(instance);
        }
    });
});


describe('the host\'s own routes', () => {
    it('`handlers(server)` and `handle().get` register before the page\'s catch-all: a GET health probe answers', async () => {
        const server = new PluridServer(configuration({
            handlers: (host) => {
                host.instance().get('/status', (_request, response) => { response.send('ok'); });
            },
        }));
        server.handle().get('/health', (_request, response) => { response.send('healthy'); });
        const instance = await listen(server);
        try {
            expect(await request(portOf(instance), '/status')).toMatchObject({ status: 200, body: 'ok' });
            expect(await request(portOf(instance), '/health')).toMatchObject({ status: 200, body: 'healthy' });
            const page = await request(portOf(instance), '/');
            expect(page.status).toBe(200);
            expect(page.body).toContain('page content');
        } finally {
            await close(instance);
        }
    });
});


describe('start and stop', () => {
    it('`start()` resolves once listening, is idempotent, and a busy port rejects instead of crashing', async () => {
        const server = new PluridServer(configuration());
        const first = server.start(0);
        const second = server.start(0);
        expect(second).toBe(first);
        const listening = await first;
        const port = (listening.address() as AddressInfo).port;
        expect(port).toBeGreaterThan(0);
        expect((await request(port, '/')).status).toBe(200);

        const busy = new PluridServer(configuration());
        await expect(busy.start(port)).rejects.toMatchObject({ code: 'EADDRINUSE' });
        // a failed start may be retried
        const retried = await busy.start(0);
        expect((retried.address() as AddressInfo).port).toBeGreaterThan(0);

        await busy.stop();
        await server.stop();
        // stopped: a second stop is harmless
        await server.stop();
    });

    it('`stop()` lets the request in flight finish, then resolves; the server can start again', async () => {
        let release: (() => void) | undefined;
        let blocking = true;
        const server = new PluridServer(configuration({
            preserves: [{
                serve: '/',
                onServe: () => (blocking
                    ? new Promise<undefined>((resolve) => { release = () => { blocking = false; resolve(undefined); }; })
                    : Promise.resolve(undefined)),
            }],
        }));
        const listening = await server.start(0);
        const port = (listening.address() as AddressInfo).port;

        const inFlight = request(port, '/');
        while (!release) {
            await wait(5);
        }
        let stopped = false;
        const stopping = server.stop().then(() => { stopped = true; });
        await wait(30);
        expect(stopped).toBe(false);
        release();
        const answer = await inFlight;
        expect(answer.status).toBe(200);
        expect(answer.body).toContain('page content');
        await stopping;
        expect(stopped).toBe(true);

        // the port is free again, and the server starts again
        const restarted = await server.start(port);
        expect((await request((restarted.address() as AddressInfo).port, '/')).status).toBe(200);
        await server.stop(20);
    });

    it('a connection that will not finish is cut after the stop timeout', async () => {
        const server = new PluridServer(configuration({
            preserves: [{ serve: '/', onServe: () => new Promise<undefined>(() => { /* never */ }) }],
        }));
        const listening = await server.start(0);
        const port = (listening.address() as AddressInfo).port;
        const socket = net.connect(port, '127.0.0.1');
        socket.on('error', () => { /* cut: expected */ });
        await new Promise((resolve) => socket.once('connect', resolve));
        socket.write('GET / HTTP/1.1\r\nHost: localhost\r\n\r\n');
        await wait(30);
        const started = Date.now();
        await server.stop(60);
        expect(Date.now() - started).toBeLessThan(2000);
        await new Promise((resolve) => (socket.destroyed ? resolve(undefined) : socket.once('close', resolve)));
    });

    it('SIGTERM drains the request in flight before the process exits 0', async () => {
        const exit = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as any);
        let release: (() => void) | undefined;
        const server = new PluridServer(configuration({
            preserves: [{
                serve: '/',
                onServe: () => new Promise<undefined>((resolve) => { release = () => resolve(undefined); }),
            }],
            options: {
                quiet: true,
                debug: 'none',
                compression: false,
                hostname: 'localhost',
                attachSignalHandlers: true,
            },
        }));
        try {
            const listening = await server.start(0);
            const port = (listening.address() as AddressInfo).port;
            const handler = process.listeners('SIGTERM').find((listener) => listener === (server as any).handleProcessSignal);
            expect(handler).toBeDefined();

            const inFlight = request(port, '/');
            while (!release) {
                await wait(5);
            }
            (handler as () => void)();
            // a second delivery (a terminal's Ctrl+C reaches the supervisor, which forwards it, and the server) is not a second stop
            (handler as () => void)();
            await wait(30);
            expect(exit).not.toHaveBeenCalled();
            release();
            expect((await inFlight).status).toBe(200);
            while (exit.mock.calls.length === 0) {
                await wait(5);
            }
            expect(exit).toHaveBeenCalledTimes(1);
            expect(exit).toHaveBeenCalledWith(0);
            expect(process.listeners('SIGTERM')).not.toContain((server as any).handleProcessSignal);
        } finally {
            exit.mockRestore();
            server.detachSignalHandlers();
        }
    });
});
// #endregion module
