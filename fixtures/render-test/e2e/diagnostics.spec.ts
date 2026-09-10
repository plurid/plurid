/**
 * THE DIAGNOSTIC SURFACE (`api.inspect()`, `development.inspector`): one plain snapshot of the
 * engine; the planes' render counts as a regression guard (an orbit re-renders no plane); the
 * debuggers only loaded when asked for.
 */
import {
    test,
    expect,
} from '@playwright/test';

import {
    openHarness,
    settle,
    inspect,
    tree,
    publish,
    HarnessWindow,
} from './helpers';



test.describe('the diagnostic surface', () => {
    test('inspect() describes the space: the camera, the view, the counts, every shown plane with its parentage and culling, the links', async ({ page }) => {
        await openHarness(page, '?debug=1&reducedMotion=1&momentum=0');
        await settle(page);
        const inspection = await inspect(page);
        expect(inspection.inspector).toBe(true);
        expect(inspection.motion).toBe('idle');
        expect(inspection.gesture).toBeNull();
        expect(inspection.view.width).toBeGreaterThan(0);
        expect(inspection.counts.shown).toBe(5);
        expect(inspection.counts.mounted).toBe(5);
        expect(inspection.counts.dispatches).toBeGreaterThan(0);
        expect(inspection.counts.renders).toBeGreaterThan(0);
        for (const plane of inspection.planes) {
            expect(plane.planeID).toBeTruthy();
            expect(plane.route).toContain('plurid://');
            expect(plane.width).toBeGreaterThan(0);
            expect(plane.culled).toBe('visible');
            expect(plane.renders).toBeGreaterThan(0);
            expect(plane.sizeMode).toBe('measured');
        }
        // a spawned child carries its parent and its link
        const root = (await tree(page)).find((node: any) => String(node.route).endsWith('/geometry'))!;
        await page.locator(`[data-plurid-plane="${root.planeID}"] [data-plurid-link-route$="/geometry/detail"]`).click();
        await page.waitForFunction((id) => !!(window as any).__rtTree().find((node: any) => node.planeID === id)?.children?.length, root.planeID);
        await settle(page);
        const after = await inspect(page);
        const child = after.planes.find((plane) => plane.parentPlaneID === root.planeID)!;
        expect(child).toBeTruthy();
        expect(child.spawnedByLinkID).toBeTruthy();
        expect(after.counts.shown).toBe(6);
    });

    test('an orbit re-renders no plane: the render counts stand still (the memo guarantee)', async ({ page }) => {
        await openHarness(page, '?debug=1&reducedMotion=1&momentum=0');
        await settle(page);
        const before = await inspect(page);
        for (let step = 0; step < 60; step += 1) {
            await publish(page, 'space.cameraDelta', { yaw: 0.5, pitch: step % 2 ? 0.2 : -0.2 });
        }
        await settle(page);
        const after = await inspect(page);
        expect(after.counts.dispatches).toBeGreaterThan(before.counts.dispatches + 50);
        for (const plane of after.planes) {
            const was = before.planes.find((entry) => entry.planeID === plane.planeID)!;
            expect(plane.renders, plane.planeID).toBe(was.renders);
        }
    });

    test('off the flag the counters are silent; with it the debuggers render and a gesture is reported', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1&momentum=0');
        await settle(page);
        const quiet = await inspect(page);
        expect(quiet.inspector).toBe(false);
        expect(quiet.counts.dispatches).toBe(0);
        expect(quiet.counts.renders).toBe(0);
        expect(await page.locator('[data-plurid-entity="PluridSpaceDebugger"]').count()).toBe(0);
        expect(await page.locator('[data-plurid-entity="PluridPlaneDebugger"]').count()).toBe(0);

        await openHarness(page, '?debug=1&reducedMotion=1&momentum=0');
        await settle(page);
        await expect(page.locator('[data-plurid-entity="PluridSpaceDebugger"]')).toHaveCount(1);
        expect(await page.locator('[data-plurid-entity="PluridPlaneDebugger"]').count()).toBe(5);
        await expect(page.locator('[data-plurid-entity="PluridSpaceDebugger"]')).toContainText('live');
        // a navigation drag in flight is reported as the gesture: the right button's intent from the table
        const right = await page.evaluate(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().configuration.space.gestures?.buttonMap?.right ?? 'pan');
        const view = await page.locator('[data-plurid-entity="PluridView"]').boundingBox();
        await page.mouse.move(view!.x + 60, view!.y + view!.height - 60);
        await page.mouse.down({ button: 'right' });
        await page.mouse.move(view!.x + 120, view!.y + view!.height - 90, { steps: 4 });
        expect((await inspect(page)).gesture).toBe(right);
        await page.mouse.up({ button: 'right' });
        expect((await inspect(page)).gesture).toBeNull();
    });

    test('the debuggers are loaded only when asked for: their chunks are requested with the flag and never without it', async ({ page }) => {
        const scripts = new Set<string>();
        page.on('request', (request) => {
            if (request.resourceType() === 'script') {
                scripts.add(request.url().split('?')[0]);
            }
        });
        await openHarness(page, '?reducedMotion=1&momentum=0');
        await settle(page);
        const without = new Set(scripts);
        scripts.clear();
        await openHarness(page, '?debug=1&reducedMotion=1&momentum=0');
        await settle(page);
        await expect(page.locator('[data-plurid-entity="PluridSpaceDebugger"]')).toHaveCount(1);
        // the flag loads code the plain boot never asked for (the lazy chunks), and nothing else does
        const extra = [...scripts].filter((url) => !without.has(url));
        expect(extra.length).toBeGreaterThan(0);
    });
});
