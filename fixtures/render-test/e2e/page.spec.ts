import {
    test,
    expect,
    Page,
} from '@playwright/test';

import {
    camera,
    clickLink,
    collectConsoleErrors,
    openFixture,
    publish,
    scrollPlaneContent,
    settle,
    spaceState,
    tree,
    viewRect,
    waitForChildren,
} from './helpers';


/**
 * THE PAGE PRESENTATION: the space presents as a site. The camera docks on a page (face-on,
 * scale 1, the page filling the view to the pixel), the chrome is hidden while docked and the
 * page owns the wheel; a link, the corner control, a pinch or the G key reveal the space; Escape
 * and the back control dock again. Pose is the state: nothing here reads a mode flag.
 */
const CHROME = [
    '[data-plurid-entity="PluridToolbar"]',
    '[data-plurid-control="viewcube-fit"]',
    '[data-plurid-entity="PluridMinimap"]',
    '[data-plurid-entity="PluridPlaneControls"]',
    '[data-plurid-entity="PluridTransformOrigin"]',
    '[data-plurid-control="shortcuts"]',
];
const TOGGLE = '[data-plurid-control="dock-toggle"]';
const BACK = '[data-plurid-control="dock-back"]';
const CONTENT = '[data-plurid-entity="PluridPlaneContent"]';

const dockedID = (page: Page) => page.evaluate(() => document.querySelector('[data-plurid-entity="PluridView"]')!.getAttribute('data-plurid-docked'));

const planeRect = (page: Page, planeID: string) => page.evaluate((id) => {
    const r = document.querySelector(`[data-plurid-plane="${id}"]`)!.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
}, planeID);

const scrollTop = (page: Page, planeID: string) => page.evaluate(({ id, content }) => (document.querySelector(`[data-plurid-plane="${id}"] ${content}`) as HTMLElement).scrollTop, { id: planeID, content: CONTENT });

/** Visible chrome: the selectors whose element renders visible (absent or `visibility: hidden` = not). */
const visibleChrome = (page: Page) => page.evaluate((selectors) => selectors.filter((selector) => {
    const element = document.querySelector(selector);
    return !!element && getComputedStyle(element).visibility === 'visible';
}), CHROME);

