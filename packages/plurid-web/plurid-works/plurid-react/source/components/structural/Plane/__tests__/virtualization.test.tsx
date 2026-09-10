/**
 * @jest-environment jsdom
 */
/**
 * THE DETACH TIER: a detached plane keeps its shell (its box, its attribute) while its content is
 * unmounted (`unmount`: the state is gone) or retained (`retain`: React's Activity keeps the state,
 * the DOM is hidden); the scroll position survives either way.
 */
import React, { act, useState } from 'react';

import actions from '../../../../services/state/actions';
import {
    renderPlurid,
} from '../../../../testing';



const Counter: React.FC = () => {
    const [count, setCount] = useState(0);
    return (
        <div style={{ height: 300 }}>
            <button type="button" data-counter onClick={() => setCount((value) => value + 1)}>{count}</button>
        </div>
    );
};
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const flush = () => act(async () => { await wait(60); });
/** The pass runs on its own timers (100 ms, the maturity): wait for what it decides, not for a fixed time. */
const until = async (predicate: () => boolean, limit = 3000) => {
    const started = Date.now();
    while (!predicate()) {
        if (Date.now() - started > limit) {
            throw new Error('the culling pass never reached the expected state');
        }
        await act(async () => { await wait(20); });
    }
};
const CONTENT = '[data-plurid-entity="PluridPlaneContent"]';

/** The real pipeline: the camera leaves, the pass hides and (delay 0) detaches both planes; the camera returns, they re-attach. */
const scenario = async (mode: 'unmount' | 'retain') => {
    const rendered = await renderPlurid({
        planes: [{ route: '/a', component: Counter }, { route: '/b', component: Counter }],
        view: ['/a', '/b'],
        configuration: { space: { culling: { enabled: true, detach: { mode, delay: 0 } }, navigation: { motion: { duration: 0 } } } } as any,
    });
    await flush();
    const store = rendered.api.store;
    const [, b] = store.getState().space.tree;
    const element = () => rendered.container.querySelector(`[data-plurid-plane="${b.planeID}"]`) as HTMLElement;
    // a click: state the retained tier keeps and the unmount tier drops
    await act(async () => {
        (element().querySelector('[data-counter]') as HTMLElement).click();
    });
    expect(element().querySelector('[data-counter]')!.textContent).toBe('1');
    // remember a scroll position on the content
    const content = element().querySelector(CONTENT) as HTMLElement;
    Object.defineProperty(content, 'scrollTop', { value: 120, writable: true, configurable: true });
    content.dispatchEvent(new Event('scroll'));
    // the click made the plane focused (an exception): leave it, then take the camera far away
    (document.activeElement as HTMLElement | null)?.blur();
    const home = store.getState().space.camera;
    await act(async () => {
        store.dispatch(actions.space.setPlaneSize({ planeID: b.planeID, width: 400, height: 356 }));
        store.dispatch(actions.space.setCamera({ ...home, pivot: { x: 0, y: 100000, z: 0 } }));
    });
    // the pass hides both planes off the frustum and detaches them at once (delay 0)
    await until(() => store.getState().space.culled.detached.includes(b.planeID));
    expect(element().getAttribute('data-plurid-culled')).toBe('detached');
    // the shell keeps its box
    expect(element().style.height).toBe('356px');
    const back = async () => {
        // a restore is a WRITE: the position is put back to 0 first, so 120 afterwards is the restore's doing
        const scroller = element().querySelector(CONTENT) as HTMLElement | null;
        if (scroller) {
            scroller.scrollTop = 0;
        }
        await act(async () => {
            store.dispatch(actions.space.setCamera(home));
        });
        await until(() => store.getState().space.culled.detached.length === 0);
    };
    return { rendered, store, b, element, back };
};

describe('the detach tier: a detached plane', () => {
    it('unmount: the content is gone, and comes back fresh when the plane is shown again', async () => {
        const { rendered, element, back } = await scenario('unmount');
        expect(element().querySelector(CONTENT)).toBeNull();
        await back();
        expect(element().getAttribute('data-plurid-culled')).toBeNull();
        expect(element().querySelector('[data-counter]')!.textContent).toBe('0');
        expect(element().style.height).toBe('');
        const revealed = element().querySelector(CONTENT) as HTMLElement;
        expect(revealed).toBeTruthy();
        expect(revealed.scrollTop).toBe(120);
        rendered.unmount();
    });

    it('retain: the content is hidden but keeps its state; the scroll position is restored on re-attach', async () => {
        const { rendered, element, back } = await scenario('retain');
        const content = element().querySelector(CONTENT) as HTMLElement | null;
        // Activity keeps the subtree, hidden
        expect(content).toBeTruthy();
        expect(content!.style.display).toBe('none');
        await back();
        expect(element().getAttribute('data-plurid-culled')).toBeNull();
        expect(element().querySelector('[data-counter]')!.textContent).toBe('1');
        const revealed = element().querySelector(CONTENT) as HTMLElement;
        expect(revealed.style.display).not.toBe('none');
        expect(revealed.scrollTop).toBe(120);
        rendered.unmount();
    });
});
