/**
 * @jest-environment jsdom
 */
/**
 * The application's lifecycle contracts (the 2026-09-06 critique, C01 / C02 / C04): a command published
 * synchronously from `onReady` executes; StrictMode's mount replay keeps persistence and the viewpoint
 * callback alive; two applications with the same route keep their own components.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

import {
    PLURID_PUBSUB_TOPIC,
    PluridApi,
    PluridStorageAdapter,
} from '@plurid/plurid-data';

import PluridApplication from '../index';
import {
    renderPlurid,
    RenderPluridProperties,
    installPointerEvents,
    installMatchMedia,
} from '../../../testing';



const scene: RenderPluridProperties = {
    planes: [{ route: '/one', component: () => <p>one</p> }],
    view: ['/one'],
};

const rotateTo = (api: PluridApi, value: number) => api.pubsub.publish({
    topic: PLURID_PUBSUB_TOPIC.SPACE_ROTATE_X_TO,
    data: { value },
} as any);

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));


describe('readiness', () => {
    it('a command published synchronously from onReady executes (the bridge exists before onReady)', async () => {
        let immediate: number | undefined;
        const { api, unmount } = await renderPlurid({
            ...scene,
            onReady: (ready) => {
                rotateTo(ready, 30);
                immediate = ready.getSnapshot().space.rotationX;
            },
        });
        expect(immediate).toBe(30);
        expect(api.getSnapshot().space.rotationX).toBe(30);
        await unmount();
    });
});


describe('StrictMode', () => {
    it('persistence and the viewpoint callback survive the mount replay', async () => {
        (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
        installPointerEvents();
        installMatchMedia();

        const writes: string[] = [];
        const adapter: PluridStorageAdapter = {
            getItem: () => null,
            setItem: (key) => { writes.push(key); },
            removeItem: () => {},
        };
        const viewpoints: string[] = [];
        let api: PluridApi | undefined;
        let ready = 0;

        const container = document.createElement('div');
        document.body.appendChild(container);
        let root: Root | undefined;
        await act(async () => {
            root = createRoot(container);
            root.render(
                <React.StrictMode>
                    <PluridApplication
                        id="strict"
                        planes={scene.planes as any}
                        view={scene.view as any}
                        useLocalStorage={true}
                        storageAdapter={adapter}
                        onViewpointChange={(viewpoint) => { viewpoints.push(viewpoint); }}
                        configuration={{ space: { timings: { persistDebounce: 0, viewpointChangeDebounce: 0 } } } as any}
                        onReady={(instance) => { api = instance; ready += 1; }}
                    />
                </React.StrictMode>,
            );
        });
        expect(ready).toBe(1);
        expect(api).toBeDefined();

        writes.length = 0;
        viewpoints.length = 0;
        await act(async () => {
            rotateTo(api!, 15);
            await wait(30);
        });
        expect(api!.getSnapshot().space.rotationX).toBe(15);
        expect(writes.length).toBeGreaterThanOrEqual(1);
        expect(viewpoints.length).toBeGreaterThanOrEqual(1);

        await act(async () => { root!.unmount(); });
        container.remove();
    });
});


describe('registrars', () => {
    it('two applications registering the same route keep their own components', async () => {
        const alpha = await renderPlurid({
            planes: [{ route: '/same', component: () => <p data-who="alpha">alpha</p> }],
            view: ['/same'],
        });
        const beta = await renderPlurid({
            planes: [{ route: '/same', component: () => <p data-who="beta">beta</p> }],
            view: ['/same'],
        });
        expect(alpha.container.querySelector('[data-who]')?.getAttribute('data-who')).toBe('alpha');
        expect(beta.container.querySelector('[data-who]')?.getAttribute('data-who')).toBe('beta');
        // and the window-global registry was never created by an application
        expect((window as any).__pluridPlanesRegistrar__).toBeUndefined();
        await beta.unmount();
        expect(alpha.container.querySelector('[data-who]')?.getAttribute('data-who')).toBe('alpha');
        await alpha.unmount();
    });
});
