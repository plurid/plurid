/**
 * A plane of the SPACE presentation read as a page (2026-09-06): the rail's page pill docks the active or
 * nearest plane at its fill scale, the chrome hides and the wheel is the plane's; Escape and the cube pill
 * reveal the space again.
 */
import {
    test,
    expect,
} from '@playwright/test';

import {
    openFixture,
    settle,
    dockedID,
    visibleChrome,
    HarnessWindow,
} from './helpers';



test.describe('a plane read as a page', () => {
    test('the rail docks the nearest plane at its fill scale; Escape reveals the space', async ({ page }) => {
        await openFixture(page, 'columns');
        await expect(page.locator('[data-plurid-rail]')).toHaveCount(1);
        expect(await dockedID(page)).toBeNull();

        await page.locator('[data-plurid-control="dock-toggle"]').click();
        await settle(page);
        const docked = await dockedID(page);
        expect(docked).toBeTruthy();
        const plane = page.locator(`[data-plurid-plane="${docked}"]`);
        await expect(plane).toHaveAttribute('data-plurid-page', 'docked');
        // the plane fills the view along its tighter dimension
        const viewport = page.viewportSize()!;
        const box = await plane.boundingBox();
        const fills = Math.abs(box!.height - viewport.height) < 2 || Math.abs(box!.width - viewport.width) < 2;
        expect(fills).toBe(true);
        expect(await visibleChrome(page)).toEqual([]);
        // the other planes are outside the reading scope
        const others = page.locator('[data-plurid-plane]:not([data-plurid-page="docked"])');
        expect(await others.count()).toBeGreaterThan(0);
        await expect(others.first()).toHaveAttribute('inert', '');

        await page.keyboard.press('Escape');
        await settle(page);
        expect(await dockedID(page)).toBeNull();
        expect((await visibleChrome(page)).length).toBeGreaterThan(0);
        expect((await page.evaluate(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().space.camera.scale))).toBeLessThan(1.5);
    });

    test('the cube pill reveals; the page pill docks the SELECTED plane', async ({ page }) => {
        await openFixture(page, 'columns');
        // select MATERIAL: the selected plane is the deliberate choice the page pill reads
        const material = await page.evaluate(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().space.tree.map((node: { planeID: string }) => node.planeID).find((id: string) => /material@2$/.test(id)));
        expect(material).toBeTruthy();
        await page.evaluate((id) => { (window as unknown as HarnessWindow).__pluridApi.store.dispatch({ type: 'space/setSelection', payload: [id] }); }, material);
        await page.locator('[data-plurid-control="dock-toggle"]').click();
        await settle(page);
        expect(await dockedID(page)).toMatch(/material@2$/);
        await page.locator('[data-plurid-control="dock-toggle"]').click();
        await settle(page);
        expect(await dockedID(page)).toBeNull();
    });
});
