/**
 * THE SERVICE STORE IS EACH REQUEST'S, THROUGH THE REAL SERVER (2026-10-21). The kit built one
 * `store(undefined)` at startup, which every request rendered into; the server now calls the factory
 * per request and writes the state into the page. The other server tests replace the server with a
 * stub: this one runs `@plurid/plurid-react-server` itself, BUILT.
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


    // #region internal
    import {
        createPluridServer,
    } from '../server';
    // #endregion internal
// #endregion imports



// #region module
const Page = () => (<div>page</div>);
const Shell = () => (<div>shell</div>);

/** Writes into its store during the render, as a component loading its data does. */
const Provider = ({
    store,
    children,
}: {
    store: { state: Record<string, unknown> };
    children?: React.ReactNode;
}) => {
    store.state = { ...store.state, rendered: true };
    return <>{children}</>;
};

let made = 0;
const store = (preloaded: unknown) => {
    const created = {
        state: { made: ++made, preloaded: preloaded ?? null } as Record<string, unknown>,
        getState: () => created.state,
    };
    return created;
};

const page = (
    instance: http.Server,
    path: string,
) => new Promise<string>((resolve, reject) => {
    const { port, family } = instance.address() as AddressInfo;
    const host = family === 'IPv6' ? '::1' : '127.0.0.1';
    const outgoing = http.request({ host, port, path }, (response) => {
        let body = '';
        response.on('data', (chunk) => { body += chunk; });
        response.on('end', () => resolve(body));
    });
    outgoing.on('error', reject);
    outgoing.end();
});

const preloaded = (body: string) => {
    const inline = body.match(/<script>([\s\S]*?)<\/script>/);
    const window: Record<string, any> = {};
    vm.runInNewContext(inline![1], { window });
    return window.__PRELOADED_REDUX_STATE__;
};


describe('a kit service store on the real server', () => {
    it('each request renders into a store the factory made for it, and the page carries its state', async () => {
        const server: any = await createPluridServer({
            serverName: 'kit stores',
            routes: [{ value: '/', exterior: Shell, planes: [['/p', Page]], view: ['/p'] }],
            services: [{ name: 'redux', Provider, store }],
            options: {
                quiet: true,
                debug: 'none',
                attachSignalHandlers: false,
                compression: false,
                hostname: 'localhost',
            },
        } as any);
        const instance = await new Promise<http.Server>((resolve) => {
            const listening = server.instance().listen(0, () => resolve(listening));
        });
        try {
            const first = preloaded(await page(instance, '/'));
            const second = preloaded(await page(instance, '/'));
            expect(first).toMatchObject({ rendered: true, preloaded: null });
            expect(second.rendered).toBe(true);
            expect(first.made).not.toBe(second.made);
        } finally {
            await new Promise<void>((resolve) => { instance.close(() => resolve()); });
        }
    });
});
// #endregion module
