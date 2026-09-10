/**
 * THE ADDRESS BAR IS THE PAGE (`space.docking.url`, on by default in the page presentation): the docked
 * page's path in the location, one history entry per page, Back / Forward docking pages, a deep link
 * booting docked on its page, the viewpoint and the persisted camera reconciled.
 */
import {
    test,
    expect,
} from '@playwright/test';

import {
    openFixture,
    openPath,
    settle,
    dockedID,
    pathname,
    historyLength,
    recordDockedFrames,
    historyDocked,
    visibleChrome,
    tree,
    clickLink,
    waitForChildren,
    planeRect,
    viewRect,
    expectFills,
    HarnessWindow,
} from './helpers';



const SWING = { reducedMotion: '0', motionMs: '300' };

test.describe('the address bar is the page', () => {
    test('boot: the entry is rewritten to the page (no entry added), the fixture query kept, the entry records the page', async ({ page }) => {
        const before = await historyLength(page);
        await openFixture(page, 'page-docked');
        const root = (await tree(page))[0];
        expect(await pathname(page)).toBe('/page-1');
        expect(page.url()).toContain('fixture=page-docked');
        expect(await historyDocked(page)).toBe(root.planeID);
        expect(await historyLength(page)).toBe(before + 1); // the navigation's entry, replaced by the boot, never pushed
    });

    test('a link click pushes the child; Back docks the parent with a swing and pushes nothing; Forward docks the child', async ({ page }) => {
        await openFixture(page, 'page-docked', { extra: SWING });
        const root = (await tree(page))[0];
        const before = await historyLength(page);
        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        const about = (await tree(page))[0].children![0];
        expect(await dockedID(page)).toBe(about.planeID);
        expect(await pathname(page)).toBe('/page-1/about');
        expect(await historyLength(page)).toBe(before + 1);
        expect(await historyDocked(page)).toBe(about.planeID);

        await page.goBack();
        await settle(page);
        expect(await pathname(page)).toBe('/page-1');
        expect(await dockedID(page)).toBe(root.planeID);
        expect(await historyLength(page)).toBe(before + 1);
        expect(await visibleChrome(page)).toEqual([]);

        await page.goForward();
        await settle(page);
        expect(await pathname(page)).toBe('/page-1/about');
        expect(await dockedID(page)).toBe(about.planeID);
    });

    test('a deep link to a sub-page boots docked on it, spawned behind the site, filling the view, the chrome hidden', async ({ page }) => {
        await openPath(page, '/page-1/about', 'page-docked');
        const root = (await tree(page))[0];
        const about = root.children?.[0];
        expect(about).toBeTruthy();
        expect(about!.parentPlaneID).toBe(root.planeID);
        expect(await dockedID(page)).toBe(about!.planeID);
        expect(await pathname(page)).toBe('/page-1/about');
        expectFills(await planeRect(page, about!.planeID), await viewRect(page));
        expect(await visibleChrome(page)).toEqual([]);
        // the parent is one Escape away, as after a click
        await page.keyboard.press('Escape');
        await settle(page);
        expect(await dockedID(page)).toBe(root.planeID);
        expect(await pathname(page)).toBe('/page-1');
    });

    test('the reveal keeps the path; Escape docks back and adds no entry', async ({ page }) => {
        await openFixture(page, 'page-docked');
        const before = await historyLength(page);
        await page.keyboard.press('KeyG');
        await settle(page);
        expect(await dockedID(page)).toBeNull();
        expect(await pathname(page)).toBe('/page-1');
        await page.keyboard.press('Escape');
        await settle(page);
        expect(await dockedID(page)).toBeTruthy();
        expect(await historyLength(page)).toBe(before);
    });

    test('?v= and the path coexist: after a click the URL carries both, and a reload lands on the child', async ({ page }) => {
        await openFixture(page, 'page-docked', { extra: { vpURL: '1' } });
        const root = (await tree(page))[0];
        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        await page.waitForTimeout(600); // the viewpoint's debounced write
        expect(await pathname(page)).toBe('/page-1/about');
        expect(new URL(page.url()).searchParams.get('v')).toBeTruthy();
        await page.reload();
        await settle(page);
        expect(await pathname(page)).toBe('/page-1/about');
        const docked = await dockedID(page);
        expect(docked).toMatch(/page-1\/about/);
    });

    test('a persisted camera and a different path: the path wins, the persisted tree keeps the child', async ({ page }) => {
        await openFixture(page, 'page-docked', { extra: { persist: '1', persistMs: '50' } });
        const root = (await tree(page))[0];
        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        await page.waitForTimeout(200);
        // the same site at the ROOT's path: the persisted camera says about, the path says the site
        await openPath(page, '/page-1', 'page-docked', { persist: '1', persistMs: '50' });
        const restored = (await tree(page))[0];
        expect(restored.children?.length).toBe(1);
        expect(await dockedID(page)).toBe(restored.planeID);
        expect(await pathname(page)).toBe('/page-1');
    });

    test('the space presentation: off by default; with url=1 the rail docks GEOMETRY and the path is /geometry', async ({ page }) => {
        await openFixture(page, 'columns');
        expect(await pathname(page)).toBe('/');
        await openFixture(page, 'columns', { extra: { url: '1' } });
        await page.locator('[data-plurid-control="dock-toggle"]').click();
        await settle(page);
        expect(await dockedID(page)).toBeTruthy();
        expect(await pathname(page)).toBe('/' + (await dockedID(page))!.split('/').pop()!.split('@')[0]);
        await page.keyboard.press('Escape');
        await settle(page);
        expect(await dockedID(page)).toBeNull();
    });

    test('docking.motion instant: Back jumps to the parent', async ({ page }) => {
        await openFixture(page, 'page-docked', { extra: { dockMotion: 'instant', ...SWING } });
        const root = (await tree(page))[0];
        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        await page.goBack();
        await page.waitForTimeout(50);
        expect(await page.evaluate(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().space.motion)).toBe('idle');
        expect(await dockedID(page)).toBe(root.planeID);
    });

    test('a deep link to another ROOT boots docked on it at store time: no frame on the first page', async ({ page }) => {
        // record from the very first frame: a boot on page 1 would show as a frame docked on it
        const recording = await recordDockedFrames(page);
        await openPath(page, '/page-2', 'page-docked', { pages: '2' });
        const [one, two] = await tree(page);
        expect(await dockedID(page)).toBe(two.planeID);
        expect(await pathname(page)).toBe('/page-2');
        expectFills(await planeRect(page, two.planeID), await viewRect(page));
        const frames = await recording.stop();
        expect(frames.length).toBeGreaterThan(0);
        expect(frames.filter((frame) => frame === one.planeID)).toEqual([]);
        expect(frames.filter((frame) => frame === null)).toEqual([]);
    });

    test('a base path: the pages live under it, a deep link under it boots on the page, a location outside it is left alone', async ({ page }) => {
        await openPath(page, '/docs/', 'page-docked', { urlBase: '/docs' });
        const root = (await tree(page))[0];
        expect(await pathname(page)).toBe('/docs/page-1');
        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        expect(await pathname(page)).toBe('/docs/page-1/about');

        await openPath(page, '/docs/page-1/about', 'page-docked', { urlBase: '/docs' });
        const about = (await tree(page))[0].children?.[0];
        expect(about).toBeTruthy();
        expect(await dockedID(page)).toBe(about!.planeID);
        expect(await pathname(page)).toBe('/docs/page-1/about');

        await openPath(page, '/elsewhere', 'page-docked', { urlBase: '/docs' });
        expect(await dockedID(page)).toBeTruthy();
        expect(await pathname(page)).toBe('/elsewhere');
    });

    test('an orphan address: by default the boot page\'s path is written; with orphan=keep the address stays until the next dock', async ({ page }) => {
        await openPath(page, '/nowhere', 'page-docked');
        expect(await dockedID(page)).toBeTruthy();
        expect(await pathname(page)).toBe('/page-1');

        await openPath(page, '/nowhere', 'page-docked', { urlOrphan: 'keep' });
        const root = (await tree(page))[0];
        const before = await historyLength(page);
        expect(await dockedID(page)).toBe(root.planeID);
        expect(await pathname(page)).toBe('/nowhere');
        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        expect(await pathname(page)).toBe('/page-1/about');
        expect(await historyLength(page)).toBe(before + 1);
    });
});
