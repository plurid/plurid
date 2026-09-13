/**
 * THE HISTORY, as a list: every step named by what it did, the present marked, a click jumping
 * several steps as one restore (`history.goTo`).
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
    rootByRoute,
    clickLink,
    waitForChildren,
    movePlane,
    HarnessWindow,
} from './helpers';



const ENTRY = '[data-plurid-control="history-entry"]';
const PRESENT = '[data-plurid-control="history-present"]';

const history = (page: Page) => page.evaluate(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().space.history);

/** Open the toolbar's More menu and its History drawer. */
const openHistory = async (page: Page) => {
    await page.locator('[data-plurid-control="toolbar-more"]').click();
    await page.locator('button', { hasText: /^history$/ }).click();
    await expect(page.locator(PRESENT)).toHaveCount(1);
};

test.describe('the arrangement history', () => {
    test('names every step by what it did, and the labels reach the state', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1&momentum=0');
        await settle(page);
        const root = rootByRoute(await tree(page), '/geometry');

        // three authoring changes: a spawn, a move, a close
        await clickLink(page, root.planeID, '/geometry/detail');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        const child = rootByRoute(await tree(page), '/geometry').children[0];
        await movePlane(page, child.planeID, 120, 40);
        await page.evaluate((id) => {
            (window as unknown as HarnessWindow).__pluridApi.pubsub.publish({ topic: 'space.closePlane', data: { planeID: id, navigate: 'stay' } } as any);
        }, child.planeID);
        await settle(page);

        const labels = (await history(page)).past.map((entry) => entry.label);
        expect(labels).toHaveLength(3);
        expect(labels[0]).toContain('/geometry/detail');
        expect(labels[1]).toContain('moved');
        expect(labels[2]).toContain('closed');
        for (const entry of (await history(page)).past) {
            expect(entry.at).toBeGreaterThan(0);
        }
    });

    test('the drawer lists the steps, marks the present, and a click jumps to that step', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1&momentum=0');
        await settle(page);
        const roots = await tree(page);
        // three closes: three steps
        for (const route of ['/topology', '/material', '/tessellation']) {
            const plane = rootByRoute(roots, route);
            await page.evaluate((id) => {
                (window as unknown as HarnessWindow).__pluridApi.pubsub.publish({ topic: 'space.closePlane', data: { planeID: id, navigate: 'stay' } } as any);
            }, plane.planeID);
            await settle(page);
        }
        const shown = async () => (await tree(page)).filter((node: any) => node.show !== false).length;
        expect(await shown()).toBe(2);

        await openHistory(page);
        await expect(page.locator(ENTRY)).toHaveCount(3);
        await expect(page.locator(ENTRY).first()).toContainText('closed');

        // the oldest step is three undos away: one click, one restore, every plane back
        await page.locator(`${ENTRY}[data-plurid-history-index="-3"]`).click();
        await settle(page);
        expect(await shown()).toBe(5);
        const after = await history(page);
        expect(after.past).toHaveLength(0);
        expect(after.future).toHaveLength(3);

        // the steps ahead are listed above the present, and one takes us forward again
        await expect(page.locator(`${ENTRY}[data-plurid-history-index="3"]`)).toHaveCount(1);
        await page.locator(`${ENTRY}[data-plurid-history-index="3"]`).click();
        await settle(page);
        expect(await shown()).toBe(2);
    });
});
