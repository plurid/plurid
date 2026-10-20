/**
 * @jest-environment jsdom
 */
/**
 * A RESIZE THAT ENDS BY UNMOUNT CLOSES ITS UNDO STEP (2026-10-20). The handles opened a history
 * transaction on pointerdown and closed it on pointerup or cancel only: a resize whose handles went
 * (the plane deselected mid-drag) left it open, and the history recorded nothing after it.
 */
import React, { act } from 'react';

import {
    renderPlurid,
} from '../../../../testing';



const Page: React.FC = () => <div>page</div>;

describe('a resize the handles do not see end', () => {
    it('leaves the history recording', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/a', component: Page }, { route: '/b', component: Page }],
            view: ['/a', '/b'],
            configuration: { elements: { plane: { resizable: true } }, space: { navigation: { motion: { duration: 0 } } } },
        } as any);
        const [a, b] = rendered.api.getSnapshot().space.tree;
        await act(async () => {
            rendered.handle.selection.set([a.planeID]);
        });
        const handle = rendered.container.querySelector('[data-plurid-control="plane-resize-right"]') as HTMLElement;
        expect(handle).not.toBeNull();
        await act(async () => {
            handle.dispatchEvent(new (window as any).PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0, pointerId: 7, clientX: 10, clientY: 10 }));
        });
        await act(async () => {
            rendered.handle.selection.clear();
        });
        expect(rendered.container.querySelector('[data-plurid-control="plane-resize-right"]')).toBeNull();

        await act(async () => {
            rendered.handle.tree.close(b.planeID);
        });
        expect(rendered.handle.history.get().canUndo).toBe(true);
        await rendered.unmount();
    });
});
