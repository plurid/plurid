/**
 * @jest-environment jsdom
 */
/**
 * EVERY ROUTE ITS OWN APPLICATION (2026-09-29). A route-driven application had no id, so every one
 * was `default`: with `useLocalStorage` each route saved over the others and booted with their
 * state — an isolated plane in `/a` left `/b`'s only plane transparent and inert — and every space
 * of a multispace route shared one key and one look scope.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

import PluridPubSub from '@plurid/plurid-pubsub';
import { pluridRouterNavigate } from '@plurid/plurid-engine';
import { PLURID_PUBSUB_TOPIC } from '@plurid/plurid-data';

import PluridRouterBrowser from '../../RouterBrowser';
import { PluridApplicationProvider } from '../provider';
import { routeApplicationID } from '~services/logic/router';

import {
    installPointerEvents,
    installMatchMedia,
} from '../../../testing';



(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const Page: React.FC = () => <div data-page>page</div>;

const routes = [
    { value: '/a', planes: [['/pa', Page]] as any, view: ['/pa'] },
    { value: '/b', planes: [['/pb', Page]] as any, view: ['/pb'] },
    { value: '/c', id: 'the-c-space', planes: [['/pc', Page]] as any, view: ['/pc'] },
];


describe('a route\'s application id', () => {
    let root: Root;
    let container: HTMLElement;

    beforeEach(() => {
        installPointerEvents();
        installMatchMedia();
        (Element.prototype as any).scrollIntoView = () => {};
        window.localStorage.clear();
        window.history.replaceState(null, '', '/a');
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(async () => {
        await act(async () => { root.unmount(); });
        container.remove();
    });

    it('is the route\'s own id, else route:<value>', () => {
        expect(routeApplicationID({ value: '/a' })).toBe('route:/a');
        expect(routeApplicationID({ value: '/c', id: 'the-c-space' })).toBe('the-c-space');
    });

    it('keeps each route\'s saved state its own', async () => {
        const bus = new PluridPubSub({ onDrop: null });
        let api: any;
        await act(async () => {
            root.render(
                <PluridApplicationProvider useLocalStorage onReady={(ready) => { api = ready; }}>
                    <PluridRouterBrowser routes={routes as any} pubsub={bus} />
                </PluridApplicationProvider>,
            );
        });
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });
        expect(container.querySelector('[data-plurid-application="route:/a"]')).not.toBeNull();

        // /a isolates its plane, then the reader goes to /b
        const planeA = api.getSnapshot().space.tree[0].planeID;
        await act(async () => {
            bus.publish({ topic: PLURID_PUBSUB_TOPIC.ISOLATE_PLANE, data: { planeID: planeA } } as any);
        });
        expect(api.getSnapshot().space.isolatePlane).toBe(planeA);

        await act(async () => {
            pluridRouterNavigate('/b');
        });
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });
        expect(container.querySelector('[data-plurid-application="route:/b"]')).not.toBeNull();
        // /b booted with its own state: nothing isolated, its plane reachable
        expect(api.getSnapshot().space.isolatePlane).toBe('');
        const plane = container.querySelector('[data-plurid-plane]') as HTMLElement;
        expect(plane.hasAttribute('inert')).toBe(false);

        // two keys, one per route; none is `default`
        const keys = Object.keys(window.localStorage);
        expect(keys.some((key) => key.endsWith('route:/a'))).toBe(true);
        expect(keys.some((key) => key.endsWith('default'))).toBe(false);
    });
});
