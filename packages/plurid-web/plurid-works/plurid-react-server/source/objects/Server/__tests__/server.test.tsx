/**
 * The server over HTTP: a real `PluridServer` with a tiny route table, listened on a random port,
 * asserting the DOCUMENT (one title, deduped meta, precedence), styles, metastate, the 404 and 500
 * paths, the `document` hook and the suspense render mode. Needs `@plurid/plurid-react` BUILT
 * (`pnpm verify` builds first).
 */

// #region imports
    // #region libraries
    import React from 'react';
    import http from 'http';
    import type {
        AddressInfo,
    } from 'net';

    import styled from 'styled-components';

    import {
        PluridDocument,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import PluridServer from '../';
    import {
        ignoreGetRequest,
    } from '../preserves';
    import {
        PluridServerConfiguration,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
const StyledPlane = styled.div`
    color: rgb(1, 2, 3);
`;

const PlaneA = () => (
    <StyledPlane>
        <PluridDocument
            title="in-render"
            description="from the plane"
        >
            <meta property="og:type" content="website" />
        </PluridDocument>
        plane a content
    </StyledPlane>
);

const Boom = () => {
    throw new Error('plane exploded');
};

// The Suspense protocol by hand (the package's React types predate `use()`): throw the promise
// until it settles, then render the value.
let lateValue: string | undefined;
const pending = new Promise<string>((resolve) => {
    setTimeout(() => {
        lateValue = 'late data';
        resolve(lateValue);
    }, 30);
});
const Late = () => {
    if (lateValue === undefined) {
        throw pending;
    }
    const value = lateValue;
    return (
        <StyledPlane>
            <PluridDocument title="late title" />
            {value}
        </StyledPlane>
    );
};

const Shell = () => (<div>shell</div>);

const configuration = (
    overrides: Partial<PluridServerConfiguration> = {},
): PluridServerConfiguration => ({
    routes: [
        {
            value: '/',
            exterior: Shell,
            head: { title: 'route title', description: 'from the route', canonical: 'https://example.com/' },
            planes: [
                { value: '/a', component: PlaneA, head: { title: 'plane head', meta: [{ name: 'robots', content: 'index' }] } },
            ],
            view: ['/a'],
        },
        {
            value: '/boom',
            exterior: Shell,
            planes: [['/b', Boom]],
            view: ['/b'],
        },
        {
            value: '/late',
            exterior: Shell,
            planes: [['/l', Late]],
            view: ['/l'],
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
        htmlLanguage: 'en',
        head: { title: 'static title', description: 'static', meta: [{ property: 'og:site_name', content: 'plurid' }] },
        favicon: '/favicon.ico',
        mainScriptSource: '/main.js',
        vendorScriptSource: '',
        errorHtml: '<html><body>custom failure page</body></html>',
    },
    ...overrides,
});

const listen = (server: PluridServer) => new Promise<http.Server>((resolve) => {
    const instance = server.instance().listen(0, () => resolve(instance));
});

const get = (instance: http.Server, path: string) => new Promise<{ status: number; body: string }>((resolve, reject) => {
    const { port } = instance.address() as AddressInfo;
    http.get({ host: '127.0.0.1', port, path }, (response) => {
        let body = '';
        response.on('data', (chunk) => { body += chunk; });
        response.on('end', () => resolve({ status: response.statusCode || 0, body }));
    }).on('error', reject);
});

const count = (body: string, pattern: RegExp) => (body.match(pattern) || []).length;

const close = (instance: http.Server) => new Promise<void>((resolve) => { instance.close(() => resolve()); });


describe('PluridServer over HTTP', () => {
    it('renders ONE title from the highest layer, deduped meta in precedence order, styles and the metastate', async () => {
        const server = new PluridServer(configuration());
        const instance = await listen(server);
        try {
            const { status, body } = await get(instance, '/');
            expect(status).toBe(200);
            expect(count(body, /<title>/g)).toBe(1);
            expect(body).toContain('<title>in-render</title>');
            // meta: the static og:site_name, the route's description replaced by the plane's declaration
            expect(count(body, /name="description"/g)).toBe(1);
            expect(body).toContain('<meta name="description" content="from the plane">');
            expect(body).toContain('<meta property="og:site_name" content="plurid">');
            expect(body).toContain('<meta name="robots" content="index">');
            expect(body).toContain('<meta property="og:type" content="website">');
            expect(body).toContain('<link rel="canonical" href="https://example.com/">');
            expect(body).toContain('<link rel="icon" href="/favicon.ico">');
            expect(body).toContain('<html lang="en"');
            expect(body).toContain('plane a content');
            expect(body).toContain('window.__PRELOADED_PLURID_METASTATE__ =');
            expect(body).toMatch(/<style data-styled[^>]*>[^<]*rgb\(1, 2, 3\)/);
            expect(body).toContain('<script defer src="/main.js">');
            // the head sits in <head>, never inside the root
            const root = body.slice(body.indexOf('<div id="'));
            expect(root).not.toContain('<title>');
        } finally {
            await close(instance);
        }
    });

    it('answers 404 with the not-found template and 500 with the custom error page on a render failure', async () => {
        const server = new PluridServer(configuration());
        const instance = await listen(server);
        try {
            const missing = await get(instance, '/nope');
            expect(missing.status).toBe(404);

            const failed = await get(instance, '/boom');
            expect(failed.status).toBe(500);
            expect(failed.body).toBe('<html><body>custom failure page</body></html>');
        } finally {
            await close(instance);
        }
    });

    it('the document hook is the highest layer and sees the assembled document and the request', async () => {
        const seen: any[] = [];
        const server = new PluridServer(configuration({
            document: (context) => {
                seen.push({ url: context.request.url, title: context.document.title, description: context.document.description });
                return { title: 'hook ' + context.request.url, meta: [{ name: 'robots', content: 'noindex' }] };
            },
        }));
        const instance = await listen(server);
        try {
            const { body } = await get(instance, '/');
            expect(body).toContain('<title>hook /</title>');
            expect(count(body, /<title>/g)).toBe(1);
            expect(body).toContain('<meta name="robots" content="noindex">');
            expect(count(body, /name="robots"/g)).toBe(1);
            expect(seen).toEqual([{ url: '/', title: 'in-render', description: undefined }]);
        } finally {
            await close(instance);
        }
    });

    it('`render: "suspense"` waits for a plane that suspends and still collects its styles and its document', async () => {
        const server = new PluridServer(configuration({ render: 'suspense' }));
        const instance = await listen(server);
        try {
            const { status, body } = await get(instance, '/late');
            expect(status).toBe(200);
            expect(body).toContain('late data');
            expect(body).toContain('<title>late title</title>');
            expect(count(body, /<title>/g)).toBe(1);
            expect(body).toMatch(/<style data-styled[^>]*>[^<]*rgb\(1, 2, 3\)/);
        } finally {
            await close(instance);
        }
    });

    it('a deprecated `helmet` option warns once and is otherwise ignored', async () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            const server = new PluridServer(configuration({ helmet: {}, options: { quiet: false, debug: 'none', attachSignalHandlers: false, compression: false, hostname: 'localhost' } }));
            expect(warn).toHaveBeenCalledTimes(1);
            expect(warn.mock.calls[0][0]).toContain('helmet');
            const instance = await listen(server);
            try {
                const { body } = await get(instance, '/');
                expect(body).toContain('<title>in-render</title>');
            } finally {
                await close(instance);
            }
        } finally {
            warn.mockRestore();
        }
    });

    describe('loading failures and post-response hooks (C07 / C08 / C09, 2026-09-06)', () => {
        it('an onServe failure without onError is the request\'s failure: the error page, not a normal-looking response', async () => {
            const server = new PluridServer(configuration({
                preserves: [{ serve: '/', onServe: async () => { throw new Error('load failed'); } }],
            }));
            const instance = await listen(server);
            try {
                const failed = await get(instance, '/');
                expect(failed.status).toBe(500);
                expect(failed.body).toBe('<html><body>custom failure page</body></html>');
            } finally {
                await close(instance);
            }
        });

        it('onError may respond, depreserve, or return nothing (handled): rendering continues', async () => {
            const server = new PluridServer(configuration({
                preserves: [{ serve: '/', onServe: async () => { throw new Error('load failed'); }, onError: async () => undefined }],
            }));
            const instance = await listen(server);
            try {
                const handled = await get(instance, '/');
                expect(handled.status).toBe(200);
                expect(handled.body).toContain('plane a content');
            } finally {
                await close(instance);
            }
        });

        it('a rejected afterServe is observed: the sent response stands and nothing is left unhandled', async () => {
            const unhandled: unknown[] = [];
            const onUnhandled = (reason: unknown) => { unhandled.push(reason); };
            process.on('unhandledRejection', onUnhandled);
            const server = new PluridServer(configuration({
                preserves: [{ serve: '/', onServe: async () => undefined, afterServe: async () => { throw new Error('after failed'); } }],
            }));
            const instance = await listen(server);
            try {
                const served = await get(instance, '/');
                expect(served.status).toBe(200);
                await new Promise((resolve) => setTimeout(resolve, 30));
                expect(unhandled).toEqual([]);
            } finally {
                process.off('unhandledRejection', onUnhandled);
                await close(instance);
            }
        });

        it('ignore prefixes match on a segment boundary', () => {
            const options = { ignore: ['/api/*', '/exact'] } as any;
            expect(ignoreGetRequest(options, '/api')).toBe(true);
            expect(ignoreGetRequest(options, '/api/x')).toBe(true);
            expect(ignoreGetRequest(options, '/api/x?y=1')).toBe(true);
            expect(ignoreGetRequest(options, '/apiculture')).toBe(false);
            expect(ignoreGetRequest(options, '/exact')).toBe(true);
            expect(ignoreGetRequest(options, '/exactly')).toBe(false);
        });
    });

    it('the page carries a viewport meta unless the document declares one', async () => {
        const server = new PluridServer(configuration());
        const instance = await listen(server);
        try {
            const served = await get(instance, '/');
            expect(served.body).toContain('<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">');
        } finally {
            await close(instance);
        }
        const declared = new PluridServer(configuration({
            template: {
                minify: false,
                htmlLanguage: 'en',
                head: { title: 'static title', meta: [{ name: 'viewport', content: 'width=1024' }] },
                mainScriptSource: '/main.js',
                vendorScriptSource: '',
                errorHtml: '<html><body>custom failure page</body></html>',
            },
        }));
        const other = await listen(declared);
        try {
            const served = await get(other, '/');
            expect(served.body).toContain('content="width=1024"');
            expect(served.body).not.toContain('viewport-fit=cover');
        } finally {
            await close(other);
        }
    });
});
// #endregion module
