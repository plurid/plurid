// #region imports
    // #region libraries
    import fs from 'fs';
    import os from 'os';
    import path from 'path';

    import React from 'react';

    import PluridServer from '@plurid/plurid-react-server';
    // #endregion libraries


    // #region internal
    import {
        serverOnly,
    } from '../index';
    import {
        createPluridServer,
        startPluridServer,
    } from '../server';
    import {
        PRELOADED_REDUX_STATE_KEY,
        PRELOADED_PLURID_METASTATE_KEY,
    } from '../shared';
    // #endregion internal
// #endregion imports



// #region module
jest.mock('@plurid/plurid-react-server', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(function (this: any, configuration: any) {
        this.configuration = configuration;
        this.started = [];
        this.start = jest.fn((port?: number) => {
            this.started.push(port);
            return (this.constructor as any).startResult ?? Promise.resolve({ port });
        });
        // the real server runs `handlers` during its construction
        configuration.handlers?.(this);
    }),
}));


describe('createPluridServer()', () => {
    beforeEach(() => {
        (PluridServer as unknown as jest.Mock).mockClear();
    });

    it('projects the config onto the server: the document head, the document hook (server-only thunk), the render mode, no helmet / customPlane', async () => {
        const hook = jest.fn();
        const server: any = await createPluridServer({
            serverName: 'kit test',
            routes: [],
            head: { title: 'kit', description: 'a kit app', meta: [{ property: 'og:site_name', content: 'plurid' }] },
            favicon: { icon: '/favicon.ico', themeColor: '#123' },
            manifest: '/manifest.json',
            document: serverOnly(() => Promise.resolve({ default: hook })),
            render: 'suspense',
            services: [
                { name: 'B', Provider: () => null, order: 2 },
                { name: 'A', Provider: () => null, order: 1 },
            ],
        } as any);

        expect(PluridServer).toHaveBeenCalledTimes(1);
        const configuration = server.configuration;
        expect(configuration.template.head).toEqual({ title: 'kit', description: 'a kit app', meta: [{ property: 'og:site_name', content: 'plurid' }] });
        expect(configuration.template.favicon).toEqual({ icon: '/favicon.ico', themeColor: '#123' });
        expect(configuration.template.manifest).toBe('/manifest.json');
        expect(configuration.template.vendorScriptSource).toBe('');
        // the marked thunk ran at startup; what it produced is the hook
        await configuration.document({ request: {} });
        expect(hook).toHaveBeenCalledTimes(1);
        expect(configuration.render).toBe('suspense');
        expect('helmet' in configuration).toBe(false);
        expect('customPlane' in configuration).toBe(false);
        // services keep their order (lower = inner) for the client to mirror
        expect(configuration.services.map((service: any) => service.name)).toEqual(['A', 'B']);
        expect(configuration.options.serverName).toBe('kit test');
    });

    it('exposes the preload keys the server template and the client agree on', () => {
        expect(PRELOADED_REDUX_STATE_KEY).toBe('__PRELOADED_REDUX_STATE__');
        expect(PRELOADED_PLURID_METASTATE_KEY).toBe('__PRELOADED_PLURID_METASTATE__');
    });
});


describe('the configuration, checked (2026-09-29)', () => {
    it('refuses a config without routes, or with routes that are not an array, naming the shape expected', async () => {
        await expect(createPluridServer({ serverName: 'no routes', hostname: 'example.com' } as any))
            .rejects.toThrow(/`routes` must be an array of routes.*it is missing/s);
        await expect(createPluridServer({ serverName: 'object routes', hostname: 'example.com', routes: { '/': {} } } as any))
            .rejects.toThrow(/`routes` must be an array of routes.*it is an object/s);
        await expect(createPluridServer({ routes: [{ path: '/' }] } as any))
            .rejects.toThrow(/`routes\[0\]` must be a route with a path `value`/);
    });

    it('lists every problem at once', async () => {
        const failure = createPluridServer({
            routes: [],
            styles: '/global.css',
            services: [{ Provider: () => null }],
            notFound: 42,
            handlers: { get: '/status' },
        } as any);
        await expect(failure).rejects.toThrow(/`styles` must be an array of stylesheet hrefs/);
        await expect(failure).rejects.toThrow(/`services\[0\]` must be services \(\{ name, Provider \}\)/);
        await expect(failure).rejects.toThrow(/`notFound` must be a component or a path/);
        await expect(failure).rejects.toThrow(/`handlers` must be a function/);
    });

    it('checks what a thunk produced', async () => {
        await expect(createPluridServer({ routes: [], preserves: () => Promise.resolve({ default: { serve: '*' } }) } as any))
            .rejects.toThrow(/`preserves` must be an array of preserves; its thunk produced an object/);
    });
});


