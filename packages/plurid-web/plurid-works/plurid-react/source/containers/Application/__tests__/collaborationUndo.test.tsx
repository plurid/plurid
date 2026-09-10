/**
 * @jest-environment jsdom
 */
/**
 * REBASED UNDO through the real application: a peer's arrangement applied over the seam
 * (`space.applyRemoteMutation`) keeps the local history alive — undo reverts the local change on
 * its plane and keeps the peer's work.
 */
import React, { act } from 'react';

import {
    renderPlurid,
} from '../../../testing';



const Page: React.FC = () => <div>page</div>;
/** The effects and the bus settle inside one act: no clock is involved. */
const flush = () => act(async () => {});

describe('rebased undo over the collaboration seam', () => {
    it('undo after a peer\'s change restores the local change and keeps the peer\'s', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/a', component: Page }, { route: '/b', component: Page }, { route: '/c', component: Page }],
            view: ['/a', '/b', '/c'],
            configuration: { space: { collaboration: true, navigation: { motion: { duration: 0 } } } } as any,
        });
        await flush();
        const { api, handle } = rendered;
        const [a, b, c] = api.getSnapshot().space.tree;
        // local: close b (one history entry)
        await act(async () => {
            api.pubsub.publish({ topic: 'space.closePlane', data: { planeID: b.planeID, navigate: 'stay' } } as any);
        });
        await flush();
        expect(api.getSnapshot().space.tree.find((node) => node.planeID === b.planeID)!.show).toBe(false);
        expect(handle.history.get().canUndo).toBe(true);
        // the peer (who saw b closed) pins c elsewhere
        const peer = api.getSnapshot().space.tree.map((node) => (node.planeID === c.planeID
            ? { ...node, manuallyPositioned: true, location: { ...node.location, translateX: 4321 } }
            : node));
        await act(async () => {
            api.pubsub.publish({ topic: 'space.applyRemoteMutation', data: { tree: peer, links: [] } } as any);
        });
        await flush();
        expect(api.getSnapshot().space.tree.find((node) => node.planeID === c.planeID)!.location.translateX).toBe(4321);
        // the history survived the peer's change, rebased
        expect(handle.history.get().canUndo).toBe(true);
        await act(async () => {
            handle.history.undo();
        });
        await flush();
        const after = api.getSnapshot().space.tree;
        expect(after.find((node) => node.planeID === b.planeID)!.show).toBe(true);
        expect(after.find((node) => node.planeID === c.planeID)!.location.translateX).toBe(4321);
        expect(after.find((node) => node.planeID === a.planeID)).toBeTruthy();
        rendered.unmount();
    });
});
