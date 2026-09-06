/**
 * The access contracts the 2026-09-06 critique found broken (U01 – U04): keyboard reach of the settings
 * drawers, no overlapping controls on a narrow viewport, the docked page as the only reading scope,
 * and links with a real destination.
 */
import {
    test,
    expect,
} from '@playwright/test';

import {
    openHarness,
    openFixture,
    settle,
    HarnessWindow,
} from './helpers';



test.describe('access', () => {
    test('the settings drawers are reachable by keyboard: native disclosure buttons with their state (U01)', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1');
        const buttons = page.locator('[data-plurid-entity="PluridToolbar"] button');
        await buttons.last().click();
        const headings = page.locator('[data-plurid-control="toolbar-menu"] button[aria-expanded]');
        expect(await headings.count()).toBeGreaterThanOrEqual(8);
        await headings.first().focus();
        await expect(headings.first()).toBeFocused();
        await expect(headings.first()).toHaveAttribute('aria-expanded', /true|false/);
        const before = await headings.first().getAttribute('aria-expanded');
        await page.keyboard.press('Enter');
        await expect(headings.first()).toHaveAttribute('aria-expanded', before === 'true' ? 'false' : 'true');
        // Tab walks from one heading to the next (or into an open drawer), never past the menu to the cube
        await page.keyboard.press('Tab');
        const focused = await page.evaluate(() => document.activeElement?.closest('[data-plurid-control="toolbar-menu"]') !== null);
        expect(focused).toBe(true);
    });

    test('at 390 px the rail and the ? never sit under the toolbar (U02)', async ({ browser }) => {
        const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
        const page = await context.newPage();
        try {
            await openFixture(page, 'page-docked');
            await page.keyboard.press('KeyG');
            await settle(page);
            const toolbar = await page.locator('[data-plurid-entity="PluridToolbar"] > div').first().boundingBox();
            const rail = await page.locator('[data-plurid-rail]').boundingBox();
            const trigger = await page.locator('[data-plurid-control="shortcuts"]').boundingBox();
            expect(toolbar && rail && trigger).toBeTruthy();
            const overlaps = (a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) =>
                a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
            expect(overlaps(toolbar!, rail!)).toBe(false);
            expect(overlaps(toolbar!, trigger!)).toBe(false);
        } finally {
            await context.close();
        }
    });

    test('docked on a spawned page, the parent page is inert; revealed, it is not (U03)', async ({ page }) => {
        await openFixture(page, 'page-spawned');
        const parent = page.locator('[data-plurid-plane]').first();
        const docked = page.locator('[data-plurid-page="docked"]');
        await expect(docked).toHaveCount(1);
        expect(await parent.getAttribute('data-plurid-page')).toBeNull();
        await expect(parent).toHaveAttribute('inert', '');
        await expect(docked).not.toHaveAttribute('inert', '');
        await page.keyboard.press('KeyG');
        await settle(page);
        await expect(parent).not.toHaveAttribute('inert', '');
    });

    test('a plurid link is a real link: an anchor with an href and a name (U04)', async ({ page }) => {
        await openFixture(page, 'page-docked');
        const link = page.locator('[data-plurid-entity="PluridLink"]').first();
        await expect(link).toHaveAttribute('href', /\/page-1\/(about|contact)$/);
        const name = await link.evaluate((element) => element.textContent?.trim());
        expect(name).toBeTruthy();
    });

    test('on a small screen the viewcube stays clear of the minimap and the toolbar', async ({ browser }) => {
        const context = await browser.newContext({ viewport: { width: 440, height: 956 }, hasTouch: true, isMobile: true });
        const page = await context.newPage();
        try {
            await openFixture(page, 'columns');
            const cube = await page.locator('[data-plurid-entity="PluridViewcube"]').boundingBox();
            const minimap = await page.locator('[data-plurid-control="minimap"]').boundingBox();
            const toolbar = await page.locator('[data-plurid-entity="PluridToolbar"] > div').first().boundingBox();
            expect(cube && minimap && toolbar).toBeTruthy();
            const overlaps = (a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) =>
                a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
            expect(overlaps(cube!, minimap!)).toBe(false);
            expect(overlaps(cube!, toolbar!)).toBe(false);
        } finally {
            await context.close();
        }
    });

    test('a wheel over the shortcuts dialog scrolls the dialog, never the camera', async ({ browser }) => {
        const context = await browser.newContext({ viewport: { width: 768, height: 1024 } });
        const page = await context.newPage();
        try {
            await openFixture(page, 'columns');
            await page.locator('[data-plurid-control="shortcuts"]').click();
            const panel = page.locator('[data-plurid-control="shortcuts-overlay"] [role="dialog"]');
            const box = await panel.boundingBox();
            const before = await page.evaluate(() => JSON.stringify((window as unknown as HarnessWindow).__pluridApi.getSnapshot().space.camera));
            await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
            for (let i = 0; i < 5; i += 1) {
                await page.mouse.wheel(0, 120);
                await page.waitForTimeout(40);
            }
            await settle(page);
            expect(await page.evaluate(() => JSON.stringify((window as unknown as HarnessWindow).__pluridApi.getSnapshot().space.camera))).toBe(before);
            expect(await panel.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
        } finally {
            await context.close();
        }
    });
});