describe('the document hook and the handlers, without counting parameters (2026-09-29)', () => {
    it('a context-free document hook is the hook: never called at startup, called per request', async () => {
        const hook = jest.fn(() => ({ meta: [{ name: 'robots', content: 'noindex' }] }));
        const server: any = await createPluridServer({ routes: [], document: hook } as any);
        expect(hook).not.toHaveBeenCalled();
        expect(await server.configuration.document({ request: {} })).toEqual({ meta: [{ name: 'robots', content: 'noindex' }] });
        expect(hook).toHaveBeenCalledTimes(1);
    });

    it('an unmarked lazy document import still works: the hook it produced is used, and marking it is suggested once', async () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        try {
            const hook = jest.fn((context: any) => ({ title: 'from ' + context.request.url }));
            const server: any = await createPluridServer({ routes: [], document: () => Promise.resolve({ default: hook }) } as any);
            expect(await server.configuration.document({ request: { url: '/a' } })).toEqual({ title: 'from /a' });
            expect(await server.configuration.document({ request: { url: '/b' } })).toEqual({ title: 'from /b' });
            expect(warn.mock.calls.filter(([message]) => /mark a lazy import/.test(message))).toHaveLength(1);
        } finally {
            warn.mockRestore();
        }
    });

    it('handlers run during the construction (before the page\'s catch-all) with the server', async () => {
        const seen: unknown[] = [];
        const server: any = await createPluridServer({ routes: [], handlers: (host: unknown) => { seen.push(host); } } as any);
        expect(seen).toEqual([server]);
    });

    it('an unmarked lazy handlers import still runs, after the construction, with a note', async () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        try {
            const seen: unknown[] = [];
            const handlers = (host: unknown) => { seen.push(host); };
            const server: any = await createPluridServer({ routes: [], handlers: () => Promise.resolve({ default: handlers }) } as any);
            expect(seen).toEqual([server]);
            expect(warn.mock.calls.some(([message]) => /`handlers` returned a module/.test(message))).toBe(true);

            seen.length = 0;
            await createPluridServer({ routes: [], handlers: serverOnly(() => Promise.resolve({ default: handlers })) } as any);
            expect(seen).toHaveLength(1);
        } finally {
            warn.mockRestore();
        }
    });
});


describe('styles and the error pages (2026-09-29)', () => {
    it('stylesheet hrefs are links in the head; markup is written as it is', async () => {
        const server: any = await createPluridServer({
            routes: [],
            head: { title: 't', links: [{ rel: 'canonical', href: 'https://example.com/' }] },
            styles: ['/global.css', '<style>body { margin: 0 }</style>'],
        } as any);
        expect(server.configuration.template.head.links).toEqual([
            { rel: 'canonical', href: 'https://example.com/' },
            { rel: 'stylesheet', href: '/global.css' },
        ]);
        expect(server.configuration.styles).toEqual(['<style>body { margin: 0 }</style>']);
    });

    it('a notFound component is the not-found route; notFound / errorPage files are the pages', async () => {
        const NotFound = () => React.createElement('p', null, 'nothing here');
        const routed: any = await createPluridServer({ routes: [{ value: '/' }], notFound: NotFound } as any);
        expect(routed.configuration.routes).toEqual([{ value: '/' }, { value: '/not-found', exterior: NotFound }]);
        // a config that routes /not-found itself keeps its own
        const own: any = await createPluridServer({ routes: [{ value: '/not-found' }], notFound: NotFound } as any);
        expect(own.configuration.routes).toEqual([{ value: '/not-found' }]);

        const publicDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plurid-kit-public-'));
        try {
            fs.writeFileSync(path.join(publicDir, '404.html'), '<p>our 404</p>');
            fs.writeFileSync(path.join(publicDir, '500.html'), '<p>our 500</p>');
            const files: any = await createPluridServer({ routes: [], publicDir, notFound: '/404.html', errorPage: '/500.html' } as any);
            expect(files.configuration.template.notFoundHtml).toBe('<p>our 404</p>');
            expect(files.configuration.template.errorHtml).toBe('<p>our 500</p>');

            await expect(createPluridServer({ routes: [], publicDir, notFound: '/missing.html' } as any))
                .rejects.toThrow(/`notFound: '\/missing.html'` is not a readable file under the public directory/);
        } finally {
            fs.rmSync(publicDir, { recursive: true, force: true });
        }
    });

    it('an errorPage component is rendered once, to a static page', async () => {
        const ErrorPage = () => React.createElement('h1', null, 'we broke');
        const server: any = await createPluridServer({ routes: [], errorPage: ErrorPage } as any);
        expect(server.configuration.template.errorHtml).toMatch(/^<!DOCTYPE html><html lang="en">.*<body><h1>we broke<\/h1><\/body><\/html>$/);
    });
});


describe('startPluridServer()', () => {
    afterEach(() => {
        delete (PluridServer as any).startResult;
        delete process.env.PORT;
    });

    it('resolves once the server listens on $PORT, and rejects when it cannot', async () => {
        process.env.PORT = '4321';
        const server: any = await startPluridServer({ routes: [] } as any);
        expect(server.started).toEqual([4321]);

        const busy = Object.assign(new Error('listen EADDRINUSE: address already in use :::4321'), { code: 'EADDRINUSE' });
        (PluridServer as any).startResult = Promise.reject(busy);
        (PluridServer as any).startResult.catch(() => undefined);
        await expect(startPluridServer({ routes: [] } as any)).rejects.toThrow(/EADDRINUSE/);
    });
});
// #endregion module
