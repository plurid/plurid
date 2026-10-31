import {
    test,
    expect,
    Page,
} from '@playwright/test';

import {
    openHarness,
    collectConsoleErrors,
    publish,
    tree,
    rootByRoute,
    settle,
    waitForState,
    planeRect,
} from './helpers';


/**
 * OCCLUDED PLANES FADE (2026-10-31), in a real browser, the user's case: a parent with a 2 × 2 grid
 * of its children standing in front of it, and the camera focusing the parent. The children in
 * front fade and let the pointer through to the parent; they come back as the camera moves and fade
 * again at its rest; nothing fades while the camera travels.
 */

const CHILDREN = ['/transform', '/material', '/topology', '/tessellation'];

/** The four other roots made the parent's children, in a 2 × 2 grid in front of it. */
const arrange = async (page: Page) => {
    const roots = await tree(page);
    const parent = rootByRoute(roots, '/geometry');
    const children = CHILDREN.map((route, index) => {
        const node = rootByRoute(roots, route);
        return {
            ...node,
            parentPlaneID: parent.planeID,
            manuallyPositioned: true,
            sizeMode: 'manual',
            width: 340,
            height: 260,
            location: {
                translateX: parent.location.translateX - 40 + (index % 2) * 360,
                translateY: parent.location.translateY - 30 + Math.floor(index / 2) * 280,
                translateZ: 240,
                rotateX: 0,
                rotateY: 0,
            },
            children: [],
        };
    });
    const next = [{
        ...parent,
        sizeMode: 'manual',
        width: 640,
        height: 500,
        children,
    }];
    await publish(page, 'space.setTree', { tree: next });
    await waitForState(page, (state) => state.space.tree.length === 1 && state.space.tree[0].children?.length === 4, 'the grid in front of the parent');
    await settle(page);
    return { parent: parent.planeID, children: children.map((child) => child.planeID) };
};

/** Every `occluded` the bus says, with the camera's motion when it said it. */
const record = (page: Page) => page.evaluate(() => {
    const w = window as any;
    w.__rtOccluded = [];
    w.__pluridApi.pubsub.subscribe({
        topic: 'space.changed',
        callback: (data: any) => {
            if (data?.kind === 'occluded') {
                w.__rtOccluded.push({ ...data.value, motion: w.__pluridApi.getSnapshot().space.motion });
            }
        },
    });
});

const heard = (page: Page): Promise<{ target: string; planeIDs: string[]; motion: string }[]> => page.evaluate(() => (window as any).__rtOccluded);

const fadedCount = (page: Page) => waitForState(page, (state) => state.space.occluded.planeIDs.length === 4, 'the four children to fade', undefined, { timeout: 5_000 });


test.describe('occluded planes fade', () => {
    test('FOCUSING THE PARENT FADES THE GRID IN FRONT OF IT, and a press on it reaches the parent', async ({ page }) => {
        const errors = collectConsoleErrors(page);
        await openHarness(page);
        const { parent, children } = await arrange(page);
        await record(page);

        await publish(page, 'space.frame', { planeID: parent, animate: false });
        await fadedCount(page);
        await settle(page);
        const state = await page.evaluate(() => (window as any).__pluridApi.getSnapshot().space.occluded);
        expect(state.target).toBe(parent);
        expect([...state.planeIDs].sort()).toEqual([...children].sort());

        // faded to 0.1 in a short fade, and the pointer goes through them to the parent
        await page.waitForFunction((ids) => ids.every((id: string) => {
            const element = document.querySelector(`[data-plurid-plane="${id}"]`) as HTMLElement;
            return element.getAttribute('data-plurid-occluding') === 'true'
                && Math.abs(parseFloat(getComputedStyle(element).opacity) - 0.1) < 0.01;
        }), children);
        const box = await planeRect(page, parent);
        const hit = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('[data-plurid-plane]')?.getAttribute('data-plurid-plane'), {
            x: box.left + box.width / 2,
            y: box.top + box.height / 2,
        });
        expect(hit).toBe(parent);
        expect(errors).toEqual([]);
    });

    test('THEY COME BACK AS THE CAMERA MOVES, AND NOTHING FADES WHILE IT TRAVELS', async ({ page }) => {
        await openHarness(page, '?motionMs=700');
        const { parent } = await arrange(page);
        await publish(page, 'space.frame', { planeID: parent, animate: false });
        await fadedCount(page);
        await record(page);

        // a turn: the set empties at once, and fills again at the rest
        await publish(page, 'space.rotateYWith', { value: 4 });
        await fadedCount(page);
        const afterTurn = await heard(page);
        expect(afterTurn.map((value) => value.planeIDs.length)).toEqual([0, 4]);

        // a travel away and back: every faded set the bus said came at rest
        await publish(page, 'space.fitToView', { animate: true });
        await waitForState(page, (state) => state.space.motion === 'tween', 'the travel to start');
        await settle(page);
        await publish(page, 'space.frame', { planeID: parent, animate: true });
        await waitForState(page, (state) => state.space.motion === 'tween', 'the travel back to start');
        await settle(page);
        await fadedCount(page);
        const all = await heard(page);
        expect(all.filter((value) => value.planeIDs.length > 0).every((value) => value.motion === 'idle')).toBe(true);
        expect(all.at(-1)!.target).toBe(parent);
    });
});
