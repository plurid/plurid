import {
    test,
    expect,
    Page,
} from '@playwright/test';

import {
    openHarness,
    camera,
    spaceState,
    publish,
    viewRect,
} from './helpers';


const tree = (page: Page) => page.evaluate(() => (window as any).__rtTree());

const selection = (page: Page) => page.evaluate(() => (window as any).__pluridApi.getSnapshot().space.selectedPlaneIDs as string[]);

/** Bounding boxes of the roots that are fully inside the viewport, in tree order. */
const visibleRoots = async (page: Page) => {
    const roots = await tree(page);
    const viewport = page.viewportSize()!;
    const visible: { plane: any; box: { x: number; y: number; width: number; height: number } }[] = [];
    for (const plane of roots) {
        const box = await page.locator(`[data-plurid-plane="${plane.planeID}"]`).boundingBox();
        if (box && box.x >= 0 && box.y >= 0 && box.x + box.width <= viewport.width && box.y + box.height <= viewport.height) {
            visible.push({ plane, box });
        }
    }
    return visible;
};

const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';


test.describe('selection and editing', () => {
    test('a modifier-drag on empty space draws a marquee and selects the intersected planes', async ({ page }) => {
        await openHarness(page, '?momentum=0&reducedMotion=1');
        const roots = await visibleRoots(page);
        expect(roots.length).toBeGreaterThanOrEqual(2);
        const [first, second] = roots;
        const rect = await viewRect(page);

        // start in the empty strip BELOW the first row (the columns layout wraps far lower), sweep
        // up and right into the second plane so the rect covers the bottoms of both
        const startX = first.box.x + 10;
        const startY = Math.min(rect.top + rect.height - 160, first.box.y + first.box.height + 30);
        const endX = second.box.x + 40;
        const endY = first.box.y + first.box.height - 60;
        expect(startY).toBeGreaterThan(first.box.y + first.box.height);
        await page.keyboard.down(modifier);
        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(startX + 4, startY + 2);
        await page.mouse.move(endX, endY, { steps: 8 });
        await expect(page.locator('[data-plurid-entity="PluridMarquee"]')).toBeVisible();
        await page.mouse.up();
        await page.keyboard.up(modifier);

        const selected = await selection(page);
        expect(selected).toContain(first.plane.planeID);
        expect(selected).toContain(second.plane.planeID);
        expect(selected.length).toBe(2);
        expect(await page.locator('[data-plurid-entity="PluridMarquee"]').count()).toBe(0);
        // the camera did not orbit
        expect((await camera(page)).yaw).toBe(0);

        // ⌘/Ctrl+click toggles one plane out; a plain modifier click on empty space clears
        await page.keyboard.down(modifier);
        await page.mouse.click(second.box.x + second.box.width / 2, second.box.y + second.box.height / 2);
        await page.keyboard.up(modifier);
        expect(await selection(page)).toEqual([first.plane.planeID]);
    });

    test('arrows walk to the nearest plane and Enter frames it; ⌘/Ctrl+A selects all', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1&momentum=0');
        const roots = await visibleRoots(page);
        const [first, second] = roots;
        const rect = await viewRect(page);
        // focus the view on empty space
        await page.mouse.click(rect.left + 30, rect.top + rect.height - 140);

        await publish(page, 'space.frame', { planeID: first.plane.planeID, animate: false });
        await page.evaluate((id) => (window as any).__pluridApi.store.dispatch({ type: 'space/setSpaceField', payload: { field: 'activePlaneID', value: id } }), first.plane.planeID);
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(80);
        expect((await spaceState(page)).activePlaneID).toBe(second.plane.planeID);
        const framed = await camera(page);
        expect(framed.pivot.x).toBeCloseTo(second.plane.location.translateX + second.plane.width / 2, 0);

        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(80);
        expect((await spaceState(page)).activePlaneID).toBe(first.plane.planeID);

        await page.keyboard.press(`${modifier}+KeyA`);
        const all = await selection(page);
        expect(all.length).toBe((await tree(page)).length);
    });

    test('align and distribute through the pubsub move the selection deterministically', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1');
        const roots = await tree(page);
        const ids = roots.slice(0, 3).map((plane: any) => plane.planeID);
        await publish(page, 'space.setSelection', { planeIDs: ids });
        await page.waitForTimeout(30);
        if ((await selection(page)).length !== 3) {
            await page.evaluate((planeIDs) => (window as any).__pluridApi.store.dispatch({ type: 'space/setSelection', payload: planeIDs }), ids);
        }
        expect(await selection(page)).toEqual(ids);

        await publish(page, 'space.align', { edge: 'top' });
        const aligned = (await tree(page)).slice(0, 3);
        const tops = aligned.map((plane: any) => plane.location.translateY);
        expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(1e-6);

        await publish(page, 'space.distribute', { axis: 'x' });
        const distributed = (await tree(page)).slice(0, 3).map((plane: any) => ({ left: plane.location.translateX, right: plane.location.translateX + plane.width }))
            .sort((a: any, b: any) => a.left - b.left);
        const gapA = distributed[1].left - distributed[0].right;
        const gapB = distributed[2].left - distributed[1].right;
        expect(Math.abs(gapA - gapB)).toBeLessThan(0.01);

        const before = (await tree(page)).length;
        await publish(page, 'space.duplicate', { offset: 30 });
        expect((await tree(page)).length).toBe(before + 3);
        expect((await selection(page)).length).toBe(3);
    });

    test('a resize handle resizes a selected plane by hand: manual size, one history entry, the child stays attached', async ({ page }) => {
        await openHarness(page, '?resizable=1&reducedMotion=1&momentum=0');
        const roots = await tree(page);
        const geometry = roots.find((node: any) => node.route.endsWith('/geometry'));
        await page.evaluate((id) => {
            const link = document.querySelector(`[data-plurid-plane="${id}"] [data-plurid-link-route$="/geometry/detail"]`) as HTMLElement;
            link.click();
        }, geometry.planeID);
        await page.waitForFunction((id) => {
            const root = (window as any).__rtTree().find((node: any) => node.planeID === id);
            return root && root.children && root.children.length === 1;
        }, geometry.planeID);
        await publish(page, 'space.frame', { planeID: geometry.planeID, animate: false });
        await page.evaluate((id) => (window as any).__pluridApi.store.dispatch({ type: 'space/setSelection', payload: [id] }), geometry.planeID);
        await page.waitForTimeout(100);

        const handle = page.locator(`[data-plurid-plane="${geometry.planeID}"] [data-plurid-control="plane-resize-corner"]`);
        await expect(handle).toHaveCount(1);
        const box = (await handle.boundingBox())!;
        const sizeBefore = (await tree(page)).find((node: any) => node.planeID === geometry.planeID);
        const undoBefore = (await spaceState(page)).history.undoDepth;

        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2 + 40, { steps: 6 });
        await page.mouse.up();
        await page.waitForTimeout(120);

        const after = (await tree(page)).find((node: any) => node.planeID === geometry.planeID);
        expect(after.sizeMode).toBe('manual');
        expect(after.width).toBeGreaterThan(sizeBefore.width + 20);
        expect(after.height).toBeGreaterThan(sizeBefore.height + 10);
        const element = await page.locator(`[data-plurid-plane="${geometry.planeID}"]`).boundingBox();
        expect(element!.width).toBeCloseTo(after.width * (await camera(page)).scale, 0);
        expect((await spaceState(page)).history.undoDepth).toBe(undoBefore + 1);
        // the camera did not move and the child is still attached to its link
        expect((await camera(page)).yaw).toBe(0);
        expect(after.children).toHaveLength(1);
        expect(after.children[0].parentPlaneID).toBe(geometry.planeID);
    });
});
