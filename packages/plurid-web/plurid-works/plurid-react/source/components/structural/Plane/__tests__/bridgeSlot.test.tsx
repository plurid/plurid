/**
 * @jest-environment jsdom
 */
/**
 * A HOST'S BRIDGE IS DRAWN WHERE THE ENGINE'S STRIP WOULD BE (2026-10-20). The `renderPlaneBridge`
 * slot was called for every child, a moved one and a fan's later sibling too, whose link the engine
 * draws as a leash: the host's bridge was drawn over the leash.
 */
import React, { act } from 'react';

import {
    renderPlurid,
} from '../../../../testing';



const Page: React.FC = () => <div>page</div>;

describe('the renderPlaneBridge slot', () => {
    it('is not called for a child the engine leashes', async () => {
        const slot = jest.fn(() => <div data-host-bridge />);
        const rendered = await renderPlurid({
            planes: [{ route: '/a', component: Page }, { route: '/b', component: Page }, { route: '/c', component: Page }],
            view: ['/a'],
            renderPlaneBridge: slot,
            configuration: { space: { navigation: { motion: { duration: 0 } } } },
        } as any);
        const [root] = rendered.api.getSnapshot().space.tree;
        await act(async () => {
            rendered.handle.tree.spawn('/b', root.planeID);
        });
        await act(async () => {
            rendered.handle.tree.spawn('/c', root.planeID);
        });
        const children = rendered.api.getSnapshot().space.tree[0].children ?? [];
        expect(children.map((child: any) => child.bridgeKind)).toEqual(['strip', 'leash']);
        expect(rendered.container.querySelectorAll('[data-host-bridge]')).toHaveLength(1);
        await rendered.unmount();
    });
});
