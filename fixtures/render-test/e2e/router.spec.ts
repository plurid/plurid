import { test, expect, Page } from '@playwright/test';

import {
    publish,
    spaceState,
    tree,
    findPlane,
    waitForState,
    settle,
} from './helpers';


/**
 * THE ROUTER PEER (ENGINE_PRODUCT_FUSION.md, section 6): what works in the direct embed must work
 * in the route-driven mount, or it is a seam bug by definition. The cases that once failed there:
 * a second root opens; a render slot takes effect; an arrangement persists and restores; a spawned
 * plane is addressable without the DOM; a plane put away and shown again answers its token.
 */
const openRouterSpace = async (
    page: Page,
) => {
    await page.goto('/space?router=1&reducedMotion=1');
    await page.waitForFunction(() => typeof (window as any).__rtCamera === 'function');
    await page.waitForFunction(() => (window as any).__rtTree().length > 0 && (window as any).__rtTree().every((node: any) => node.width > 0));
};

/** The token's answer on `space.changed` kind `plane`: the plane id it became, page-side. */
const spawnWithToken = (
    page: Page,
    data: Record<string, unknown>,
    token: string,
) => page.evaluate(({ data, token }) => new Promise<string>((resolve, reject) => {
    const api = (window as any).__pluridApi;
    const timer = setTimeout(() => reject(new Error('no answer for token ' + token)), 4000);
    api.pubsub.subscribe({
        topic: 'space.changed',
        callback: (change: any) => {
            if (change?.kind === 'plane' && change?.value?.token === token) {
                clearTimeout(timer);
                resolve(change.value.planeID);
            }
        },
    });
    api.pubsub.publish({ topic: 'space.spawnPlane', data: { ...data, token } });
}), { data, token });


test.describe('the router peer', () => {
    test('a second root opens through the bus, and a host\'s render slot takes effect', async ({ page }) => {
        await openRouterSpace(page);
        expect(await tree(page)).toHaveLength(1);
        // the provider's slot is the route's application's chrome
        await expect(page.locator('[data-plurid-overlay="host-toolbar"]')).toHaveCount(1);
        expect(await page.locator('[data-plurid-overlay="host-toolbar"]').getAttribute('data-look')).toBeTruthy();

        await publish(page, 'view.setPlanes', { view: ['/demo', '/second'] });
        await waitForState(page, (state) => state.space.tree.length === 2, 'the second root to open');
        expect(await page.locator('[data-plurid-plane]').count()).toBe(2);
        expect((await spaceState(page)).view).toEqual(['/demo', '/second']);
    });

    test('a spawned plane is addressable without the DOM, and a plane put away and shown again answers its token too', async ({ page }) => {
        await openRouterSpace(page);
        const [demo] = await tree(page);

        const child = await spawnWithToken(page, { route: '/demo/detail', parentPlaneID: demo.planeID }, 'first');
        expect(child).toBeTruthy();
        const spawned = findPlane(await tree(page), child);
        expect(spawned.parentPlaneID).toBe(demo.planeID);
        expect(String(spawned.route)).toContain('/demo/detail');
        // and it can be framed by that id alone
        await publish(page, 'space.frame', { planeID: child, animate: false });
        await settle(page);
        expect((await spaceState(page)).activePlaneID).toBe(child);

        await publish(page, 'space.setPlaneShow', { planeID: child, show: false });
        // the predicate runs page-side: the walk is inlined
        await waitForState(page, (state, id) => {
            const walk = (nodes: any[]): any => nodes.reduce((found, node) => found || (node.planeID === id ? node : walk(node.children || [])), undefined);
            return walk(state.space.tree)?.show === false;
        }, 'the child to be put away', child);
        const again = await spawnWithToken(page, { route: '/demo/detail', parentPlaneID: demo.planeID }, 'again');
        expect(again).toBe(child);
        expect(findPlane(await tree(page), child).show).not.toBe(false);
    });

    test('an arrangement persists and restores across a reload', async ({ page }) => {
        await openRouterSpace(page);
        const [demo] = await tree(page);
        const before = demo.location.translateX;

        await publish(page, 'space.movePlanes', { planeIDs: [demo.planeID], deltaX: 240, deltaY: 0, pinned: true });
        await waitForState(page, (state, from) => Math.abs(state.space.tree[0].location.translateX - (from as number) - 240) < 1, 'the root to move', before);
        // the persistence is debounced: wait for the store to have written, never for a clock
        await page.waitForFunction(() => Object.keys(localStorage).some((key) => localStorage.getItem(key)?.includes('translateX')));

        await page.reload();
        await page.waitForFunction(() => typeof (window as any).__rtCamera === 'function');
        await waitForState(page, (state, from) => state.space.tree.length > 0 && Math.abs(state.space.tree[0].location.translateX - (from as number) - 240) < 1, 'the moved root to come back where it was', before);
        expect((await tree(page))[0].manuallyPositioned).toBe(true);
    });
});
