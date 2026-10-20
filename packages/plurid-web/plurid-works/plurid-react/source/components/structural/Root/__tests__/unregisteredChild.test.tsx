/**
 * @jest-environment jsdom
 */
/**
 * A CHILD THAT DOES NOT RENDER TAKES ITS SUBTREE WITH IT (2026-10-20). A child whose plane is not
 * registered rendered nothing, and its own children rendered all the same, hanging from a plane that
 * was not there.
 */
import React, { act } from 'react';

import {
    renderPlurid,
} from '../../../../testing';



const Page: React.FC = () => <div>page</div>;

describe('an unregistered child', () => {
    it('renders none of its children', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/a', component: Page }, { route: '/b', component: Page }, { route: '/c', component: Page }],
            view: ['/a'],
            configuration: { space: { navigation: { motion: { duration: 0 } } } },
        } as any);
        const [root] = rendered.api.getSnapshot().space.tree;
        let child: string | undefined;
        await act(async () => {
            child = rendered.handle.tree.spawn('/b', root.planeID);
        });
        let grandchild: string | undefined;
        await act(async () => {
            grandchild = rendered.handle.tree.spawn('/c', child!);
        });
        expect(rendered.container.querySelector(`[data-plurid-plane="${grandchild}"]`)).not.toBeNull();

        // the child's plane goes from the registry's view of it: its source is a route nobody registered
        const tree = rendered.api.getSnapshot().space.tree;
        const unregistered = [{
            ...tree[0],
            children: tree[0].children!.map((node: any) => (node.planeID === child ? { ...node, sourceID: '/nowhere' } : node)),
        }];
        await act(async () => {
            rendered.handle.tree.set(unregistered as any);
        });
        expect(rendered.container.querySelector(`[data-plurid-plane="${child}"]`)).toBeNull();
        expect(rendered.container.querySelector(`[data-plurid-plane="${grandchild}"]`)).toBeNull();
        await rendered.unmount();
    });
});
