import { test, expect, type Page } from '@playwright/test';
import { afterFrames, camera, openHarness, pinch, publish, settle, viewRect } from './helpers';

const query = '?scrollable=1&wheel=click-to-scroll&momentum=0&reducedMotion=1';
const scroller = (page: Page) => page.locator('[data-rt-scrollable]').first();
const geometry = (page: Page) => page.locator('[data-plurid-plane$="/geometry@0"]');
const scrollTop = (page: Page) => scroller(page).evaluate((node) => node.scrollTop);
const hoverScroller = async (page: Page) => {
    const box = (await scroller(page).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
};
const background = async (page: Page) => {
    const rect = await viewRect(page);
    return { x: rect.left + 40, y: rect.top + rect.height - 160 };
};

test.describe('click-to-scroll wheel ownership', () => {
    test('hover navigates; a primary click enables native scrolling and contains the boundary', async ({ page }) => {
        await openHarness(page, query);
        const before = await camera(page);
        await hoverScroller(page);
        await page.mouse.wheel(0, 12.5);
        await expect.poll(async () => (await camera(page)).offset.y).not.toBeCloseTo(before.offset.y, 3);
        expect(await scrollTop(page)).toBe(0);
        await expect(geometry(page)).not.toHaveAttribute('data-plurid-scroll-selected');

        await scroller(page).click();
        await expect(geometry(page)).toHaveAttribute('data-plurid-scroll-selected');
        const selected = await camera(page);
        await page.mouse.wheel(0, 120);
        await expect.poll(() => scrollTop(page)).toBeGreaterThan(0);
        await scroller(page).evaluate((node) => { node.scrollTop = node.scrollHeight; });
        await page.mouse.wheel(0, 120);
        await afterFrames(page, 12);
        expect(await camera(page)).toEqual(selected);
    });

    test('Escape and background clicks release content; selection does not survive reload', async ({ page }) => {
        await openHarness(page, query + '&persist=1');
        await scroller(page).click();
        await expect(geometry(page)).toHaveAttribute('data-plurid-scroll-selected');
        await page.keyboard.press('Escape');
        await expect(geometry(page)).not.toHaveAttribute('data-plurid-scroll-selected');
        await scroller(page).click();
        const empty = await background(page);
        await page.mouse.click(empty.x, empty.y);
        await expect(geometry(page)).not.toHaveAttribute('data-plurid-scroll-selected');
        await scroller(page).click();
        await openHarness(page, query + '&persist=1');
        await expect(page.locator('[data-plurid-scroll-selected]')).toHaveCount(0);
    });

    test('a camera wheel stream continues when it crosses a previously selected plane', async ({ page }) => {
        await openHarness(page, query);
        await scroller(page).click();
        const empty = await background(page);
        await page.mouse.move(empty.x, empty.y);
        await page.mouse.wheel(0, 12.5);
        const beforeCrossing = await camera(page);
        await hoverScroller(page);
        await page.mouse.wheel(0, 12.5);
        await expect.poll(async () => (await camera(page)).offset.y).not.toBeCloseTo(beforeCrossing.offset.y, 3);
        expect(await scrollTop(page)).toBe(0);
    });

    test('a content stream crossing the background never becomes camera navigation', async ({ page }) => {
        await openHarness(page, query);
        await scroller(page).click();
        const before = await camera(page);
        await page.mouse.wheel(0, 12.5);
        await expect.poll(() => scrollTop(page)).toBeGreaterThan(0);
        const empty = await background(page);
        await page.mouse.move(empty.x, empty.y);
        await page.mouse.wheel(0, 12.5);
        await afterFrames(page, 4);
        await hoverScroller(page);
        await page.mouse.wheel(0, 12.5);
        await afterFrames(page, 4);
        expect(await camera(page)).toEqual(before);
    });

    test('pinch retains camera priority; the policy can be changed live back to hover scrolling', async ({ page }) => {
        await openHarness(page, query);
        await scroller(page).click();
        const box = (await scroller(page).boundingBox())!;
        const before = await camera(page);
        await pinch(page, { x: box.x + box.width / 2, y: box.y + box.height / 2 }, -40);
        await expect.poll(async () => (await camera(page)).scale).toBeGreaterThan(before.scale);
        expect(await scrollTop(page)).toBe(0);
        await publish(page, 'configuration', { space: { gestures: { wheel: 'plane' } } });
        await expect(page.locator('[data-plurid-scroll-selected]')).toHaveCount(0);
        const hoverCamera = await camera(page);
        await hoverScroller(page);
        await page.mouse.wheel(0, 120);
        await expect.poll(() => scrollTop(page)).toBeGreaterThan(0);
        expect(await camera(page)).toEqual(hoverCamera);
    });

    test('docking enables content without a click, and reveal retains the docked scroll owner', async ({ page }) => {
        await openHarness(page, query);
        const planeID = (await geometry(page).getAttribute('data-plurid-plane'))!;
        await publish(page, 'space.dock', { planeID });
        await settle(page);
        await expect(geometry(page)).toHaveAttribute('data-plurid-scroll-selected');
        const docked = await camera(page);
        await hoverScroller(page);
        await page.mouse.wheel(0, 120);
        await expect.poll(() => scrollTop(page)).toBeGreaterThan(0);
        expect(await camera(page)).toEqual(docked);
        await publish(page, 'space.reveal');
        await settle(page);
        await expect(geometry(page)).toHaveAttribute('data-plurid-scroll-selected');
    });

    test('native preview wheel handlers run only after selection', async ({ page }) => {
        await openHarness(page, query);
        await scroller(page).evaluate((node) => {
            node.setAttribute('data-wheel-calls', '0');
            node.addEventListener('wheel', (event) => {
                node.setAttribute('data-wheel-calls', String(Number(node.getAttribute('data-wheel-calls')) + 1));
                event.preventDefault();
                event.stopPropagation();
            }, { passive: false });
        });
        await hoverScroller(page);
        await page.mouse.wheel(0, 12.5);
        await afterFrames(page, 4);
        await expect(scroller(page)).toHaveAttribute('data-wheel-calls', '0');
        await scroller(page).click();
        const selected = await camera(page);
        await page.mouse.wheel(0, 12.5);
        await expect(scroller(page)).toHaveAttribute('data-wheel-calls', '1');
        await afterFrames(page, 4);
        expect(await camera(page)).toEqual(selected);
    });

    test('a preview outside the Plurid View keeps native scrolling without activating a plane', async ({ page }) => {
        await openHarness(page, query);
        await page.evaluate(() => {
            const preview = document.createElement('div');
            preview.id = 'rt-quick-preview';
            preview.setAttribute('role', 'dialog');
            preview.style.cssText = 'position:fixed;inset:200px 200px 200px 200px;z-index:99999;overflow:auto;background:white';
            const content = document.createElement('div');
            content.style.height = '3000px';
            preview.appendChild(content);
            document.body.appendChild(preview);
        });
        const before = await camera(page);
        await page.locator('#rt-quick-preview').hover();
        await page.mouse.wheel(0, 120);
        await expect.poll(() => page.locator('#rt-quick-preview').evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
        expect(await camera(page)).toEqual(before);
        await expect(page.locator('[data-plurid-scroll-selected]')).toHaveCount(0);
    });

});
