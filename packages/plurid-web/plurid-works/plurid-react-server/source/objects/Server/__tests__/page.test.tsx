/**
 * The page presentation on the server: a route whose default configuration presents as a page
 * renders its view DOCKED on the first page in the HTML itself — the attribute the chrome hides
 * under, the page marked docked — before any script runs, so a site never paints its chrome.
 * Needs `@plurid/plurid-react` BUILT (`pnpm verify` builds first).
 */

// #region imports
    // #region libraries
    import React from 'react';
    import http from 'http';
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

const configuration = (): PluridServerConfiguration => ({
    routes: [
        {
            value: '/site',
            exterior: Shell,
            planes: [['/p', Page]],
            view: ['/p'],
            defaultConfiguration: { space: { presentation: 'page' } },
        },
        {
            value: '/space',
            exterior: Shell,
            planes: [['/q', Page]],
            view: ['/q'],
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
        head: { title: 'a site' },
        favicon: '/favicon.ico',
        mainScriptSource: '/main.js',
        vendorScriptSource: '',
    },
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

const close = (instance: http.Server) => new Promise<void>((resolve) => { instance.close(() => resolve()); });


describe('the page presentation on the server', () => {
    it('renders the view docked on the page, with the chrome hidden by the stylesheet it ships', async () => {
        const server = new PluridServer(configuration());
        const instance = await listen(server);
        try {
            const { status, body } = await get(instance, '/site');
            expect(status).toBe(200);
            expect(body).toContain('page content');
            expect(body).toMatch(/data-plurid-entity="PluridView"/);
            expect(body).toMatch(/data-plurid-docked="[^"]+"/);
            expect(body).toContain('data-plurid-page="docked"');
            // the look ships with the page: its tokens, scoped to the application
            expect(body).toContain('data-plurid-look="graphite"');
            expect(body).toContain('--plurid-space:');
            // the chrome's docked rule ships in the collected styles: hidden before any script runs
            expect(body).toMatch(/\[data-plurid-docked\][^{]*\{[^}]*visibility:\s*hidden/);
            // the space presentation: no such attribute
            const space = await get(instance, '/space');
            expect(space.status).toBe(200);
            expect(space.body).not.toMatch(/data-plurid-docked=/);
        } finally {
            await close(instance);
        }
    });
});
// #endregion module
