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
