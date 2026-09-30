/**
 * The kit's server over HTTP, with the REAL `PluridServer` (`@plurid/plurid-react-server` BUILT —
 * `pnpm verify` builds first): what a config's `handlers`, `notFound` and `errorPage` answer.
 */

// #region imports
    // #region libraries
    import http from 'http';
    import type {
        AddressInfo,
    } from 'net';

    import React from 'react';
    // #endregion libraries


    // #region internal
    import {
        createPluridServer,
    } from '../server';
    // #endregion internal
// #endregion imports



// #region module
const get = (
    port: number,
    path: string,
) => new Promise<{ status: number; body: string }>((resolve, reject) => {
    http.get({ host: '127.0.0.1', port, path }, (response) => {
        let body = '';
        response.on('data', (chunk) => { body += chunk; });
        response.on('end', () => resolve({ status: response.statusCode || 0, body }));
    }).on('error', reject);
});

const Page = () => React.createElement('p', null, 'the page');
const Boom = () => {
    throw new Error('plane exploded');
};
const NotFound = () => React.createElement('p', null, 'nothing lives here');
const ErrorPage = () => React.createElement('h1', null, 'we broke it');


describe('a kit server (2026-09-29)', () => {
    it('answers a GET route added by `handlers` through `instance()`, the not-found component with 404, and the error page', async () => {
        const server = await createPluridServer({
            serverName: 'kit serve test',
            hostname: 'localhost',
            routes: [
                { value: '/', planes: [['/page', Page]], view: ['/page'] },
                { value: '/boom', planes: [['/b', Boom]], view: ['/b'] },
            ],
            notFound: NotFound,
            errorPage: ErrorPage,
            usePTTP: false,
            options: {
                quiet: true,
                debug: 'none',
                attachSignalHandlers: false,
                compression: false,
            },
            template: {
                minify: false,
            },
            handlers: (host) => {
                host.instance().get('/status', (_request, response) => {
                    response.send('ok');
                });
            },
        });
        const listening = await server.start(0);
        const port = (listening.address() as AddressInfo).port;
        try {
            expect(await get(port, '/status')).toEqual({ status: 200, body: 'ok' });

            const page = await get(port, '/');
            expect(page.status).toBe(200);
            expect(page.body).toContain('the page');

            const missing = await get(port, '/nope');
            expect(missing.status).toBe(404);
            expect(missing.body).toContain('nothing lives here');

            const failed = await get(port, '/boom');
            expect(failed.status).toBe(500);
            expect(failed.body).toContain('<h1>we broke it</h1>');
        } finally {
            await server.stop();
        }
    });
});
// #endregion module
