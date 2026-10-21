/**
 * @jest-environment jsdom
 */
/**
 * THE BUS AND THE REGISTRAR FOLLOW THEIR PROPS (2026-10-20). Both were read once, at construction:
 * a host that handed the application another bus kept talking to the first one (the new bus dropped
 * every command), and a host's new registrar was never consulted.
 */
import React, { act } from 'react';

import PluridPubSub from '@plurid/plurid-pubsub';
import {
    PluridPlanesRegistrar,
} from '../../../services/engine';

import {
    renderPlurid,
} from '../../../testing';



const Page: React.FC = () => <div>page</div>;
const OtherPage: React.FC = () => <div>other page</div>;
const flush = () => act(async () => {});

describe('props read after the mount', () => {
    it('a new pubsub prop is the bus the application listens on, and the one the api hands out', async () => {
        const first = new PluridPubSub();
        const dropped: string[] = [];
        const second = new PluridPubSub({ onDrop: (topic: string) => { dropped.push(topic); } } as any);
        const rendered = await renderPlurid({
            planes: [{ route: '/a', component: Page }],
            view: ['/a'],
            pubsub: first,
        } as any);
        await rendered.rerender({ pubsub: second } as any);
        await flush();

        await act(async () => {
            second.publish({ topic: 'space.selectAll' } as any);
        });
        // (the application's own `space.changed` notices have no listener on this bus: those drop)
        expect(dropped).not.toContain('space.selectAll');
        expect(rendered.api.getSnapshot().space.selectedPlaneIDs.length).toBeGreaterThan(0);
        expect(rendered.handle.pubsub).toBe(second);
        await rendered.unmount();
    });

    it('a new planesRegistrar prop is the one the application resolves its planes from', async () => {
        const firstRegistrar = new PluridPlanesRegistrar([{ route: '/a', component: Page }] as any);
        const secondRegistrar = new PluridPlanesRegistrar([{ route: '/a', component: OtherPage }] as any);
        const rendered = await renderPlurid({
            view: ['/a'],
            planesRegistrar: firstRegistrar,
        } as any);
        await flush();
        expect(rendered.container.textContent).toContain('page');
        expect(rendered.container.textContent).not.toContain('other page');

        await rendered.rerender({ planesRegistrar: secondRegistrar } as any);
        await flush();
        expect(rendered.container.textContent).toContain('other page');
        await rendered.unmount();
    });
});


/**
 * A REBUILT PROP IS NOT A CHANGE (2026-10-21). A new `configuration` object laid the whole prop over
 * the live configuration, and every recompute put the prop's `view` back: a host that rebuilt its
 * configuration on a resize lost the planes the reader added and the layout set at runtime.
 */
describe('a configuration or view prop rebuilt with the same content', () => {
    const planes = [{ route: '/a', component: Page }, { route: '/b', component: Page }];
    const settings = (width: number) => ({
        space: { layout: { type: 'COLUMNS', columns: 2 }, navigation: { motion: { duration: 0 } } },
        elements: { plane: { width } },
    });
    const roots = (api: any) => api.getSnapshot().space.tree
        .map((node: any) => node.route.replace(/^[a-z]+:\/\/[^/]*/, ''));

    it('keeps an added plane and a layout set at runtime when only the plane width changes', async () => {
        const rendered = await renderPlurid({ planes, view: ['/a'], configuration: settings(800) as any });
        await flush();
        const { api } = rendered;
        await act(async () => {
            api.pubsub.publish({ topic: 'view.addPlane', data: { planeID: '/b' } } as any);
        });
        await act(async () => {
            api.pubsub.publish({
                topic: 'configuration',
                data: { space: { layout: { type: 'COLUMNS', columns: 3 } } },
            } as any);
        });
        await flush();
        expect(roots(api)).toEqual(['/a', '/b']);

        await rendered.rerender({ view: ['/a'], configuration: settings(900) as any });
        await flush();
        expect(roots(api)).toEqual(['/a', '/b']);
        expect(api.getSnapshot().configuration.space.layout).toMatchObject({ columns: 3 });
        expect(api.getSnapshot().configuration.elements.plane.width).toBe(900);
        await rendered.unmount();
    });

    it('takes a rebuilt callback into the store', async () => {
        const first = jest.fn();
        const second = jest.fn();
        const rendered = await renderPlurid({
            planes,
            view: ['/a'],
            configuration: { space: { shortcuts: { onUnhandledKey: first } } } as any,
        });
        await rendered.rerender({ configuration: { space: { shortcuts: { onUnhandledKey: second } } } as any });
        await flush();
        expect(rendered.api.getSnapshot().configuration.space.shortcuts?.onUnhandledKey).toBe(second);
        await rendered.unmount();
    });

    it('reads an edit made in place under a new object as a change (2026-10-22)', async () => {
        // The diff compared with the host's own object, whose nested parts the new one shared: an edit
        // made in place, then passed as `{ ...configuration }`, read as no change. (A view the store
        // holds is frozen: it cannot be edited in place.)
        const configuration: any = settings(800);
        const rendered = await renderPlurid({ planes, view: ['/a'], configuration });
        await flush();
        configuration.elements.plane.width = 900;
        await rendered.rerender({ configuration: { ...configuration } });
        await flush();
        expect(rendered.api.getSnapshot().configuration.elements.plane.width).toBe(900);
        await rendered.unmount();
    });

    it('still replaces the view with a view prop whose content changed', async () => {
        const rendered = await renderPlurid({ planes, view: ['/a'], configuration: settings(800) as any });
        await flush();
        const { api } = rendered;
        await act(async () => {
            api.pubsub.publish({ topic: 'view.addPlane', data: { planeID: '/b' } } as any);
        });
        await flush();
        await rendered.rerender({ view: ['/b'] });
        await flush();
        expect(roots(api)).toEqual(['/b']);
        await rendered.unmount();
    });
});
