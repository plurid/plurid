/**
 * @jest-environment jsdom
 */
/**
 * THE PLANES AN APPLICATION KNOWS, AND THE IDS IT HANDS OUT (2026-09-29).
 *
 * The application's registrar only ever added: a plane dropped from `planes` (an admin plane after a
 * logout) stayed routable by link, view item or deep link. A relayout could hand two roots one id
 * (an add, a remove and an add of one route), and every action by id reached only the first. A
 * layout type the engine does not lay out, restored from a save, crashed the toolbar's Space drawer.
 */
import React, { act } from 'react';

import {
    renderPlurid,
} from '../../../testing';



const Page: React.FC = () => <div>page</div>;
const planeA = { route: '/a', component: Page };
const planeB = { route: '/b', component: Page };
const configuration = { space: { navigation: { motion: { duration: 0 } } } } as any;


describe('the registry', () => {
    it('a plane dropped from `planes` stops resolving', async () => {
        const rendered = await renderPlurid({
            planes: [planeA, planeB],
            view: ['/a'],
            configuration,
        } as any);
        await rendered.rerender({ planes: [planeA] } as any);
        const [parent] = rendered.api.getSnapshot().space.tree;
        expect(rendered.handle.tree.spawn('/b', parent.planeID)).toBeUndefined();
        expect(rendered.handle.tree.spawn('/a', parent.planeID)).toBeTruthy();
        await rendered.unmount();
    });

    it('no two roots share an id through an add, a remove and an add', async () => {
        const rendered = await renderPlurid({
            planes: [planeA, planeB],
            view: ['/a', '/b'],
            configuration,
        } as any);
        const setPlanes = async (view: string[]) => {
            await act(async () => {
                rendered.api.pubsub.publish({ topic: 'view.setPlanes', data: { view } } as any);
            });
        };
        const ids = () => rendered.api.getSnapshot().space.tree.map((root: any) => root.planeID);

        await setPlanes(['/a', '/b', '/a']);
        await setPlanes(['/a', '/a']);
        await setPlanes(['/a', '/a', '/a']);
        expect(ids()).toHaveLength(3);
        expect(new Set(ids()).size).toBe(3);
        const rendered_ids = Array.from(rendered.container.querySelectorAll('[data-plurid-plane]'))
            .map((element) => element.getAttribute('data-plurid-plane'));
        expect(new Set(rendered_ids).size).toBe(rendered_ids.length);
        await rendered.unmount();
    });

    it('the Space drawer names a restored META layout as the COLUMNS it is laid out as', async () => {
        const rendered = await renderPlurid({
            planes: [planeA],
            view: ['/a'],
            configuration: {
                ...configuration,
                elements: { toolbar: { toggledDrawers: ['SPACE'] } },
            },
        } as any);
        const toolbar = rendered.container.querySelector('[data-plurid-entity="PluridToolbar"]')!;
        await act(async () => {
            toolbar.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        });
        await act(async () => {
            (rendered.container.querySelector('[data-plurid-control="toolbar-more"]') as HTMLElement).click();
        });
        const saved = rendered.api.store.getState().configuration;
        await act(async () => {
            rendered.api.store.dispatch({
                type: 'SET_STATE',
                payload: { configuration: { ...saved, space: { ...saved.space, layout: { type: 'META' } } } },
            } as any);
        });
        expect(rendered.container.querySelector('[data-plurid-entity="PluridToolbar"]')).not.toBeNull();
        expect(rendered.container.textContent?.toLowerCase()).toContain('columns');
        await rendered.unmount();
    });
});
