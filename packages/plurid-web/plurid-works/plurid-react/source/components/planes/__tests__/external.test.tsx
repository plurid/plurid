/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React, {
        act,
    } from 'react';
    // #endregion libraries

    // #region external
    import {
        renderPlurid,
    } from '../../../testing';

    import IframePlane from '../IframePlane';
    import ExternalPlane, {
        getPttpUrl,
    } from '../ExternalPlane';
    // #endregion external
// #endregion imports



// #region module
/**
 * REGISTERED AS PLANES (2026-10-20), as the fixtures and the docs register them, the two components
 * receive the plane's `plurid` property, `{ plane, route, pubSub }`: they read `plurid.value`, the
 * route exterior's shape, so the iframe had no `src` and the external plane never asked for its element.
 */
describe('the iframe and external planes', () => {
    it('an iframe plane shows the route it is registered at', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: 'https://example.com/page', component: IframePlane }],
            view: ['https://example.com/page'],
        });

        const iframe = rendered.container.querySelector('iframe');
        expect(iframe?.getAttribute('src')).toBe('https://example.com/page');
        await rendered.unmount();
    });

    it('an external plane asks its host for the element at its path', async () => {
        const fetched = jest.fn(async () => ({ json: async () => ({}) }));
        const original = global.fetch;
        global.fetch = fetched as any;
        try {
            const rendered = await renderPlurid({
                planes: [{ route: 'pttp://elements.example.com:8080/incepts', component: ExternalPlane }],
                view: ['pttp://elements.example.com:8080/incepts'],
            });
            await act(async () => {});

            expect(fetched).toHaveBeenCalledTimes(1);
            const [url, request] = fetched.mock.calls[0] as unknown as [string, RequestInit];
            expect(url).toBe('http://elements.example.com:8080/pttp');
            expect(JSON.parse(request.body as string)).toEqual({ path: '/incepts' });
            await rendered.unmount();
        } finally {
            global.fetch = original;
        }
    });

    it('asks over the page\'s transport, and over http on this machine', () => {
        expect(getPttpUrl('pttp://plurid.com/incepts', 'https:')).toEqual({
            domain: 'plurid.com',
            url: 'https://plurid.com/pttp',
        });
        expect(getPttpUrl('pttp://plurid.com/incepts', 'http:').url).toBe('http://plurid.com/pttp');
        expect(getPttpUrl('pttp://localhost:63000/elementql-plane', 'https:').url).toBe('http://localhost:63000/pttp');
        expect(getPttpUrl('pttp://127.0.0.1:63000/plane', 'https:').url).toBe('http://127.0.0.1:63000/pttp');
        expect(getPttpUrl('pttp://a.b.example.co.uk/x', 'https:').domain).toBe('a.b.example.co.uk');
        expect(getPttpUrl('https://example.com/x', 'https:')).toEqual({ domain: '', url: '' });
    });
});
// #endregion module
