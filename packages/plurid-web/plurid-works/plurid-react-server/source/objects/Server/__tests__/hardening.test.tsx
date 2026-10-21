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
    import fs from 'fs';
    import http from 'http';
    import net from 'net';
    import os from 'os';
    import path from 'path';
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

// On macOS an IPv6 listener can share a port with an unrelated IPv4 service.
// Connect through the address family this server actually bound.
const addressOf = (instance: http.Server) => {
    const { port, family } = instance.address() as AddressInfo;
    return { host: family === 'IPv6' ? '::1' : '127.0.0.1', port };
};

const request = (
    instance: http.Server,
    path: string,
    options: { method?: string; headers?: Record<string, string>; body?: string } = {},
) => new Promise<Answer>((resolve, reject) => {
    const outgoing = http.request({ ...addressOf(instance), path, method: options.method || 'GET', headers: options.headers }, (response) => {
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
            const missing = await request(instance, '/nope');
            expect(missing.status).toBe(404);
            expect(missing.headers['content-type']).toMatch(/^text\/html/);
            expect(missing.body).toContain('[404] Not Found');

            const failed = await request(instance, '/boom');
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
            const missing = await request(instance, '/nope');
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
            const { status, body } = await request(instance, '/?q=' + encodeURIComponent(payload));
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
            const { status, body } = await request(instance, '/');
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
            const { status, body } = await request(instance, '/?lang=' + encodeURIComponent(attack));
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
                const missing = await request(instance, '/does-not-exist');
                expect(missing.status).toBe(404);
                const away = await request(instance, '/away');
                expect(away.status).toBe(302);
                expect(away.headers.location).toBe('https://example.com/');
            });
            expect(unhandled).toEqual([]);
            // and the server still answers
            expect((await request(instance, '/')).status).toBe(200);
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
                const redirected = await request(instance, '/');
                expect(redirected.status).toBe(302);
                expect(redirected.headers.location).toBe('/login');
            });
            expect(unhandled).toEqual([]);
            const rendered = await request(instance, '/', { headers: { cookie: 'session=1' } });
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
            const malformed = await request(instance, '/pttp', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: '{bad json',
            });
            expect(malformed.status).toBe(400);
            expect(malformed.body).not.toMatch(/SyntaxError|node_modules|\n\s+at /);

            const thrown = await request(instance, '/throws');
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
            expect(await request(instance, '/status')).toMatchObject({ status: 200, body: 'ok' });
            expect(await request(instance, '/health')).toMatchObject({ status: 200, body: 'healthy' });
            const page = await request(instance, '/');
            expect(page.status).toBe(200);
            expect(page.body).toContain('page content');
        } finally {
            await close(instance);
        }
    });
});


describe('HTTP test connections', () => {
    it('requests its own listener when IPv4 and IPv6 services share a port', async () => {
        const decoy = http.createServer((_, response) => response.writeHead(401).end('another service'));
        await new Promise<void>((resolve, reject) => {
            decoy.once('error', reject);
            decoy.listen(0, '127.0.0.1', resolve);
        });
        let instance: http.Server | undefined;
        try {
            const server = new PluridServer(configuration());
            instance = await new Promise<http.Server>((resolve, reject) => {
                const current = server.instance().listen({
                    port: addressOf(decoy).port, host: '::1', ipv6Only: true,
                }, () => resolve(current));
                current.once('error', reject);
            });
            const answer = await request(instance, '/');
            expect(answer.status).toBe(200);
            expect(answer.body).toContain('page content');
        } finally {
            if (instance) await close(instance);
            await close(decoy);
        }
    });
});


describe('stills and ignored paths', () => {
    /** A build directory outside the working directory, holding one still for `/`. */
    const stilled = () => {
        const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'plurid-stills-served-'));
        fs.mkdirSync(path.join(directory, 'stills'));
        fs.writeFileSync(path.join(directory, 'stills', 'metadata.json'), JSON.stringify([{ route: '/', name: 'home.json' }]));
        fs.writeFileSync(path.join(directory, 'stills', 'home.json'), JSON.stringify({ route: '/', html: '<html>the still</html>' }));
        return directory;
    };

    it('serves a still from an absolute build directory, and for the route\'s query too', async () => {
        // An absolute `buildDirectory` was joined under the working directory (`<cwd>/abs/build/stills`),
        // and a still was looked up with the query: `/?utm=x` rendered live (2026-10-20).
        const directory = stilled();
        const server = new PluridServer(configuration({
            options: { ...configuration().options, buildDirectory: directory },
        }));
        await wait(50);
        const instance = await listen(server);
        try {
            expect((await request(instance, '/')).body).toContain('the still');
            expect((await request(instance, '/?utm_source=x&gclid=y')).body).toContain('the still');
            // a query the page may read renders live: every query was dropped, and `/?lang=fr` got the
            // still rendered for `/` (2026-10-22)
            expect((await request(instance, '/?lang=fr')).body).not.toContain('the still');
        } finally {
            await close(instance);
            if (process.env.PLURID_PRESERVE_ARTIFACTS !== '1') fs.rmSync(directory, { recursive: true, force: true });
        }
    });

    it('logs an ignored path as passed on, not as a 204 it never answers', async () => {
        const logged: string[] = [];
        const info = jest.spyOn(console, 'info').mockImplementation((...parts: unknown[]) => { logged.push(parts.join(' ')); });
        const server = new PluridServer(configuration({
            options: { ...configuration().options, quiet: false, debug: 'info', ignore: ['/api/*'] },
        }));
        const instance = await listen(server);
        try {
            expect((await request(instance, '/api/x')).status).toBe(404);
            expect(logged.some((line) => line.includes('/api/x'))).toBe(true);
            expect(logged.some((line) => line.includes('204'))).toBe(false);
        } finally {
            info.mockRestore();
            await close(instance);
        }
    });
});


