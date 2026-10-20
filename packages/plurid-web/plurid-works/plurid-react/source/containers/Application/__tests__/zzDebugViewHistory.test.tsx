/**
 * @jest-environment jsdom
 */
/**
 * AN UNDO TAKES THE VIEW WITH IT (2026-10-20). History restored the tree and the links only, while
 * `view.addPlane` and `view.removePlane` write the view, and every relayout rebuilds the roots from
 * the view: an undone `view.addPlane` came back at the next resize or configuration change.
 */
import React, { act } from 'react';

import {
    renderPlurid,
} from '../../../testing';



const Page: React.FC = () => <div>page</div>;
const flush = () => act(async () => {});
const configuration = (columns: number) => ({
    space: { layout: { type: 'COLUMNS', columns }, navigation: { motion: { duration: 0 } } },
});
/** A relayout from the bus (a configuration PROP re-applies the host's own `view` prop). */
const relayout = (api: any, columns: number) => act(async () => {
    api.pubsub.publish({ topic: 'configuration', data: { space: { layout: { type: 'COLUMNS', columns } } } } as any);
});

describe('undo and the view', () => {
    it('undoing view.addPlane or view.removePlane restores the view, so a relayout keeps the restored roots', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/a', component: Page }, { route: '/b', component: Page }],
            view: ['/a'],
            configuration: configuration(2) as any,
        });
        await flush();
        const { api, handle } = rendered;
        const roots = () => api.getSnapshot().space.tree.map((node) => node.route.replace(/^[a-z]+:\/\/[^/]*/, ''));

        await act(async () => {
            api.pubsub.publish({ topic: 'view.addPlane', data: { planeID: '/b' } } as any);
        });
        await flush();
        expect(roots()).toEqual(['/a', '/b']);

        await act(async () => {
            handle.history.undo();
        });
        await flush();
        expect(roots()).toEqual(['/a']);
        await relayout(api, 3);
        await flush();
        expect(roots()).toEqual(['/a']);

        await act(async () => {
            handle.history.redo();
        });
        await flush();
        expect(roots()).toEqual(['/a', '/b']);
        await relayout(api, 2);
        await flush();
        expect(roots()).toEqual(['/a', '/b']);

        const b = api.getSnapshot().space.tree[1];
        // by the root's runtime id (`plurid://localhost/b@1`): the root left the tree and stayed in
        // the view, so the next relayout brought it back (2026-10-20)
        await act(async () => {
            api.pubsub.publish({ topic: 'view.removePlane', data: { planeID: b.planeID } } as any);
        });
        await flush();
        expect(roots()).toEqual(['/a']);
        await relayout(api, 2);
        await flush();
        expect(roots()).toEqual(['/a']);
        await act(async () => {
            handle.history.undo();
        });
        await flush();
        expect(roots()).toEqual(['/a', '/b']);
        await relayout(api, 3);
        await flush();
        expect(roots()).toEqual(['/a', '/b']);
        await rendered.unmount();
    });
});
