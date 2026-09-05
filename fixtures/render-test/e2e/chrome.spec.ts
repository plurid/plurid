import {
    test,
    expect,
    Page,
} from '@playwright/test';

import {
    openHarness,
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
    test('a hostile host stylesheet (form-control sizing, typography) leaves every chrome control unchanged', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1');
        const neutral = await chromeSizes(page);
        expect(neutral.shortcuts).toBeTruthy();
        expect(neutral.viewcubeZone).toBeTruthy();
        expect(neutral.planeControlButton).toBeTruthy();

        await openHarness(page, '?reducedMotion=1&hostileCss=1');
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
