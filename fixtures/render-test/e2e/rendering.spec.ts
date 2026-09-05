import {
    test,
    expect,
    Page,
} from '@playwright/test';

import {
    openHarness,
    collectConsoleErrors,
    camera,
    spaceState,
    publish,
    viewRect,
} from './helpers';


const tree = (page: Page) => page.evaluate(() => (window as any).__rtTree());


test.describe('rendering, overlays, accessibility', () => {
    test('culling hides off-screen planes, never the selected one, and shows them again', async ({ page }) => {
        await openHarness(page, '?culling=1&reducedMotion=1&momentum=0');
        await page.waitForTimeout(250);
        const roots = await tree(page);
        const keep = roots[0];
        await page.evaluate((id) => (window as any).__pluridApi.store.dispatch({ type: 'space/setSelection', payload: [id] }), keep.planeID);
        // the planes on screen at rest (the first root is centered; far columns may legitimately be off-screen)
        const visibleAtRest: string[] = await page.evaluate(() => Array.from(document.querySelectorAll('[data-plurid-plane]'))
            .filter((node) => {
                const rect = node.getBoundingClientRect();
                return rect.right > 0 && rect.left < window.innerWidth && rect.bottom > 0 && rect.top < window.innerHeight;
            })
            .map((node) => node.getAttribute('data-plurid-plane') as string));
        expect(visibleAtRest.length).toBeGreaterThanOrEqual(2);

        // pan the whole space far off to the right: every plane leaves the (margined) view
        await publish(page, 'space.cameraDelta', { pan: { x: 6000, y: 0 } });
        await page.waitForFunction((ids) => {
            const hidden = (window as any).__pluridApi.getSnapshot().space.culled.hidden as string[];
            return ids.filter((id: string) => hidden.includes(id)).length >= ids.length - 1;
        }, visibleAtRest);
        const culled = (await spaceState(page)).culled;
        expect(culled.hidden).not.toContain(keep.planeID);
        // hidden planes stay mounted, unpainted and inert
        const hiddenID = visibleAtRest.find((id) => id !== keep.planeID && culled.hidden.includes(id)) as string;
        const element = page.locator(`[data-plurid-plane="${hiddenID}"]`);
        await expect(element).toHaveCount(1);
        await expect(element).toHaveAttribute('data-plurid-culled', 'hidden');
        expect(await element.evaluate((node) => getComputedStyle(node).visibility)).toBe('hidden');

        await publish(page, 'space.cameraDelta', { pan: { x: -6000, y: 0 } });
        await page.waitForFunction((ids) => {
            const hidden = (window as any).__pluridApi.getSnapshot().space.culled.hidden as string[];
            return ids.every((id: string) => !hidden.includes(id));
        }, visibleAtRest);
        await expect(element).not.toHaveAttribute('data-plurid-culled', 'hidden');
    });

    test('depth fade writes per-plane depth variables; the HUD renders with ?debug=1', async ({ page }) => {
        const errors = collectConsoleErrors(page);
        await openHarness(page, '?depthFade=1&debug=1&reducedMotion=1');
        await publish(page, 'space.cameraDelta', { yaw: 20 });
        await page.waitForTimeout(250);
        const fade = await page.evaluate(() => {
            const element = document.querySelector('[data-plurid-plane]') as HTMLElement;
            return {
                depth: element.style.getPropertyValue('--plurid-plane-depth'),
                fade: element.style.getPropertyValue('--plurid-plane-fade'),
            };
        });
        expect(Number(fade.depth)).toBeGreaterThan(0);
        expect(Number(fade.fade)).toBeGreaterThan(0);
        expect(Number(fade.fade)).toBeLessThanOrEqual(1);
        await expect(page.locator('[data-plurid-entity="PluridSpaceDebugger"]')).toBeVisible();
        await expect(page.locator('[data-plurid-entity="PluridSpaceDebugger"]')).toContainText('fps');
        expect(await page.locator('[data-plurid-entity="PluridPlaneDebugger"]').count()).toBeGreaterThan(0);
        expect(errors).toEqual([]);
    });

    test('a wheel over scrollable plane content only scrolls it — even at the end of its range, mouse or trackpad — while the rest of the plane zooms', async ({ page }) => {
        await openHarness(page, '?scrollable=1&momentum=0&reducedMotion=1');
        const list = page.locator('[data-rt-scrollable]').first();
        await expect(list).toBeVisible();
        const box = (await list.boundingBox())!;
        const before = await camera(page);

        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.wheel(0, 120);
        await page.waitForTimeout(100);
        expect(await list.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
        expect((await camera(page)).scale).toBeCloseTo(before.scale, 9);

        // scrolled to the end: further wheel — a mouse notch, then a trackpad-sized tick — neither
        // zooms nor pans (no scroll chaining into the camera)
        await list.evaluate((node) => { node.scrollTop = node.scrollHeight; });
        await page.mouse.wheel(0, 300);
        await page.mouse.wheel(0, 12.5);
        await page.waitForTimeout(100);
        const after = await camera(page);
        expect(after.scale).toBeCloseTo(before.scale, 9);
        expect(after.offset.x).toBeCloseTo(before.offset.x, 6);
        expect(after.offset.y).toBeCloseTo(before.offset.y, 6);

        // the same wheel over the plane's non-scrolling content zooms (after the trackpad stream
        // above has ended: a notch inside a trackpad stream counts as the trackpad)
        await page.waitForTimeout(400);
        const footer = page.locator('[data-plurid-plane$="/geometry@0"]').getByText('PLURID · SPATIAL UNIT');
        const foot = (await footer.boundingBox())!;
        await page.mouse.move(foot.x + foot.width / 2, foot.y + foot.height / 2);
        await page.mouse.wheel(0, -300);
        await page.waitForTimeout(100);
        expect((await camera(page)).scale).not.toBeCloseTo(before.scale, 3);
    });

    test('a wheel over the minimap never zooms the space; overlays sit inside the view', async ({ page }) => {
        await openHarness(page, '?momentum=0');
        const minimap = page.locator('[data-plurid-overlay="minimap"]');
        await expect(minimap).toBeVisible();
        const box = (await minimap.boundingBox())!;
        const before = await camera(page);
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.wheel(0, -300);
        await page.waitForTimeout(100);
        expect((await camera(page)).scale).toBeCloseTo(before.scale, 9);

        // the same wheel on empty space zooms
        const rect = await viewRect(page);
        await page.mouse.move(rect.left + 40, rect.top + rect.height - 160);
        await page.mouse.wheel(0, -300);
        await page.waitForTimeout(100);
        expect((await camera(page)).scale).not.toBeCloseTo(before.scale, 3);

        // overlays are positioned inside the view (no `position: fixed`)
        const positions = await page.evaluate(() => Array.from(document.querySelectorAll('[data-plurid-overlay]')).map((node) => getComputedStyle(node).position));
        expect(positions.length).toBeGreaterThan(0);
        expect(positions.every((position) => position !== 'fixed')).toBe(true);
    });

    test('the minimap is a fixed front view: opening a child moves no root dot, joins the child to its parent, and its dots frame the right plane', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1&momentum=0');
        const dotsOf = () => page.evaluate(() => Array.from(document.querySelectorAll('[data-plurid-minimap-plane]')).map((node) => {
            const rect = node.getBoundingClientRect();
            const dot = node.firstElementChild as HTMLElement;
            return {
                id: node.getAttribute('data-plurid-minimap-plane'),
                child: node.getAttribute('data-plurid-minimap-child') === 'true',
                cx: rect.left + rect.width / 2,
                cy: rect.top + rect.height / 2,
                size: dot ? dot.getBoundingClientRect().width : 0,
            };
        }));
        const rest = await dotsOf();
        expect(rest).toHaveLength(5);
        expect(new Set(rest.map((dot) => Math.round(dot.cy))).size).toBe(2);

        const geometry = (await tree(page)).find((node: any) => node.route.endsWith('/geometry'));
        await page.evaluate((planeID) => {
            (document.querySelector(`[data-plurid-plane="${planeID}"] [data-plurid-link-route$="/geometry/detail"]`) as HTMLElement).click();
        }, geometry.planeID);
        await page.waitForFunction(() => document.querySelectorAll('[data-plurid-minimap-plane]').length === 6);
        await page.waitForFunction(() => (window as any).__pluridApi.getSnapshot().space.motion === 'idle');

        const opened = await dotsOf();
        for (const dot of rest) {
            const after = opened.find((candidate) => candidate.id === dot.id)!;
            expect(Math.hypot(after.cx - dot.cx, after.cy - dot.cy)).toBeLessThan(1);
        }
        const child = opened.find((dot) => dot.child)!;
        const parent = opened.find((dot) => dot.id === geometry.planeID)!;
        expect(child.size).toBeLessThan(parent.size);
        expect(await page.locator('[data-plurid-minimap-link]').count()).toBe(1);
        const centers = opened.map((dot) => Math.round(dot.cx) + ':' + Math.round(dot.cy));
        expect(new Set(centers).size).toBe(centers.length);

        // the ring stays inside the map
        const inside = await page.evaluate(() => {
            const map = document.querySelector('[data-plurid-overlay="minimap"]')!.getBoundingClientRect();
            const eye = document.querySelector('[data-plurid-minimap-eye]')!.getBoundingClientRect();
            return eye.left >= map.left && eye.right <= map.right && eye.top >= map.top && eye.bottom <= map.bottom;
        });
        expect(inside).toBe(true);

        // the geometry dot frames GEOMETRY (the camera was on the child)
        await page.locator(`[data-plurid-minimap-plane="${geometry.planeID}"]`).click();
        await page.waitForFunction(() => (window as any).__pluridApi.getSnapshot().space.motion === 'idle');
        const state = await spaceState(page);
        expect(state.activePlaneID).toBe(geometry.planeID);
        expect(Math.abs(state.camera.pivot.x - (geometry.location.translateX + geometry.width / 2))).toBeLessThan(2);
        expect(Math.abs(state.camera.pivot.y - (geometry.location.translateY + geometry.height / 2))).toBeLessThan(2);
    });

    test('engine controls are reachable by Tab with a visible focus ring; the view is an application with a live region', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1');
        await expect(page.locator('[data-plurid-entity="PluridView"]')).toHaveAttribute('role', 'application');
        await expect(page.locator('[data-plurid-entity="PluridLiveRegion"]')).toHaveAttribute('aria-live', 'polite');

        const rect = await viewRect(page);
        await page.mouse.click(rect.left + 40, rect.top + rect.height - 160);
        const reached = new Set<string>();
        for (let index = 0; index < 60; index += 1) {
            await page.keyboard.press('Tab');
            const info = await page.evaluate(() => {
                const active = document.activeElement as HTMLElement | null;
                if (!active) {
                    return null;
                }
                const control = active.closest('[data-plurid-control]')?.getAttribute('data-plurid-control') || null;
                const style = getComputedStyle(active);
                return {
                    control,
                    tag: active.tagName,
                    label: active.getAttribute('aria-label'),
                    outline: style.outlineStyle,
                };
            });
            if (info?.control && info.tag === 'BUTTON') {
                reached.add(info.control);
                expect(info.label || '').not.toBe('');
                expect(info.outline).not.toBe('none');
            }
        }
        expect(Array.from(reached)).toEqual(expect.arrayContaining([
            'toolbar-button',
            'viewcube-fit',
            'minimap-plane',
            'plane-focus',
        ]));
    });

    test('a hand-frozen plane is contained but still painted', async ({ page }) => {
        await openHarness(page, '?culling=1&freezeDistance=2100&reducedMotion=1&momentum=0');
        // dolly the pivot away from the eye so every plane sits beyond the freeze distance
        await publish(page, 'space.cameraDelta', { dolly: -900 });
        await page.waitForFunction(() => (window as any).__pluridApi.getSnapshot().space.culled.frozen.length > 0);
        const frozenID = (await spaceState(page)).culled.frozen[0];
        const element = page.locator(`[data-plurid-plane="${frozenID}"]`);
        await expect(element).toHaveAttribute('data-plurid-culled', 'frozen');
        expect(await element.evaluate((node) => getComputedStyle(node).visibility)).toBe('visible');
    });
});
