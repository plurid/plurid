/**
 * THE COMMAND PALETTE (⌘/Ctrl+K): the commands that apply, the bookmarks, every plane — one list
 * over the space; a row runs what its key press runs, and the keyboard alone drives it.
 */
import {
    test,
    expect,
    Page,
} from '@playwright/test';

import AxeBuilder from '@axe-core/playwright';

import {
    openHarness,
    settle,
    tree,
    camera,
    HarnessWindow,
} from './helpers';



const PALETTE = '[data-plurid-entity="PluridPalette"]';
const ROW = '[data-plurid-control="palette-row"]';
const INPUT = '[data-plurid-control="palette-input"]';
const SELECTED = '[data-plurid-palette-selected="true"]';

const open = async (page: Page) => {
    await page.locator('[data-plurid-entity="PluridView"]').focus();
    await page.keyboard.press('ControlOrMeta+KeyK');
    await expect(page.locator(PALETTE)).toHaveCount(1);
};

test.describe('the command palette', () => {
    test('opens on the shortcut, filters as typed, and Enter runs the command', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1&momentum=0');
        await settle(page);
        expect(await page.locator(PALETTE).count()).toBe(0);

        await open(page);
        const all = await page.locator(ROW).count();
        expect(all).toBeGreaterThan(10);
        // every shown plane is a destination
        await expect(page.locator(PALETTE)).toContainText('Go to the plane /geometry');

        await page.locator(INPUT).fill('select');
        const filtered = await page.locator(ROW).count();
        expect(filtered).toBeGreaterThan(0);
        expect(filtered).toBeLessThan(all);

        await page.keyboard.press('Enter');
        await expect(page.locator(PALETTE)).toHaveCount(0);
        const selection = await page.evaluate(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().space.selectedPlaneIDs);
        expect(selection.length).toBe(5);
    });

    test('the arrows walk the rows and a plane row frames its plane; Escape closes without running', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1&momentum=0');
        await settle(page);
        const before = await camera(page);
        const topology = (await tree(page)).find((node: any) => String(node.route).endsWith('/topology'))!;

        await open(page);
        await page.locator(INPUT).fill('plane /topology');
        await expect(page.locator(ROW)).toHaveCount(1);
        await expect(page.locator(ROW + SELECTED)).toHaveCount(1);
        await page.keyboard.press('Enter');
        await settle(page);
        expect(await page.locator(PALETTE).count()).toBe(0);
        // the camera moved onto that plane
        const after = await camera(page);
        expect(after.pivot.x).not.toBeCloseTo(before.pivot.x, 1);
        expect(Math.abs(after.pivot.x - (topology.location.translateX + topology.width / 2))).toBeLessThan(200);

        // Escape closes it and nothing else changes
        await open(page);
        const still = await camera(page);
        await page.keyboard.press('Escape');
        await expect(page.locator(PALETTE)).toHaveCount(0);
        expect(await camera(page)).toEqual(still);
    });

    test('a query that matches nothing says so; the palette is a dialog with no serious accessibility violation', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1&momentum=0');
        await settle(page);
        await open(page);
        await page.locator(INPUT).fill('zzzzz');
        await expect(page.locator(ROW)).toHaveCount(0);
        await expect(page.locator(PALETTE)).toContainText('Nothing matches');

        await page.locator(INPUT).fill('');
        const results = await new AxeBuilder({ page })
            .include(PALETTE)
            // the palette's panel is a translucent, blurred surface over the space: axe reads its own
            // colour, not the composite (the same limit `a11y.spec.ts` names); the look's contrast is
            // asserted by the themes' tests, everything else is checked here
            .disableRules(['color-contrast'])
            .analyze();
        const serious = results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
        expect(serious.map((violation) => violation.id)).toEqual([]);
    });

    test('the slot replaces it; `chrome=none` renders none of it and the shortcut still moves the state', async ({ page }) => {
        await openHarness(page, '?slotPalette=1&reducedMotion=1&momentum=0');
        await settle(page);
        await page.locator('[data-plurid-entity="PluridView"]').focus();
        await page.keyboard.press('ControlOrMeta+KeyK');
        await expect(page.locator('#rt-custom-palette')).toHaveCount(1);
        expect(await page.locator(PALETTE).count()).toBe(0);

        await openHarness(page, '?chrome=none&reducedMotion=1&momentum=0');
        await settle(page);
        await page.locator('[data-plurid-entity="PluridView"]').focus();
        await page.keyboard.press('ControlOrMeta+KeyK');
        expect(await page.locator(PALETTE).count()).toBe(0);
        // the intent still lands: a host's own palette reads it
        expect(await page.evaluate(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().ui.paletteVisible)).toBe(true);
    });
});