describe('PTTP', () => {
    const body = JSON.stringify({ path: '/p' });
    const json = { 'content-type': 'application/json' };

    it('answers another site only when it is allowed, and says that the answer varies by origin', async () => {
        // Any origin was reflected, with credentials allowed (2026-10-20).
        const server = new PluridServer(configuration({ usePTTP: true, pttpOrigins: ['https://allowed.example'] }));
        const instance = await listen(server);
        try {
            const foreign = await request(instance, '/pttp', { method: 'POST', body, headers: { ...json, origin: 'https://evil.example' } });
            expect(foreign.headers['access-control-allow-origin']).toBeUndefined();
            expect(foreign.headers['access-control-allow-credentials']).toBeUndefined();
            expect(String(foreign.headers.vary)).toMatch(/Origin/);

            const allowed = await request(instance, '/pttp', { method: 'POST', body, headers: { ...json, origin: 'https://allowed.example' } });
            expect(allowed.headers['access-control-allow-origin']).toBe('https://allowed.example');
            expect(allowed.headers['access-control-allow-credentials']).toBe('true');

            const preflight = await request(instance, '/pttp', { method: 'OPTIONS', headers: { origin: 'https://allowed.example', 'access-control-request-method': 'POST' } });
            expect(preflight.status).toBe(204);
            expect(preflight.headers['access-control-allow-origin']).toBe('https://allowed.example');
        } finally {
            await close(instance);
        }
    });

    it('compares the allowed origins whole, a single string too (2026-10-22)', async () => {
        // A string (a JavaScript config) made the check a substring test: `https://allowed.exampl` passed.
        const server = new PluridServer(configuration({ usePTTP: true, pttpOrigins: 'https://allowed.example' as any }));
        const instance = await listen(server);
        try {
            const near = await request(instance, '/pttp', { method: 'POST', body, headers: { ...json, origin: 'https://allowed.exampl' } });
            expect(near.headers['access-control-allow-origin']).toBeUndefined();
            const allowed = await request(instance, '/pttp', { method: 'POST', body, headers: { ...json, origin: 'https://allowed.example' } });
            expect(allowed.headers['access-control-allow-origin']).toBe('https://allowed.example');
        } finally {
            await close(instance);
        }
    });

    it('waits for a custom handler\'s answer that starts later, a file or a stream (2026-10-22)', async () => {
        // `headersSent` is false until `sendFile` has read the file: the server answered 500 over it.
        const server = new PluridServer(configuration({
            usePTTP: true,
            options: { ...configuration().options, pttpAnswerTimeout: 400 } as any,
            pttpHandler: async (_path, _request, response) => {
                setTimeout(() => response.json({ late: true }), 50);
                return true;
            },
        }));
        const instance = await listen(server);
        try {
            const answer = await request(instance, '/pttp', { method: 'POST', body, headers: json });
            expect(answer.status).toBe(200);
            expect(JSON.parse(answer.body)).toEqual({ late: true });
        } finally {
            await close(instance);
        }
    });

    it('answers a request a custom handler claimed without answering it', async () => {
        // The handler was given the path only, so one that resolved `true` left the request open.
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        const claimed = new PluridServer(configuration({
            usePTTP: true,
            options: { ...configuration().options, pttpAnswerTimeout: 200 } as any,
            pttpHandler: async () => true,
        }));
        const answering = new PluridServer(configuration({
            usePTTP: true,
            pttpHandler: async (_path, _request, response) => {
                response.json({ handled: true });
                return true;
            },
        }));
        const first = await listen(claimed);
        const second = await listen(answering);
        try {
            const unanswered = await Promise.race([
                request(first, '/pttp', { method: 'POST', body, headers: json }),
                wait(1000).then(() => undefined),
            ]);
            expect(unanswered?.status).toBe(500);
            expect(JSON.parse((await request(second, '/pttp', { method: 'POST', body, headers: json })).body)).toEqual({ handled: true });
        } finally {
            warn.mockRestore();
            await close(first);
            await close(second);
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
        expect((await request(listening, '/')).status).toBe(200);

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

        const inFlight = request(listening, '/');
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
        expect((await request(restarted, '/')).status).toBe(200);
        await server.stop(20);
    });

    it('a connection that will not finish is cut after the stop timeout', async () => {
        const server = new PluridServer(configuration({
            preserves: [{ serve: '/', onServe: () => new Promise<undefined>(() => { /* never */ }) }],
        }));
        const listening = await server.start(0);
        const socket = net.connect(addressOf(listening));
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
            const handler = process.listeners('SIGTERM').find((listener) => listener === (server as any).handleProcessSignal);
            expect(handler).toBeDefined();

            const inFlight = request(listening, '/');
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
