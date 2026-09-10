/**
 * THE SIZING CONTRACT: content-sized roots are placed by their measured heights (once per frame,
 * gliding after boot, never mid-motion), a dragged child stays where it was dropped, a capped plane
 * scrolls inside its cap, and nothing oscillates.
 */
import {
    test,
    expect,
} from '@playwright/test';

import {
    openFixture,
    settle,
    tree,
    shownPlanes,
    findPlane,
    clickLink,
    waitForChildren,
    planeRect,
    HarnessWindow,
    Box,
    overlaps,
    rootBoxes,
    dispatches,
} from './helpers';



const expectNoOverlap = (boxes: Box[]) => {
    for (let i = 0; i < boxes.length; i += 1) {
        for (let j = i + 1; j < boxes.length; j += 1) {
            expect(overlaps(boxes[i], boxes[j]), boxes[i].id + ' overlaps ' + boxes[j].id).toBe(false);
        }
    }
};

test.describe('the sizing contract', () => {
    test('content-sized roots pack by their measured heights at boot, then the space is still', async ({ page }) => {
        await openFixture(page, 'columns-content');
        const boxes = await rootBoxes(page);
        expect(boxes.length).toBe(12);
        for (const box of boxes) {
            expect(box.height).toBeGreaterThan(0);
        }
        // different content, different heights
        expect(new Set(boxes.map((box) => box.height)).size).toBeGreaterThan(2);
        expectNoOverlap(boxes);
        // a row is as tall as its tallest panel: the second row starts below the tallest of the first
        const rows = new Map<number, Box[]>();
        for (const box of boxes) {
            rows.set(box.y, [...(rows.get(box.y) ?? []), box]);
        }
        const ys = [...rows.keys()].sort((a, b) => a - b);
        expect(ys.length).toBeGreaterThan(1);
        const tallest = Math.max(...rows.get(ys[0])!.map((box: Box) => box.height));
        expect(ys[1]).toBeGreaterThanOrEqual(ys[0] + tallest);
        // idle: nothing oscillates
        const before = await dispatches(page);
        await page.waitForTimeout(800);
        expect(await dispatches(page)).toBe(before);
    });

    test('a root that grows moves the roots below it (gliding), the others stay; a second identical size changes nothing', async ({ page }) => {
        await openFixture(page, 'columns-content');
        const before = await rootBoxes(page);
        // the first row's TALLEST panel: any growth of it moves the row below (a shorter panel can
        // grow inside the row's height and move nothing)
        const firstRowY = Math.min(...before.map((box) => box.y));
        const grown = before.filter((box) => box.y === firstRowY).reduce((a, b) => (a.height >= b.height ? a : b));
        const sameRow = before.filter((box) => box.y === grown.y && box.id !== grown.id);
        const below = before.filter((box) => box.y > grown.y);
        expect(below.length).toBeGreaterThan(0);
        await page.locator(`[data-plurid-plane="${grown.id}"] [data-rt-more]`).click();
        await page.waitForFunction((id) => {
            const plane = (window as unknown as HarnessWindow).__rtTree().find((root) => root.planeID === id);
            return !!plane && plane.height > 0;
        }, grown.id);
        await page.waitForTimeout(400);
        await settle(page);
        const after = await rootBoxes(page);
        const grownAfter = after.find((box) => box.id === grown.id)!;
        expect(grownAfter.height).toBeGreaterThan(grown.height);
        for (const box of below) {
            const moved = after.find((entry) => entry.id === box.id)!;
            expect(moved.y).toBeGreaterThan(box.y);
        }
        for (const box of sameRow) {
            const still = after.find((entry) => entry.id === box.id)!;
            expect(still.x).toBe(box.x);
            expect(still.y).toBe(box.y);
        }
        expectNoOverlap(after);
        // still again
        const count = await dispatches(page);
        await page.waitForTimeout(800);
        expect(await dispatches(page)).toBe(count);
    });

    test('a resize keeps the packing; a pinned root keeps its place', async ({ page }) => {
        await openFixture(page, 'columns-content');
        const roots = await tree(page);
        const pinned = roots[3];
        await page.evaluate((id) => {
            const api = (window as unknown as HarnessWindow).__pluridApi;
            api.store.dispatch({ type: 'space/setSelection', payload: [id] });
            api.store.dispatch({ type: 'space/transformSelectedPlanes', payload: { deltaX: 40, deltaY: 900 } });
            api.store.dispatch({ type: 'space/setSelection', payload: [] });
        }, pinned.planeID);
        await settle(page);
        const moved = findPlane(await tree(page), pinned.planeID);
        expect(moved.manuallyPositioned).toBe(true);
        await page.setViewportSize({ width: 1100, height: 720 });
        await page.waitForFunction(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().space.viewSize.width === 1100);
        await page.waitForTimeout(600);
        await settle(page);
        const after = await rootBoxes(page);
        const still = findPlane(await tree(page), pinned.planeID);
        expect(still.location.translateX).toBe(moved.location.translateX);
        expect(still.location.translateY).toBe(moved.location.translateY);
        expectNoOverlap(after.filter((box) => box.id !== pinned.planeID));
    });

    test('a dragged child stays where it was dropped, through a resize and a host setTree', async ({ page }) => {
        await openFixture(page, 'detail-spawned');
        const root = ((await tree(page)) as any[]).find((node: any) => String(node.route).endsWith('/geometry'))!;
        const child = root.children![0];
        await page.evaluate((id) => {
            const api = (window as unknown as HarnessWindow).__pluridApi;
            api.store.dispatch({ type: 'space/setSelection', payload: [id] });
            api.store.dispatch({ type: 'space/transformSelectedPlanes', payload: { deltaX: 120, deltaY: 80 } });
            api.store.dispatch({ type: 'space/setSelection', payload: [] });
        }, child.planeID);
        await settle(page);
        const dragged = findPlane(await tree(page), child.planeID);
        expect(dragged.manuallyPositioned).toBe(true);
        expect(dragged.location.translateX).toBeCloseTo(child.location.translateX + 120, 6);
        expect(dragged.location.translateY).toBeCloseTo(child.location.translateY + 80, 6);
        // a resize relays the roots: the child keeps its own place
        await page.setViewportSize({ width: 1100, height: 720 });
        await page.waitForFunction(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().space.viewSize.width === 1100);
        await page.waitForTimeout(600);
        await settle(page);
        const afterResize = findPlane(await tree(page), child.planeID);
        expect(afterResize.location.translateX).toBeCloseTo(dragged.location.translateX, 6);
        expect(afterResize.location.translateY).toBeCloseTo(dragged.location.translateY, 6);
        // a host writes the same tree back: the pin and the spawn geometry survive
        await page.evaluate(() => {
            const api = (window as unknown as HarnessWindow).__pluridApi;
            api.pubsub.publish({ topic: 'space.setTree', data: { tree: JSON.parse(JSON.stringify(api.getSnapshot().space.tree)) } });
        });
        await settle(page);
        const afterSet = findPlane(await tree(page), child.planeID);
        expect(afterSet.location).toEqual(afterResize.location);
        expect(afterSet.linkCoordinates).toEqual(afterResize.linkCoordinates);
        expect(afterSet.spawnedByLinkID).toBe(afterResize.spawnedByLinkID);
    });

    test('a capped plane scrolls inside its cap and reports the cap as its height', async ({ page }) => {
        await openFixture(page, 'columns-content', { extra: { planeMaxHeight: '220' } });
        const boxes = await rootBoxes(page);
        for (const box of boxes) {
            expect(box.height).toBeLessThanOrEqual(220);
        }
        const tallest = boxes.reduce((a, b) => (a.height >= b.height ? a : b));
        expect(tallest.height).toBe(220);
        const scrolls = await page.evaluate((id) => {
            const content = document.querySelector(`[data-plurid-plane="${id}"] [data-plurid-entity="PluridPlaneContent"]`) as HTMLElement;
            return { scrollHeight: content.scrollHeight, clientHeight: content.clientHeight, tabIndex: content.getAttribute('tabindex') };
        }, tallest.id);
        expect(scrolls.scrollHeight).toBeGreaterThan(scrolls.clientHeight);
        expect(scrolls.tabIndex).toBe('-1');
    });
});
