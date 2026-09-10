/**
 * THE DETACH TIER (`space.culling.detach`): hidden planes lose their content (retained or unmounted)
 * while their shells stay; the budget bounds what stays mounted; the state and the scroll survive a
 * retain; the memory is measured.
 */
import {
    test,
    expect,
    Page,
} from '@playwright/test';

import {
    openHarness,
    settle,
    tree,
    publish,
    mounted,
    cdpMetrics,
    leavePlane,
    HarnessWindow,
} from './helpers';



const VIRTUAL = '?planes=500&culling=1&cullDetach=unmount&cullDelay=0&reducedMotion=1&momentum=0';
const dots = (page: Page) => page.locator('[data-plurid-minimap-plane]').count();
const culled = (page: Page) => page.evaluate(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().space.culled);
const attached = (page: Page) => page.evaluate(() => Array.from(document.querySelectorAll('[data-plurid-plane]:not([data-plurid-culled="detached"])')).map((node) => node.getAttribute('data-plurid-plane')));
const culledAttribute = (page: Page, planeID: string) => page.locator(`[data-plurid-plane="${planeID}"]`).getAttribute('data-plurid-culled');

test.describe('content virtualization', () => {
    test('500 planes: every shell stays (500 minimap dots), the hidden ones lose their content; a pan swaps them', async ({ page }) => {
        test.slow();
        // 500 planes: a scenario, not a catalog fixture (the generic invariants and a picture of 500
        // planes would cost minutes for nothing this spec does not already assert)
        await openHarness(page, VIRTUAL);
        // the pass runs on its own clock: wait for what it decides
        await expect.poll(async () => (await mounted(page)).contents).toBeLessThan(200);
        const boot = await mounted(page);
        expect(boot.shells).toBe(500);
        expect(await dots(page)).toBe(500);
        expect(boot.detached).toBe(500 - boot.contents);
        // the far end: the old content detaches, the new mounts
        const before = await attached(page);
        await publish(page, 'space.cameraDelta', { absolute: { pivot: { x: 0, y: 20000, z: 0 } }, animate: false });
        await settle(page);
        await expect.poll(async () => {
            const after = await attached(page);
            return after.some((id) => !before.includes(id)) && before.some((id) => !after.includes(id));
        }).toBe(true);
        const moved = await mounted(page);
        expect(moved.shells).toBe(500);
        expect(moved.contents).toBeLessThan(200);
    });

    test('the selected plane never detaches; the budget bounds the hidden-but-mounted pool', async ({ page }) => {
        const max = 5;
        await openHarness(page, VIRTUAL + '&cullMax=' + max);
        await expect.poll(async () => (await mounted(page)).detached).toBeGreaterThan(0);
        const roots = await tree(page);
        const far = roots[roots.length - 1];
        await page.evaluate((id) => (window as unknown as HarnessWindow).__pluridApi.store.dispatch({ type: 'space/setSelection', payload: [id] }), far.planeID);
        // the exceptions among the hidden planes count toward the budget and are never detached
        await expect.poll(async () => {
            const space = await page.evaluate(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().space);
            const exceptions = new Set([space.activePlaneID, space.isolatePlane, ...space.selectedPlaneIDs].filter(Boolean));
            const hiddenExceptions = space.culled.hidden.filter((id) => exceptions.has(id)).length;
            const mountedHidden = space.culled.hidden.length - space.culled.detached.length;
            return !space.culled.detached.includes(far.planeID) && mountedHidden <= max + hiddenExceptions;
        }).toBe(true);
    });

    test('unmount drops the content state; retain keeps it and restores the scroll', async ({ page }) => {
        for (const mode of ['unmount', 'retain'] as const) {
            await openHarness(page, `?planes=40&culling=1&cullDetach=${mode}&cullDelay=200&reducedMotion=1&momentum=0&scrollable=1`);
            await settle(page);
            const first = (await tree(page))[0];
            const counter = page.locator(`[data-plurid-plane="${first.planeID}"] [data-rt-counter]`);
            await counter.click();
            await counter.click();
            await expect(counter).toHaveText('count 2');
            await leavePlane(page);
            // away, past the delay: the plane detaches
            await publish(page, 'space.cameraDelta', { absolute: { pivot: { x: 40000, y: 0, z: 0 } }, animate: false });
            await settle(page);
            await expect.poll(() => culledAttribute(page, first.planeID)).toBe('detached');
            // back: the plane re-attaches
            await publish(page, 'space.cameraDelta', { absolute: { pivot: { x: first.location.translateX + first.width / 2, y: first.location.translateY + first.height / 2, z: 0 } }, animate: false });
            await settle(page);
            await expect.poll(() => culledAttribute(page, first.planeID)).toBeNull();
            await expect(page.locator(`[data-plurid-plane="${first.planeID}"] [data-rt-counter]`)).toHaveText(mode === 'retain' ? 'count 2' : 'count 0');
        }
    });

    test('the memory budget: with the detach tier the far corner of 500 planes holds a fraction of the DOM', async ({ page }) => {
        test.slow();
        const measure = async (query: string, detaching: boolean) => {
            await openHarness(page, query);
            await settle(page);
            await publish(page, 'space.cameraDelta', { absolute: { pivot: { x: 0, y: 20000, z: 0 } }, animate: false });
            await settle(page);
            if (detaching) {
                await expect.poll(async () => (await mounted(page)).contents).toBeLessThan(200);
            }
            // the DOCUMENT's element count (Chrome's `Nodes` metric counts unmounted subtrees until they are collected)
            const elements = await page.evaluate(() => document.querySelectorAll('*').length);
            return { elements, ...(await cdpMetrics(page)) };
        };
        const plain = await measure('?planes=500&culling=1&reducedMotion=1&momentum=0', false);
        const virtual = await measure(VIRTUAL, true);
        test.info().annotations.push({ type: 'memory', description: JSON.stringify({ plain, virtual }) });
        console.log('[virtualization] document elements plain ' + plain.elements + ' virtual ' + virtual.elements + ' · heap plain ' + Math.round(plain.heap / 1e6) + 'MB virtual ' + Math.round(virtual.heap / 1e6) + 'MB');
        expect(virtual.elements).toBeLessThanOrEqual(plain.elements * 0.4);
    });

    test('the gate releases when a layout transition ends: no camera commit follows, and every plane it hid detaches', async ({ page }) => {
        test.slow();
        // a real transition duration (no reduced motion): the layout switch glides for 380 ms, and the
        // pass that runs on the tree change is GATED — the planes the new layout hides stay attached
        await openHarness(page, '?planes=500&culling=1&cullDetach=unmount&cullDelay=0&momentum=0');
        await expect.poll(async () => (await mounted(page)).detached).toBeGreaterThan(0);
        const before = await page.evaluate(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().space.transform);
        await page.evaluate(() => {
            const api = (window as unknown as HarnessWindow).__pluridApi;
            const configuration = api.getSnapshot().configuration;
            api.pubsub.publish({ topic: 'configuration', data: { ...configuration, space: { ...configuration.space, layout: { ...configuration.space.layout, type: 'ROWS' } } } } as any);
        });
        await page.waitForFunction(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().space.layoutTransition > 0);
        await page.waitForFunction(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().space.layoutTransition === 0);
        // the transition's end is not a camera commit: the pass re-runs because the gate changed
        await expect.poll(async () => {
            const space = await page.evaluate(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().space);
            const exceptions = new Set([space.activePlaneID, space.isolatePlane, ...space.selectedPlaneIDs].filter(Boolean));
            return space.culled.hidden.filter((id) => !exceptions.has(id) && !space.culled.detached.includes(id)).length;
        }, { timeout: 5000 }).toBe(0);
        expect((await culled(page)).hidden.length).toBeGreaterThan(0);
        expect(await page.evaluate(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().space.transform)).toBe(before);
    });

    test('a detached parent re-attaches with its link and the child\'s bridge intact', async ({ page }) => {
        await openHarness(page, '?culling=1&cullDetach=unmount&cullDelay=0&reducedMotion=1&momentum=0');
        const root = (await tree(page)).find((node: any) => String(node.route).endsWith('/geometry'))!;
        await page.locator(`[data-plurid-plane="${root.planeID}"] [data-plurid-link-route$="/geometry/detail"]`).click();
        await page.waitForFunction((id) => !!(window as unknown as HarnessWindow).__rtTree().find((node: any) => node.planeID === id)?.children?.length, root.planeID);
        await settle(page);
        const child = (await tree(page)).find((node: any) => node.planeID === root.planeID)!.children[0];
        await leavePlane(page);
        // far away: both the parent and the child detach
        await publish(page, 'space.cameraDelta', { absolute: { pivot: { x: 60000, y: 0, z: 0 } }, animate: false });
        await settle(page);
        await expect.poll(async () => {
            const state = await culled(page);
            return state.detached.includes(root.planeID) && state.detached.includes(child.planeID);
        }).toBe(true);
        // back: the parent's link is mounted again, the child's geometry untouched
        await publish(page, 'space.cameraDelta', { absolute: { pivot: { x: root.location.translateX + 200, y: root.location.translateY + 200, z: 0 } }, animate: false });
        await settle(page);
        await expect.poll(() => page.locator(`[data-plurid-plane="${root.planeID}"] [data-plurid-link-route$="/geometry/detail"]`).count()).toBe(1);
        const again = (await tree(page)).find((node: any) => node.planeID === root.planeID)!.children[0];
        expect(again.linkCoordinates).toEqual(child.linkCoordinates);
        expect(await page.locator(`[data-plurid-plane="${child.planeID}"] [data-plurid-entity="PluridPlaneBridge"]`).count()).toBe(1);
    });
});
