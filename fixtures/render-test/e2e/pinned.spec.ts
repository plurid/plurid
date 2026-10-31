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
    findPlane,
    settle,
    viewRect,
    waitForState,
    camera,
    planeRect,
    afterFrames,
} from './helpers';


/**
 * PINNED AND STACKED PLANES (2026-10-31), in a real browser: a plane lifted onto the screen above
 * the space keeps its content (the same DOM nodes, the same React state, its scroll), stays where it
 * is while the camera moves, takes the input that lands on it and lets the rest through; placed
 * back, it is drawn where its frame was. A stack sets planes one behind another with every title
 * showing, and an unstack puts each back exactly.
 */

type Rect = { left: number; top: number; width: number; height: number };

const frameRect = (page: Page, planeID: string): Promise<Rect | null> => page.evaluate((id) => {
    const frame = document.querySelector(`[data-plurid-pinned="${id}"]`);
    if (!frame) {
        return null;
    }
    const r = frame.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
}, planeID);

/** The pin's flight (from where the plane was drawn to its frame) has landed: the frame is at its rect. */
const framesLanded = (page: Page) => page.waitForFunction(() => Array.from(document.querySelectorAll('[data-plurid-pinned]'))
    .every((frame) => frame.getAnimations().length === 0));

const pinnedIDs = (page: Page) => page.evaluate(() => {
    const ids: string[] = [];
    const walk = (nodes: any[]) => {
        for (const node of nodes) {
            if (node.pinned) {
                ids.push(node.planeID);
            }
            walk(node.children ?? []);
        }
    };
    walk((window as any).__rtTree());
    return ids;
});

const expectNear = (actual: Rect, expected: Rect, within = 1.5) => {
    expect(Math.abs(actual.left - expected.left), 'left').toBeLessThan(within);
    expect(Math.abs(actual.top - expected.top), 'top').toBeLessThan(within);
    expect(Math.abs(actual.width - expected.width), 'width').toBeLessThan(within);
    expect(Math.abs(actual.height - expected.height), 'height').toBeLessThan(within);
};


