import {
    test,
    expect,
    Page,
} from '@playwright/test';

import {
    openHarness,
    openFixture,
    publish,
    tree,
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
        // one bar per plane, not "at least one": four missing bars used to pass this
        const planes = await page.locator('[data-plurid-plane]').count();
        expect(planes).toBeGreaterThan(1);
        expect(await page.locator('[data-plurid-entity="PluridPlaneControls"]').count()).toBe(planes);
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


/**
 * THE CHROME IS FURNITURE FOR PLANES.
 *
 * It used to turn on `view.length !== 0` alone - the DECLARATION of which roots
 * an application is showing. But closing a plane does not touch the view:
 * `setPlaneShow` hides it in the TREE and leaves it there, which is exactly
 * what lets it be reopened. So a reader who closed every plane was left with a
 * fully dressed space holding nothing - origin, toolbar, viewcube, shortcuts -
 * while the engine's own empty state stayed hidden, and the same emptiness
 * reached by a fresh load looked like a different application.
 */
test.describe('an emptied space is an empty space', () => {
    const chromePresent = (page: Page) => page.evaluate(() => ({
        toolbar: !!document.querySelector('[data-plurid-entity="PluridToolbar"]'),
        viewcube: !!document.querySelector('[data-plurid-entity="PluridViewcube"]'),
        shortcuts: !!document.querySelector('[data-plurid-control="shortcuts"]'),
        empty: !!document.querySelector('[data-plurid-entity="PluridEmpty"]'),
    }));

    test('closing every plane takes the chrome with it, and shows the empty state', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1');

        const dressed = await chromePresent(page);
        expect(dressed.toolbar).toBe(true);
        expect(dressed.viewcube).toBe(true);
        expect(dressed.empty).toBe(false);

        // hide every root, the way a product's "close" does
        const roots = await tree(page);
        for (const root of roots) {
            await publish(page, 'space.setPlaneShow', { planeID: root.planeID, show: false });
        }

        await page.waitForFunction(() => !document.querySelector('[data-plurid-entity="PluridToolbar"]'));

        const bare = await chromePresent(page);
        expect(bare.toolbar).toBe(false);
        expect(bare.viewcube).toBe(false);
        expect(bare.shortcuts).toBe(false);
        expect(bare.empty).toBe(true);
    });

    /**
     * And it comes back, because the planes were never gone. This is the half
     * that makes the first half safe: an emptied space that could not be
     * refurnished would be a worse bug than the one being fixed.
     */
    test('and bringing one back brings the chrome back with it', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1');

        const roots = await tree(page);
        for (const root of roots) {
            await publish(page, 'space.setPlaneShow', { planeID: root.planeID, show: false });
        }
        await page.waitForFunction(() => !document.querySelector('[data-plurid-entity="PluridToolbar"]'));

        await publish(page, 'space.setPlaneShow', { planeID: roots[0].planeID, show: true });
        await page.waitForFunction(() => !!document.querySelector('[data-plurid-entity="PluridToolbar"]'));

        const back = await chromePresent(page);
        expect(back.toolbar).toBe(true);
        expect(back.viewcube).toBe(true);
        expect(back.empty).toBe(false);
    });

    /**
     * One root hidden is not an empty space. The chrome must survive the
     * ordinary case, or every close of one plane among several would strip it.
     */
    test('one plane of several closed leaves the space dressed', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1');

        const roots = await tree(page);
        test.skip(roots.length < 2, 'needs a fixture with more than one root');

        await publish(page, 'space.setPlaneShow', { planeID: roots[0].planeID, show: false });
        await page.waitForFunction(
            (planeID) => !document.querySelector(`[data-plurid-plane="${planeID}"] [data-plurid-entity="PluridPlane"]`),
            roots[0].planeID,
        ).catch(() => {});

        const still = await chromePresent(page);
        expect(still.toolbar).toBe(true);
        expect(still.empty).toBe(false);
    });
});
