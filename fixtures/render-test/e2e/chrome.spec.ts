import {
    test,
    expect,
    Page,
} from '@playwright/test';

import {
    openHarness,
    openFixture,
} from './helpers';


/** The rendered sizes of the engine's chrome controls (what a host stylesheet must not change). */
const chromeSizes = (page: Page) => page.evaluate(() => {
    const size = (selector: string) => {
        const element = document.querySelector(selector) as HTMLElement | null;
        if (!element) {
            return null;
        }
        const r = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
            width: Math.round(r.width),
            height: Math.round(r.height),
            fontSize: style.fontSize,
            fontFamily: style.fontFamily,
            textTransform: style.textTransform,
            letterSpacing: style.letterSpacing,
        };
    };
    return {
        shortcuts: size('[data-plurid-control="shortcuts"]'),
        toolbar: size('[data-plurid-entity="PluridToolbar"]'),
        toolbarButton: size('[data-plurid-entity="PluridToolbar"] button'),
        viewcube: size('[data-plurid-entity="PluridViewcube"]'),
        viewcubeZone: size('[data-plurid-entity="PluridViewcube"] button'),
        planeControls: size('[data-plurid-entity="PluridPlaneControls"]'),
        planeControlButton: size('[data-plurid-entity="PluridPlaneControls"] button'),
    };
});


test.describe('chrome isolation from the host stylesheet', () => {
    // the guarantee holds for every look: geometry and type come from the tokens the engine set
    for (const look of ['graphite', 'paper']) test(`a hostile host stylesheet (form-control sizing, typography) leaves every chrome control unchanged — the ${look} look`, async ({ page }) => {
        await openHarness(page, '?reducedMotion=1&look=' + look);
        const neutral = await chromeSizes(page);
        expect(neutral.shortcuts).toBeTruthy();
        expect(neutral.viewcubeZone).toBeTruthy();
        expect(neutral.planeControlButton).toBeTruthy();

        await openHarness(page, '?reducedMotion=1&hostileCss=1&look=' + look);
        // the hostile sheet is live: a host button (outside the engine) is affected
        const hostButton = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button')).filter((b) => !b.closest('[data-plurid-entity="PluridView"]'));
            const b = buttons[0];
            return b ? Math.round(b.getBoundingClientRect().height) : null;
        });
        expect(hostButton).not.toBeNull();
        expect(hostButton!).toBeGreaterThanOrEqual(42);

        const hostile = await chromeSizes(page);
        expect(hostile).toEqual(neutral);
    });
});


test.describe('the chrome mode', () => {
    test('chrome=none renders no engine chrome at all; the planes, the keys and the topics still work', async ({ page }) => {
        await openFixture(page, 'columns-headless');
        expect(await page.locator('[data-plurid-plane]').count()).toBe(5);
        expect(await page.locator('[data-plurid-control]').count()).toBe(0);
        expect(await page.locator('[data-plurid-overlay]').count()).toBe(0);
        // a key: G arms a grab (the view says so)
        await page.locator('[data-plurid-entity="PluridView"]').focus();
        await page.keyboard.press('g');
        await expect(page.locator('[data-plurid-entity="PluridView"]')).toHaveAttribute('data-plurid-navigating', 'grab');
        await page.keyboard.press('Escape');
        await expect(page.locator('[data-plurid-entity="PluridView"]')).not.toHaveAttribute('data-plurid-navigating', 'grab');
    });

    test('chrome=minimal keeps the plane bars and the ?, drops the toolbar, the viewcube and the minimap', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1&chrome=minimal');
        expect(await page.locator('[data-plurid-control="shortcuts"]').count()).toBe(1);
        expect(await page.locator('[data-plurid-entity="PluridPlaneControls"]').count()).toBeGreaterThan(0);
        expect(await page.locator('[data-plurid-entity="PluridToolbar"]').count()).toBe(0);
        expect(await page.locator('[data-plurid-entity="PluridViewcube"]').count()).toBe(0);
        expect(await page.locator('[data-plurid-control="minimap"]').count()).toBe(0);
    });

    test('a look reaches the page as the scoped stylesheet; the plane bar slot is called with the plane', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1&look=paper&slotPlaneControls=1');
        const view = page.locator('[data-plurid-entity="PluridView"]');
        await expect(view).toHaveAttribute('data-plurid-look', 'paper');
        const scheme = await view.evaluate((element) => getComputedStyle(element).getPropertyValue('--plurid-scheme').trim());
        expect(scheme).toBe('light');
        const bars = page.locator('[data-plurid-control="rt-plane-bar"]');
        expect(await bars.count()).toBe(5);
        expect(await bars.first().getAttribute('data-rt-route')).toContain('plurid://');
        expect(await page.locator('[data-plurid-entity="PluridPlaneControls"]').count()).toBe(0);
    });
});