const expectFills = (rect: { left: number; top: number; width: number; height: number }, view: { left: number; top: number; width: number; height: number }) => {
    expect(Math.abs(rect.left - view.left)).toBeLessThanOrEqual(1);
    expect(Math.abs(rect.top - view.top)).toBeLessThanOrEqual(1);
    expect(Math.abs(rect.width - view.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(rect.height - view.height)).toBeLessThanOrEqual(1);
};

const expectIdentity = (cam: any) => {
    expect(cam.scale).toBeCloseTo(1, 6);
    expect(cam.yaw).toBeCloseTo(0, 6);
    expect(cam.pitch).toBeCloseTo(0, 6);
    expect(cam.offset.x).toBeCloseTo(0, 6);
    expect(cam.offset.y).toBeCloseTo(0, 6);
};

const waitChromeHidden = (page: Page) => expect.poll(() => visibleChrome(page)).toEqual([]);
const waitChromeShown = (page: Page) => expect.poll(() => visibleChrome(page)).toContain(CHROME[0]);


test.describe('the page presentation', () => {
    test('boots as a site: the page fills the view, the camera is the identity, no chrome but the corner control', async ({ page }) => {
        const errors = collectConsoleErrors(page);
        // every frame of the boot: was any chrome ever painted visible?
        await page.addInitScript(() => {
            const frames: { plane: boolean; docked: boolean; toolbar: string }[] = ((window as any).__rtBootFrames = []);
            const tick = () => {
                const toolbar = document.querySelector('[data-plurid-entity="PluridToolbar"]');
                frames.push({
                    plane: !!document.querySelector('[data-plurid-plane]'),
                    docked: !!document.querySelector('[data-plurid-docked]'),
                    toolbar: toolbar ? getComputedStyle(toolbar).visibility : 'none',
                });
                if (frames.length < 180) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        });
        await openFixture(page, 'page-docked');
        const frames: { plane: boolean; docked: boolean; toolbar: string }[] = await page.evaluate(() => (window as any).__rtBootFrames);
        expect(frames.filter((frame) => frame.toolbar === 'visible')).toEqual([]);
        expect(frames.filter((frame) => frame.plane && !frame.docked)).toEqual([]);
        const root = (await tree(page))[0];
        const view = await viewRect(page);

        expectFills(await planeRect(page, root.planeID), view);
        expectIdentity(await camera(page));
        expect(await dockedID(page)).toBe(root.planeID);
        expect(await visibleChrome(page)).toEqual([]);
        await expect(page.locator(TOGGLE)).toBeVisible();
        expect(await page.locator(BACK).count()).toBe(0);
        // the page's content is the scroller, focused so the keyboard scrolls it
        expect(await page.evaluate((content) => document.activeElement?.matches(content) ?? false, CONTENT)).toBe(true);
        expect(errors).toEqual([]);
    });

    test('the wheel over the page scrolls it; the camera never moves', async ({ page }) => {
        await openFixture(page, 'page-docked');
        const root = (await tree(page))[0];
        const view = await viewRect(page);
        const before = await camera(page);

        await page.mouse.move(view.left + view.width / 2, view.top + view.height / 2);
        await page.mouse.wheel(0, 400);
        await expect.poll(() => scrollTop(page, root.planeID)).toBeGreaterThan(100);
        await page.waitForTimeout(150);
        expect(await camera(page)).toEqual(before);
        expect(await dockedID(page)).toBe(root.planeID);
    });

    test('over a short page the wheel does nothing: no scroll, no zoom, no pan', async ({ page }) => {
        await openFixture(page, 'page-docked');
        const root = (await tree(page))[0];
        await clickLink(page, root.planeID, '/page-1/contact');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        const contact = (await tree(page))[0].children.find((child: any) => String(child.route).endsWith('/contact'));
        expect(await dockedID(page)).toBe(contact.planeID);
        const view = await viewRect(page);
        const before = await camera(page);

        await page.mouse.move(view.left + view.width / 2, view.top + view.height / 2);
        await page.mouse.wheel(0, 400);
        await page.waitForTimeout(200);
        expect(await scrollTop(page, contact.planeID)).toBe(0);
        expect(await camera(page)).toEqual(before);
        expect(await dockedID(page)).toBe(contact.planeID);
    });

    test('a pinch (Ctrl+wheel) undocks and the chrome appears; Escape docks the page back', async ({ page }) => {
        await openFixture(page, 'page-docked');
        const root = (await tree(page))[0];
        const view = await viewRect(page);

        await page.mouse.move(view.left + view.width / 2, view.top + view.height / 2);
        await page.keyboard.down('Control');
        await page.mouse.wheel(0, 300);
        await page.keyboard.up('Control');
        await settle(page);
        expect((await camera(page)).scale).toBeLessThan(0.99);
        expect(await dockedID(page)).toBeNull();
        await waitChromeShown(page);

        await page.keyboard.press('Escape');
        await settle(page);
        expectIdentity(await camera(page));
        expect(await dockedID(page)).toBe(root.planeID);
        await waitChromeHidden(page);
    });

    test('the corner control reveals the space (pulled back, tilted) and docks back', async ({ page }) => {
        await openFixture(page, 'page-docked');
        const root = (await tree(page))[0];

        await page.locator(TOGGLE).click();
        await settle(page);
        const revealed = await camera(page);
        expect(revealed.scale).toBeCloseTo(0.8, 6);
        expect(revealed.pitch).toBeCloseTo(8, 6);
        expect(revealed.yaw).toBeCloseTo(-6, 6);
        expect(await dockedID(page)).toBeNull();
        await waitChromeShown(page);

        await page.locator(TOGGLE).click();
        await settle(page);
        expectIdentity(await camera(page));
        expect(await dockedID(page)).toBe(root.planeID);
        await waitChromeHidden(page);
    });

    test('a link opens its page behind and docks onto it; the back control docks the parent', async ({ page }) => {
        await openFixture(page, 'page-docked');
        const root = (await tree(page))[0];
        const view = await viewRect(page);

        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        const about = (await tree(page))[0].children[0];
        expect(String(about.route).endsWith('/about')).toBe(true);
        expect(Math.abs(about.location.rotateY)).toBeCloseTo(90, 6);
        expect(await dockedID(page)).toBe(about.planeID);
        const cam = await camera(page);
        expect(cam.scale).toBeCloseTo(1, 6);
        expect(Math.abs(cam.yaw)).toBeCloseTo(90, 6);
        expectFills(await planeRect(page, about.planeID), view);
        await waitChromeHidden(page);

        await page.locator(BACK).click();
        await settle(page);
        expect(await dockedID(page)).toBe(root.planeID);
        expectIdentity(await camera(page));
        expectFills(await planeRect(page, root.planeID), view);
    });

    test('scrolling the page past its link: the child stays, the bridge follows the link and rests at the fold', async ({ page }) => {
        await openFixture(page, 'page-docked');
        const root = (await tree(page))[0];
        await clickLink(page, root.planeID, '/page-1/contact');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        await publish(page, 'space.reveal', { animate: false });
        await settle(page);
        const contact = (await tree(page))[0].children[0];
        const anchor = contact.linkCoordinates;
        const bridgeLength = contact.bridgeLength;
        const leash = () => page.evaluate((id) => {
            const plane = document.querySelector(`[data-plurid-plane="${id}"]`) as HTMLElement;
            const bridge = plane.querySelector('[data-plurid-entity="PluridPlaneBridge"]') as HTMLElement;
            const style = getComputedStyle(bridge);
            return {
                reach: plane.style.getPropertyValue('--plurid-bridge-reach'),
                angle: plane.style.getPropertyValue('--plurid-bridge-angle'),
                width: bridge.offsetWidth,
                transform: style.transform,
            };
        }, contact.planeID);

        // scrolled past the header: the link is beyond the fold, the bridge reaches up to the top edge
        await scrollPlaneContent(page, root.planeID, 600);
        const after = (await tree(page))[0].children[0];
        expect(after.location).toEqual(contact.location);
        expect(after.linkCoordinates).toEqual(anchor);
        const stretched = await leash();
        const expectedReach = Math.hypot(bridgeLength, anchor.y);
        expect(parseFloat(stretched.reach)).toBeCloseTo(expectedReach, 0);
        expect(stretched.width).toBeCloseTo(expectedReach, 0);
        expect(stretched.transform).not.toBe('none');
        expect(parseFloat(stretched.angle)).toBeCloseTo(Math.atan2(anchor.y, bridgeLength) * 180 / Math.PI, 1);

        // back at the top: the bridge rests
        await scrollPlaneContent(page, root.planeID, 0);
        const rested = await leash();
        expect(parseFloat(rested.reach)).toBeCloseTo(bridgeLength, 6);
        expect(parseFloat(rested.angle)).toBe(0);
        expect(rested.width).toBe(bridgeLength);

        // a resize while scrolled never lifts the child off its sheet (the anchor clamps at the fold)
        await scrollPlaneContent(page, root.planeID, 600);
        await page.setViewportSize({ width: 1100, height: 700 });
        await page.waitForFunction(() => (window as any).__pluridApi.getSnapshot().space.viewSize.width === 1100);
        await settle(page);
        const resized = (await tree(page))[0];
        const child = resized.children[0];
        expect(child.location.translateY).toBeGreaterThanOrEqual(resized.location.translateY);
        expect(child.location.translateY).toBeLessThanOrEqual(resized.location.translateY + resized.height);
        expect(child.linkCoordinates.y).toBe(0);
    });

    /** Record every frame from now on: the docked attribute, the toolbar's visibility, the motion. */
    const startFrames = (page: Page) => page.evaluate(() => {
        const frames: { docked: string | null; toolbar: string; motion: string; aside: number }[] = ((window as any).__rtFrames = []);
        (window as any).__rtRecording = true;
        const tick = () => {
            const toolbar = document.querySelector('[data-plurid-entity="PluridToolbar"]');
            frames.push({
                docked: document.querySelector('[data-plurid-entity="PluridView"]')!.getAttribute('data-plurid-docked'),
                toolbar: toolbar ? getComputedStyle(toolbar).visibility : 'none',
                motion: (window as any).__pluridApi.getSnapshot().space.motion,
                aside: document.querySelectorAll('[data-plurid-aside]').length,
            });
            if ((window as any).__rtRecording && frames.length < 900) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    });
    const stopFrames = (page: Page): Promise<{ docked: string | null; toolbar: string; motion: string; aside: number }[]> => page.evaluate(() => {
        (window as any).__rtRecording = false;
        return (window as any).__rtFrames;
    });
    /** A real swing: the fixtures are otherwise opened with reduced motion. */
    const SWING = { reducedMotion: '0', motionMs: '300' };

    test('a docking swing never paints the chrome: the destination counts as docked for the whole tween (the default)', async ({ page }) => {
        await openFixture(page, 'page-docked', { extra: SWING });
        const root = (await tree(page))[0];

        await startFrames(page);
        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        const about = (await tree(page))[0].children[0];
        const swing = await stopFrames(page);
        expect(swing.some((frame) => frame.motion === 'tween')).toBe(true);
        expect(swing.filter((frame) => !frame.docked)).toEqual([]);
        expect(swing.filter((frame) => frame.toolbar === 'visible')).toEqual([]);
        expect(await dockedID(page)).toBe(about.planeID);

        // back from the revealed space: the chrome vanishes at the swing's first frame, not at its end
        await publish(page, 'space.reveal', { animate: false });
        await waitChromeShown(page);
        await startFrames(page);
        await page.keyboard.press('Escape');
        await settle(page);
        const back = await stopFrames(page);
        const first = back.findIndex((frame) => frame.motion === 'tween');
        expect(first).toBeGreaterThanOrEqual(0);
        expect(back.slice(first).filter((frame) => !frame.docked || frame.toolbar === 'visible')).toEqual([]);
        expect(await dockedID(page)).toBe(about.planeID);
    });

    test('on a page a link is a link: about → back → about lands on about again; a re-opened page swings without chrome', async ({ page }) => {
        await openFixture(page, 'page-docked', { extra: SWING });
        const root = (await tree(page))[0];
        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        const about = (await tree(page))[0].children[0];
        await page.locator(BACK).click();
        await settle(page);
        expect(await dockedID(page)).toBe(root.planeID);

        // the second click: no toggle-close, a swing back onto the open page, no chrome frame
        await startFrames(page);
        await clickLink(page, root.planeID, '/page-1/about');
        await settle(page);
        const again = await stopFrames(page);
        expect((await tree(page))[0].children[0].show).not.toBe(false);
        expect(await dockedID(page)).toBe(about.planeID);
        expect(again.some((frame) => frame.motion === 'tween')).toBe(true);
        expect(again.filter((frame) => !frame.docked || frame.toolbar === 'visible')).toEqual([]);

        // a page closed by its own control and re-opened by the link: the re-show swing (a retarget
        // after the measurement) keeps the chrome hidden and the motion in `tween` until it lands
        await page.locator(BACK).click();
        await settle(page);
        await publish(page, 'space.closePlane', { id: about.planeID, navigate: 'stay' });
        await page.waitForFunction(() => ((window as any).__rtTree()[0].children || []).every((child: any) => child.show === false));
        await startFrames(page);
        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        const reopened = await stopFrames(page);
        expect(await dockedID(page)).toBe(about.planeID);
        expect(reopened.some((frame) => frame.motion === 'tween')).toBe(true);
        expect(reopened.filter((frame) => !frame.docked || frame.toolbar === 'visible')).toEqual([]);
        const firstTween = reopened.findIndex((frame) => frame.motion === 'tween');
        const lastTween = reopened.length - 1 - [...reopened].reverse().findIndex((frame) => frame.motion === 'tween');
        expect(reopened.slice(firstTween, lastTween + 1).filter((frame) => frame.motion !== 'tween')).toEqual([]);
    });

    test('two pages open behind the site: docking on one sets the other aside, from the first frame of the swing; the reveal brings it back', async ({ page }) => {
        await openFixture(page, 'page-docked', { extra: SWING });
        const root = (await tree(page))[0];
        const open = async (route: string, count: number) => {
            await clickLink(page, root.planeID, route);
            await waitForChildren(page, root.planeID, count);
            await settle(page);
            await page.locator(BACK).click();
            await settle(page);
        };
        await open('/page-1/about', 1);
        await open('/page-1/contact', 2);
        const children = (await tree(page))[0].children;
        const about = children.find((child: any) => String(child.route).endsWith('/about'));
        const contact = children.find((child: any) => String(child.route).endsWith('/contact'));
        const asideOf = (planeID: string) => page.evaluate((id) => {
            const element = document.querySelector(`[data-plurid-plane="${id}"]`) as HTMLElement;
            return { aside: element.getAttribute('data-plurid-aside'), opacity: getComputedStyle(element).opacity, pointer: getComputedStyle(element).pointerEvents };
        }, planeID);
        // docked on the site: both children are its lineage
        expect((await asideOf(about.planeID)).aside).toBeNull();
        expect((await asideOf(contact.planeID)).aside).toBeNull();

        await startFrames(page);
        await clickLink(page, root.planeID, '/page-1/about');
        await settle(page);
        const swing = await stopFrames(page);
        expect(await dockedID(page)).toBe(about.planeID);
        const firstTween = swing.findIndex((frame) => frame.motion === 'tween');
        expect(firstTween).toBeGreaterThanOrEqual(0);
        expect(swing.slice(firstTween).filter((frame) => frame.aside !== 1)).toEqual([]);
        await expect.poll(async () => (await asideOf(contact.planeID)).opacity).toBe('0');
        expect((await asideOf(contact.planeID)).aside).toBe('true');
        expect((await asideOf(contact.planeID)).pointer).toBe('none');
        expect((await asideOf(about.planeID)).aside).toBeNull();
        expect((await asideOf(about.planeID)).opacity).toBe('1');
        expect((await asideOf(root.planeID)).aside).toBeNull();

        // the reveal: contact fades back
        await page.keyboard.press('KeyG');
        await settle(page);
        expect((await asideOf(contact.planeID)).aside).toBeNull();
        await expect.poll(async () => (await asideOf(contact.planeID)).opacity).toBe('1');
        // and Escape sets it aside again
        await page.keyboard.press('Escape');
        await settle(page);
        expect(await dockedID(page)).toBe(about.planeID);
        expect((await asideOf(contact.planeID)).aside).toBe('true');
    });

    test('docking.chrome shown: the space shows during the swing, then the page docks', async ({ page }) => {
        await openFixture(page, 'page-docked', { extra: { ...SWING, dockChrome: 'shown' } });
        const root = (await tree(page))[0];
        await startFrames(page);
        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        const swing = await stopFrames(page);
        expect(swing.some((frame) => frame.motion === 'tween' && !frame.docked && frame.toolbar === 'visible')).toBe(true);
        expect(await dockedID(page)).toBe((await tree(page))[0].children[0].planeID);
        await waitChromeHidden(page);
    });

    test('docking.motion instant: a link, the back control and Escape jump; the reveal still swings', async ({ page }) => {
        await openFixture(page, 'page-docked', { extra: { ...SWING, dockMotion: 'instant' } });
        const root = (await tree(page))[0];
        await startFrames(page);
        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        const about = (await tree(page))[0].children[0];
        const jump = await stopFrames(page);
        expect(jump.filter((frame) => frame.motion === 'tween')).toEqual([]);
        expect(jump.filter((frame) => frame.toolbar === 'visible')).toEqual([]);
        expect(await dockedID(page)).toBe(about.planeID);

        await startFrames(page);
        await page.locator(BACK).click();
        await settle(page);
        expect((await stopFrames(page)).filter((frame) => frame.motion === 'tween')).toEqual([]);
        expect(await dockedID(page)).toBe(root.planeID);

        // the reveal keeps its motion; Escape from it jumps
        await startFrames(page);
        await page.keyboard.press('KeyG');
        await settle(page);
        expect((await stopFrames(page)).some((frame) => frame.motion === 'tween')).toBe(true);
        await startFrames(page);
        await page.keyboard.press('Escape');
        await settle(page);
        expect((await stopFrames(page)).filter((frame) => frame.motion === 'tween')).toEqual([]);
        expect(await dockedID(page)).toBe(root.planeID);
    });

    test('G reveals the space in grab mode; Escape leaves grab and docks', async ({ page }) => {
        await openFixture(page, 'page-docked');
        const root = (await tree(page))[0];
        const grabMode = () => page.evaluate(() => (window as any).__pluridApi.getSnapshot().ui.grabMode);

        await page.keyboard.press('KeyG');
        await settle(page);
        expect(await grabMode()).toBe(true);
        expect((await camera(page)).scale).toBeCloseTo(0.8, 6);
        expect(await dockedID(page)).toBeNull();

        await page.keyboard.press('Escape');
        await settle(page);
        expect(await grabMode()).toBe(false);
        expect(await dockedID(page)).toBe(root.planeID);
        expectIdentity(await camera(page));
    });

    test('touch: one finger scrolls the page, the camera stays', async ({ browser }) => {
        const context = await browser.newContext({ hasTouch: true, viewport: { width: 1000, height: 700 } });
        const page = await context.newPage();
        await openFixture(page, 'page-docked');
        const root = (await tree(page))[0];
        const view = await viewRect(page);
        const before = await camera(page);

        const client = await context.newCDPSession(page);
        const x = view.left + view.width / 2;
        const y0 = view.top + view.height * 0.7;
        await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0, id: 1 }] });
        for (let step = 1; step <= 12; step += 1) {
            await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 - step * 20, id: 1 }] });
        }
        await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await expect.poll(() => scrollTop(page, root.planeID)).toBeGreaterThan(50);
        expect(await camera(page)).toEqual(before);
        expect(await dockedID(page)).toBe(root.planeID);
        await context.close();
    });

    test('a viewport resize keeps the page docked and view-sized', async ({ page }) => {
        await openFixture(page, 'page-docked');
        const root = (await tree(page))[0];

        await page.setViewportSize({ width: 900, height: 620 });
        await page.waitForFunction(() => (window as any).__pluridApi.getSnapshot().space.viewSize.width === 900);
        await settle(page);
        await expect.poll(async () => (await planeRect(page, root.planeID)).width).toBe(900);
        expectFills(await planeRect(page, root.planeID), await viewRect(page));
        expect(await dockedID(page)).toBe(root.planeID);
        expectIdentity(await camera(page));
        expect((await spaceState(page)).motion).toBe('idle');
    });
});
