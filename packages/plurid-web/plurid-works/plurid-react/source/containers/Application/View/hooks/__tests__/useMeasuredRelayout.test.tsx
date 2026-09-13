/**
 * @jest-environment jsdom
 */
/**
 * THE SIZING CONTRACT: a measured height moves the roots below it (the columns pack by the current
 * sizes); a second identical report changes nothing; nothing relays mid-motion.
 */
import React, { act } from 'react';

import actions from '../../../../../services/state/actions';
import { reportPlaneSizes } from '../../../../../services/logic/camera';
import { measuredSizesSignature } from '../useMeasuredRelayout';
import {
    renderPlurid,
} from '../../../../../testing';



const Page = () => <div>page</div>;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const flush = () => act(async () => { await wait(60); });

describe('the measured relayout', () => {
    it('a measured height re-packs the column below it, once; an equal report is a no-op', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/a', component: Page }, { route: '/b', component: Page }, { route: '/c', component: Page }],
            view: ['/a', '/b', '/c'],
            configuration: { space: { layout: { type: 'COLUMNS', columns: 1 }, navigation: { motion: { duration: 0 } } } } as any,
        });
        await flush();
        const store = rendered.api.store;
        const before = store.getState().space.tree;
        const [a, b, c] = before;
        expect(b.location.translateY).toBeGreaterThan(0);
        // a measured height taller than the boot pitch: the roots below move down
        await act(async () => {
            store.dispatch(actions.space.setPlaneSize({ planeID: a.planeID, width: 400, height: b.location.translateY + 500 }));
        });
        await flush();
        const after = store.getState().space.tree;
        expect(after[0].height).toBe(b.location.translateY + 500);
        expect(after[1].location.translateY).toBeGreaterThan(b.location.translateY);
        expect(after[2].location.translateY).toBeGreaterThan(c.location.translateY);
        expect(after[1].location.translateY - after[0].location.translateY).toBeGreaterThanOrEqual(after[0].height);
        // the same report again: one notification (the equality-gated write), no relayout, the
        // reference kept (a thunk's inner dispatches bypass a spy on `store.dispatch`: count the
        // store's notifications instead)
        let notifications = 0;
        const unsubscribe = store.subscribe(() => { notifications += 1; });
        await act(async () => {
            store.dispatch(actions.space.setPlaneSize({ planeID: a.planeID, width: 400, height: b.location.translateY + 500 }));
        });
        await flush();
        expect(notifications).toBe(1);
        expect(store.getState().space.tree).toBe(after);
        unsubscribe();
        rendered.unmount();
    });

    it('a frame\'s reports of several roots are one tree write and one relayout', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/a', component: Page }, { route: '/b', component: Page }, { route: '/c', component: Page }],
            view: ['/a', '/b', '/c'],
            configuration: { space: { layout: { type: 'COLUMNS', columns: 1 }, navigation: { motion: { duration: 0 } } } } as any,
        });
        await flush();
        const store = rendered.api.store;
        const [a, b] = store.getState().space.tree;
        // two store notifications: the one sizes write, the one relayout it causes
        let notifications = 0;
        const unsubscribe = store.subscribe(() => { notifications += 1; });
        await act(async () => {
            store.dispatch(reportPlaneSizes([
                { planeID: a.planeID, width: 400, height: b.location.translateY + 300 },
                { planeID: b.planeID, width: 400, height: 250 },
            ]) as any);
        });
        await flush();
        expect(notifications).toBe(2);
        const after = store.getState().space.tree;
        expect(after[0].height).toBe(b.location.translateY + 300);
        expect(after[1].height).toBe(250);
        expect(after[1].location.translateY).toBeGreaterThan(b.location.translateY);
        unsubscribe();
        rendered.unmount();
    });

    it('the signature ignores hidden, pinned and hand-sized roots', () => {
        const root = (extra: any) => ({ planeID: 'x', width: 10, height: 20, ...extra }) as any;
        expect(measuredSizesSignature([root({}), root({ show: false }), root({ manuallyPositioned: true }), root({ sizeMode: 'manual' })])).toBe('10x20|-|-|-');
    });
});
