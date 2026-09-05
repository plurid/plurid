import {
    test,
    expect,
} from '@playwright/test';

import {
    openHarness,
    collectConsoleErrors,
    camera,
    spaceState,
    publish,
    projectWorld,
    viewRect,
    visibleCorners,
    settle,
} from './helpers';


test.describe('camera core', () => {
    test('boots: roots laid out, camera at home, no console errors', async ({ page }) => {
        const errors = collectConsoleErrors(page);
        await openHarness(page);

        const planes = await page.locator('[data-plurid-plane]').count();
        expect(planes).toBeGreaterThanOrEqual(5);

        const state = await spaceState(page);
        expect(state.camera.yaw).toBe(0);
        expect(state.camera.pitch).toBe(0);
        expect(state.camera.scale).toBe(1);
        // `space.center` (the harness sets it): the first root's center sits at the view center
        const first = state.tree[0];
        const projected = await projectWorld(page, {
            x: first.location.translateX + first.width / 2,
            y: first.location.translateY + first.height / 2,
            z: 0,
        });
        expect(projected.x).toBeCloseTo(state.viewSize.width / 2, 0);
        expect(projected.y).toBeCloseTo(state.viewSize.height / 2, 0);
        // measured plane sizes flow into the tree
        expect(state.tree[0].width).toBeGreaterThan(100);
        expect(state.tree[0].height).toBeGreaterThan(100);
        expect(errors).toEqual([]);
    });

    test('middle-drag pans the pivot-depth content by exactly the drag delta while pitched', async ({ page }) => {
        await openHarness(page, '?momentum=0');
        await publish(page, 'space.rotateXWith', { value: 60 });
        const rect = await viewRect(page);
        const start = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };

        const before = await camera(page);
        await page.mouse.move(start.x, start.y);
        await page.mouse.down({ button: 'middle' });
        // cross the 4 px drag threshold first (that movement is consumed), then pan 100 px
        await page.mouse.move(start.x + 4, start.y);
        await page.mouse.move(start.x + 104, start.y, { steps: 10 });
        await page.mouse.up({ button: 'middle' });

        const after = await camera(page);
        expect(after.pitch).toBeCloseTo(60, 6);
        expect(after.offset.x - before.offset.x).toBeCloseTo(100, 0);
        expect(after.offset.y - before.offset.y).toBeCloseTo(0, 0);
        expect(after.pivot).toEqual(before.pivot);
    });

    test('a trackpad scroll glides onto exactly its total; a trackpad pinch is a real zoom', async ({ page }) => {
        await openHarness(page, '?momentum=0');
        const rect = await viewRect(page);
        await page.mouse.move(rect.left + 60, rect.top + rect.height - 160);
        const before = await camera(page);

        // eight trackpad-sized ticks (12.5 px each): released over a few frames, landing on 100 px
        for (let i = 0; i < 8; i++) {
            await page.mouse.wheel(0, 12.5);
        }
        const midway = await camera(page);
        await page.waitForTimeout(400);
        const panned = await camera(page);
        const movedMid = Math.hypot(midway.offset.x - before.offset.x, midway.offset.y - before.offset.y);
        const movedAll = Math.hypot(panned.offset.x - before.offset.x, panned.offset.y - before.offset.y);
        expect(movedAll).toBeCloseTo(100, 0);
        expect(movedMid).toBeGreaterThan(0);
        expect(movedMid).toBeLessThan(movedAll);
        expect(panned.scale).toBeCloseTo(before.scale, 9);

        // a pinch (ctrl + trackpad-sized deltas), −100 px in all: e^(0.006 · 100) ≈ ×1.82 — the
        // mouse-notch step would have made it ×1.1
        await page.keyboard.down('Control');
        for (let i = 0; i < 10; i++) {
            await page.mouse.wheel(0, -10);
        }
        await page.keyboard.up('Control');
        await page.waitForTimeout(400);
        const pinched = await camera(page);
        expect(pinched.scale / panned.scale).toBeGreaterThan(1.7);
        expect(pinched.scale / panned.scale).toBeLessThan(1.95);
    });

    test('ctrl+wheel keeps the point under the cursor fixed at yaw 30', async ({ page }) => {
        await openHarness(page);
        await publish(page, 'space.rotateYWith', { value: 30 });
        const rect = await viewRect(page);
        const state = await spaceState(page);
        const plane = state.tree[0];
        const world = { x: plane.location.translateX + plane.width / 2, y: plane.location.translateY + plane.height / 2, z: 0 };
        const anchor = await projectWorld(page, world);

        await page.mouse.move(rect.left + anchor.x, rect.top + anchor.y);
        await page.keyboard.down('Control');
        await page.mouse.wheel(0, -100);
        await page.keyboard.up('Control');
        await page.waitForTimeout(50);

        const after = await camera(page);
        expect(after.scale).toBeGreaterThan(1);
        const moved = await projectWorld(page, world);
        expect(Math.hypot(moved.x - anchor.x, moved.y - anchor.y)).toBeLessThan(1);
    });

    test('framing a plane then dragging continues from the framed pose (no snap)', async ({ page }) => {
        await openHarness(page, '?momentum=0');
        const state = await spaceState(page);
        const target = state.tree[2];
        await publish(page, 'space.frame', { planeID: target.planeID, animate: false });
        await page.waitForTimeout(50);

        const framed = await camera(page);
        expect(framed.yaw).toBeCloseTo(-target.location.rotateY, 6);
        expect(framed.pivot.x).toBeCloseTo(target.location.translateX + target.width / 2, 3);
        expect(framed.pivot.y).toBeCloseTo(target.location.translateY + target.height / 2, 3);

        const rect = await viewRect(page);
        const start = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        await page.mouse.move(start.x, start.y);
        await page.mouse.down({ button: 'middle' });
        await page.mouse.move(start.x + 4, start.y);
        await page.mouse.move(start.x + 54, start.y, { steps: 5 });
        await page.mouse.up({ button: 'middle' });

        const after = await camera(page);
        expect(after.yaw).toBeCloseTo(framed.yaw, 6);
        expect(after.pitch).toBeCloseTo(framed.pitch, 6);
        expect(after.scale).toBeCloseTo(framed.scale, 6);
        expect(after.pivot).toEqual(framed.pivot);
        expect(after.offset.x - framed.offset.x).toBeCloseTo(50, 0);
    });

    test('fit-to-view frames every visible plane inside the view margin', async ({ page }) => {
        await openHarness(page);
        await publish(page, 'space.rotateYWith', { value: 40 });
        await publish(page, 'space.fitToView');
        await settle(page);

        const state = await spaceState(page);
        expect(state.camera.yaw).toBe(0);
        expect(state.camera.pitch).toBe(0);
        expect(state.camera.scale).toBeLessThan(1);

        const corners = await visibleCorners(page);
        expect(corners.length).toBeGreaterThan(0);
        for (const corner of corners) {
            const projected = await projectWorld(page, corner);
            expect(Math.abs(projected.x - state.viewSize.width / 2)).toBeLessThanOrEqual(state.viewSize.width / 2 * 0.85 + 0.5);
            expect(Math.abs(projected.y - state.viewSize.height / 2)).toBeLessThanOrEqual(state.viewSize.height / 2 * 0.85 + 0.5);
        }
    });

    test('the viewpoint codec round-trips v1 and v2 through the URL topic', async ({ page }) => {
        await openHarness(page);
        await publish(page, 'space.rotateYWith', { value: 25 });
        await publish(page, 'space.translateXWith', { value: 80 });
        const before = await camera(page);
        const v2 = await page.evaluate(() => (window as any).__rtViewpoint2());
        expect(v2.startsWith('v2|')).toBe(true);
        const v1 = await page.evaluate(() => (window as any).__pluridApi.getViewpoint());

        await publish(page, 'space.resetTransform', { animate: false });
        await publish(page, 'space.setViewpoint', { viewpoint: v2 });
        await page.waitForTimeout(30);
        const restored2 = await camera(page);
        expect(restored2.yaw).toBeCloseTo(before.yaw, 3);
        expect(restored2.offset.x).toBeCloseTo(before.offset.x, 3);

        await publish(page, 'space.resetTransform', { animate: false });
        await publish(page, 'space.setViewpoint', { viewpoint: v1 });
        await page.waitForTimeout(30);
        const restored1 = await spaceState(page);
        expect(restored1.rotationY).toBeCloseTo(25, 3);
        expect(restored1.translationX).toBeCloseTo((await spaceState(page)).translationX, 6);
    });
});
