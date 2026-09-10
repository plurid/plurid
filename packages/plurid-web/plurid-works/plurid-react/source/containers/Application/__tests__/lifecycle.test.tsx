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

    describe('THE READINESS CONTRACT in the route-driven mode', () => {
        it('the router\'s onReady fires for the matched route\'s application and a synchronous command executes; a command published before or after is reported, once per topic', async () => {
            installPointerEvents();
            installMatchMedia();
            (Element.prototype as any).scrollIntoView = () => {};
            window.history.replaceState(null, '', '/');
            const warnings: string[] = [];
            const warn = jest.spyOn(console, 'warn').mockImplementation((message: string) => { warnings.push(String(message)); });
            const { default: PluridRouterBrowser } = await import('../../RouterBrowser');
            const { default: PluridPubSub } = await import('@plurid/plurid-pubsub');
            const bus = new PluridPubSub();
            // the contract's case: a command published BEFORE the engine mounted is dropped and reported once
            bus.publish({ topic: PLURID_PUBSUB_TOPIC.SPACE_ROTATE_X_TO, data: { value: 1 } } as any);
            bus.publish({ topic: PLURID_PUBSUB_TOPIC.SPACE_ROTATE_X_TO, data: { value: 2 } } as any);
            bus.publish({ topic: PLURID_PUBSUB_TOPIC.CHANGED, data: {} } as any);
            expect(warnings.filter((message) => message.includes('space.rotateXTo'))).toHaveLength(1);
            expect(warnings.filter((message) => message.includes('space.changed'))).toHaveLength(0);
            const container = document.createElement('div');
            document.body.appendChild(container);
            const root = createRoot(container);
            let ready: PluridApi | undefined;
            let seen = 0;
            await act(async () => {
                root.render(
                    <PluridRouterBrowser
                        routes={[{ value: '/', planes: [['/one', () => <p>one</p>]] as any, view: ['/one'] }] as any}
                        pubsub={bus}
                        onReady={(api) => {
                            ready = api;
                            rotateTo(api, 30);
                            seen = api.getSnapshot().space.rotationX;
                        }}
                    />,
                );
            });
            expect(ready).toBeTruthy();
            expect(seen).toBe(30);
            expect(ready!.pubsub).toBe(bus);
            await act(async () => { root.unmount(); });
            container.remove();
            // after the unmount the bus has no subscriber again: another command is reported, once
            bus.publish({ topic: PLURID_PUBSUB_TOPIC.FIT_TO_VIEW } as any);
            bus.publish({ topic: PLURID_PUBSUB_TOPIC.FIT_TO_VIEW } as any);
            expect(warnings.filter((message) => message.includes('space.fitToView'))).toHaveLength(1);
            warn.mockRestore();
        });
    });
});