test.describe('pinned planes', () => {
    test('PIN AND PLACE KEEP THE CONTENT, and the placed plane is drawn where its frame was', async ({ page }) => {
        const errors = collectConsoleErrors(page);
        await openHarness(page, '?sizes=content');
        await settle(page);
        const transform = rootByRoute(await tree(page), '/transform');
        const id = transform.planeID;

        // React state (six more rows) and a DOM mark on a node of the content
        await page.evaluate((planeID) => {
            const button = document.querySelector(`[data-plurid-plane="${planeID}"] [data-rt-more]`) as any;
            button.click();
            button.__rtMark = 'same node';
        }, id);
        // the grown plane relays the roots, gliding: the pin and the place come after the glide
        await afterFrames(page, 3);
        await waitForState(page, (state) => state.space.layoutTransition === 0, 'the relayout to glide home');
        await settle(page);
        const rows = await page.locator(`[data-plurid-plane="${id}"] [data-rt-more]`).evaluate((button) => button.parentElement!.parentElement!.textContent!.length);

        const view = await viewRect(page);
        const rect = { x: view.width - 16 - 360, y: 24, width: 360, height: 320 };
        await publish(page, 'space.pinned', { action: 'pin', planeID: id, rect });
        await afterFrames(page, 2);
        await framesLanded(page);
        expect(await pinnedIDs(page)).toEqual([id]);
        const frame = (await frameRect(page, id))!;
        expectNear(frame, { left: view.left + rect.x, top: view.top + rect.y, width: rect.width, height: rect.height });

        const inFrame = await page.evaluate((planeID) => {
            const button = document.querySelector(`[data-plurid-pinned="${planeID}"] [data-rt-more]`) as any;
            return { mark: button?.__rtMark, text: button?.parentElement?.parentElement?.textContent?.length };
        }, id);
        expect(inFrame).toEqual({ mark: 'same node', text: rows });

        // the content scrolls in its frame; the offset rides along
        await page.evaluate((planeID) => {
            const scroller = document.querySelector(`[data-plurid-pinned="${planeID}"] [data-plurid-entity="PluridPlaneContent"]`) as HTMLElement;
            scroller.scrollTop = 60;
        }, id);

        // the camera turns both ways; the frame does not move
        await publish(page, 'space.rotateYWith', { value: 20 });
        await publish(page, 'space.rotateXWith', { value: 12 });
        await settle(page);
        expect((await camera(page)).pitch).not.toBe(0);
        expectNear((await frameRect(page, id))!, frame);

        await publish(page, 'space.pinned', { action: 'place', planeID: id, animate: false });
        await waitForState(page, (state) => !JSON.stringify(state.space.tree).includes('"pinned":{'), 'the plane to leave its frame');
        await settle(page);
        expect(await frameRect(page, id)).toBeNull();
        const placed = await page.evaluate((planeID) => {
            const button = document.querySelector(`[data-plurid-plane="${planeID}"] [data-rt-more]`) as any;
            const scroller = document.querySelector(`[data-plurid-plane="${planeID}"] [data-plurid-entity="PluridPlaneContent"]`) as HTMLElement;
            return { mark: button?.__rtMark, scrollTop: scroller.scrollTop };
        }, id);
        expect(placed.mark).toBe('same node');
        expect(placed.scrollTop).toBeGreaterThan(0);
        // the camera was levelled to set it face-on (its yaw kept), and the plane is drawn where the
        // frame was, within a px and a half (the browser's own projection)
        const levelled = await camera(page);
        expect(levelled.pitch).toBe(0);
        expect(Math.abs(levelled.yaw)).toBeGreaterThan(1);
        expectNear(await planeRect(page, id), frame);
        expect(errors).toEqual([]);
    });

    test('INPUT ON A PINNED PLANE IS THE PLANE\'S; beside it the space\'s', async ({ page }) => {
        await openHarness(page);
        await settle(page);
        const material = rootByRoute(await tree(page), '/material');
        const view = await viewRect(page);
        await publish(page, 'space.pinned', { action: 'pin', planeID: material.planeID, rect: { x: 16, y: 16, width: 320, height: 300, anchor: 'top-right' } });
        await afterFrames(page, 2);
        await framesLanded(page);
        const frame = (await frameRect(page, material.planeID))!;
        const before = await camera(page);

        // a drag and a wheel on the frame: the camera stays
        await page.mouse.move(frame.left + 100, frame.top + 150);
        await page.mouse.down();
        await page.mouse.move(frame.left + 200, frame.top + 200, { steps: 5 });
        await page.mouse.up();
        await page.mouse.wheel(0, 200);
        await settle(page);
        const after = await camera(page);
        expect([after.yaw, after.pitch, after.scale]).toEqual([before.yaw, before.pitch, before.scale]);

        // the same wheel beside it zooms the space, and the frame stays where it is
        await page.mouse.move(view.left + 60, view.top + view.height - 60);
        await page.mouse.wheel(0, 200);
        await settle(page);
        const moved = await camera(page);
        expect(moved.scale).not.toBe(before.scale);
        expectNear((await frameRect(page, material.planeID))!, frame);
    });

    test('collapsed, a pinned plane is its title bar along the bottom edge; expanded, its frame again', async ({ page }) => {
        await openHarness(page);
        await settle(page);
        const roots = await tree(page);
        const view = await viewRect(page);
        const [a, b] = [rootByRoute(roots, '/material').planeID, rootByRoute(roots, '/topology').planeID];
        await publish(page, 'space.pinned', { action: 'pin', planeID: a });
        await publish(page, 'space.pinned', { action: 'pin', planeID: b });
        await afterFrames(page, 2);
        await framesLanded(page);
        const open = (await frameRect(page, a))!;
        await publish(page, 'space.pinned', { action: 'collapse', planeID: a });
        await publish(page, 'space.pinned', { action: 'collapse', planeID: b });
        await afterFrames(page, 2);
        const [barA, barB] = [(await frameRect(page, a))!, (await frameRect(page, b))!];
        for (const bar of [barA, barB]) {
            expect(bar.height).toBe(56);
            expect(Math.round(bar.top + bar.height)).toBe(Math.round(view.top + view.height - 16));
        }
        expect(barA.left + barA.width <= barB.left || barB.left + barB.width <= barA.left).toBe(true);
        await publish(page, 'space.pinned', { action: 'expand', planeID: a });
        await afterFrames(page, 2);
        expectNear((await frameRect(page, a))!, open);
    });
});


test.describe('stacked planes', () => {
    test('a stack sets planes one behind another, every title showing; an unstack puts each back exactly', async ({ page }) => {
        await openHarness(page);
        await settle(page);
        const roots = await tree(page);
        const ids = ['/geometry', '/transform', '/material'].map((route) => rootByRoute(roots, route).planeID);
        const before = ids.map((id) => findPlane(roots, id).location);

        await publish(page, 'space.stack', { action: 'stack', planeIDs: ids });
        await waitForState(page, (state) => Object.keys(state.space.stacks).length === 1, 'the stack');
        await waitForState(page, (state) => state.space.layoutTransition === 0, 'the planes to glide into the stack');
        await settle(page);

        const rects = await Promise.all(ids.map((id) => planeRect(page, id)));
        for (let index = 1; index < rects.length; index += 1) {
            // the plane behind is up-left of the one in front, and drawn smaller
            expect(rects[index].left).toBeLessThan(rects[index - 1].left);
            expect(rects[index].top).toBeLessThan(rects[index - 1].top);
            expect(rects[index].width).toBeLessThan(rects[index - 1].width);
        }
        // every title shows: the point just inside each plane's top-left corner hits that plane
        const hits = await page.evaluate((list) => list.map(({ id, rect }) => {
            const element = document.elementFromPoint(rect.left + 12, rect.top + 12);
            return element?.closest('[data-plurid-plane]')?.getAttribute('data-plurid-plane') === id;
        }), ids.map((id, index) => ({ id, rect: rects[index] })));
        expect(hits).toEqual([true, true, true]);

        await publish(page, 'space.stack', { action: 'unstack', stackID: 'stack-1' });
        await waitForState(page, (state) => Object.keys(state.space.stacks).length === 0, 'the unstack');
        await settle(page);
        const after = await tree(page);
        expect(ids.map((id) => findPlane(after, id).location)).toEqual(before);
    });
});
