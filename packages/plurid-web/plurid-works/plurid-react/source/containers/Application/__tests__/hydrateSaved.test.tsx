/**
 * @jest-environment jsdom
 */
/**
 * THE SAVED STATE WAITS FOR THE HYDRATION (2026-09-29). With `useLocalStorage`, the constructor read
 * the saved arrangement during the hydrating render: a different tree and camera from the server's
 * HTML (the server has no localStorage), so React kept mismatched attributes or threw the server HTML
 * away. Under a server render the first client render is the server's, and the saved state lands
 * after mount.
 */
import React, { act } from 'react';
import { hydrateRoot, Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import PluridPubSub from '@plurid/plurid-pubsub';
import { PLURID_PUBSUB_TOPIC } from '@plurid/plurid-data';

import PluridApplication from '../index';
import PluridProvider from '../../Provider';

import {
    renderPlurid,
    installPointerEvents,
    installMatchMedia,
} from '../../../testing';



(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const Page: React.FC = () => <div>page</div>;
const planes = [{ route: '/a', component: Page }, { route: '/b', component: Page }];
const view = ['/a', '/b'];
const configuration = { space: { navigation: { motion: { duration: 0 } } } } as any;


describe('a server-rendered application with a saved state', () => {
    it('hydrates the server\'s markup, then applies the saved state', async () => {
        installPointerEvents();
        installMatchMedia();
        window.localStorage.clear();

        // a reader's earlier visit: plane b isolated, saved under the application's id
        const bus = new PluridPubSub({ onDrop: null });
        const visit = await renderPlurid({ id: 'hydrate', planes, view, configuration, pubsub: bus, useLocalStorage: true } as any);
        const isolated = visit.api.getSnapshot().space.tree[1].planeID;
        await act(async () => {
            bus.publish({ topic: PLURID_PUBSUB_TOPIC.ISOLATE_PLANE, data: { planeID: isolated } } as any);
        });
        await visit.unmount();
        const saved = Object.entries(window.localStorage).filter(([key]) => key.endsWith('hydrate'));
        expect(saved).toHaveLength(1);

        // the server has no localStorage: its HTML is the unsaved arrangement
        window.localStorage.clear();
        const html = renderToString(
            <PluridProvider metastate={{ states: {} } as any}>
                <PluridApplication id="hydrate" planes={planes as any} view={view} configuration={configuration} useLocalStorage />
            </PluridProvider>,
        );
        for (const [key, value] of saved) {
            window.localStorage.setItem(key, value);
        }

        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);
        const recoverable: unknown[] = [];
        let api: any;
        let root: Root | undefined;
        await act(async () => {
            root = hydrateRoot(
                container,
                <PluridProvider metastate={{ states: {} } as any}>
                    <PluridApplication
                        id="hydrate"
                        planes={planes as any}
                        view={view}
                        configuration={configuration}
                        useLocalStorage
                        onReady={(ready) => { api = ready; }}
                    />
                </PluridProvider>,
                { onRecoverableError: (error) => recoverable.push(error) },
            );
        });
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(recoverable).toEqual([]);
        // and the saved arrangement is the one on screen now
        expect(api.getSnapshot().space.isolatePlane).toBe(isolated);

        await act(async () => {
            root?.unmount();
        });
        container.remove();
    });
});
