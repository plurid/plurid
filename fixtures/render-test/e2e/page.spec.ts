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
    waitForBoot,
    revealPose,
    PAGE_CHROME,
    CONTENT,
    DOCK_TOGGLE as TOGGLE,
    DOCK_BACK as BACK,
    dockedID,
    planeRect,
    elementRect,
    scrollTop,
    settledScrollTop,
    visibleChrome,
    waitChromeHidden,
    waitChromeShown,
    expectFills,
    expectIdentity,
    recordFrames,
    motionRuns,
    BootFrame,
    HarnessWindow,
    afterFrames,
    pinch,
} from './helpers';


/**
 * THE PAGE PRESENTATION: the space presents as a site. The camera docks on a page (face-on,
 * scale 1, the page filling the view to the pixel), the chrome is hidden while docked and the
 * page owns the wheel; a link, the corner control, a pinch or the G key reveal the space; Escape
 * and the back control dock again. Pose is the state: nothing here reads a mode flag.
 */
/**
 * The bridge BAND's height, px (`BRIDGE_STRIP_HEIGHT`) — the flat, axis-aligned
 * strip a child hangs from while it is still laid out by its parent.
 *
 * NOT the leash BEAM, which is the real-3D box drawn for a child that has been
 * moved by hand (or a later sibling of a fan): that is `LEASH_THICKNESS`, the
 * band's own height again since 2026-09-17 (the leash IS the strip, drawn as a
 * beam: flush with the plane's top, centred on the link's line), and it is
 * asserted in `layout.spec.ts` by reading the element, not by a second copy of
 * a number. The beam was thinned to 6 once, and a test carrying its own copy
 * of the 30 failed that day. (2026-09-14)
 */
const STRIP = 30;
/** And what is DRAWN on the link's line: the bridge's own width (`BRIDGE_THREAD`), px. */
const THREAD = 3;
/** Up to this tilt a bridge points exactly at its link (`BRIDGE_LEAN_KNEE`), degrees. */
const LEAN_KNEE = 12;
/** The tilt it leans toward and never passes (`BRIDGE_LEAN_LIMIT`), degrees. */
const LEAN_LIMIT = 22;
/** A page's controls bar hangs this far above its sheet (`PLANE_BAR_HEIGHT`). */
const BAR = 56;
/** A real swing: the fixtures are otherwise opened with reduced motion. */
const SWING = { reducedMotion: '0', motionMs: '300' };

/** The plane of the tree whose route ends with `route` (roots and children). */
const byRoute = (nodes: any[], route: string): any => {
    for (const node of nodes) {
        if (String(node.route).endsWith(route)) return node;
        const found = byRoute(node.children ?? [], route);
        if (found) return found;
    }
    return undefined;
};


test.describe('the page presentation', () => {
    test('boots as a site: the page fills the view, the camera is the identity, no chrome but the corner control', async ({ page }) => {
        const errors = collectConsoleErrors(page);
        // every frame of the boot: was any chrome ever painted visible?
        await page.addInitScript(() => {
            const frames: BootFrame[] = ((window as unknown as HarnessWindow).__rtBootFrames = []);
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
        const frames = await page.evaluate(() => (window as unknown as HarnessWindow).__rtBootFrames ?? []);
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
        // the camera must not have moved: a frame budget in which it could have
        await afterFrames(page, 12);
        expect(await camera(page)).toEqual(before);
        expect(await dockedID(page)).toBe(root.planeID);
    });

    test('over a short page the wheel does nothing: no scroll, no zoom, no pan', async ({ page }) => {
        await openFixture(page, 'page-docked');
        const root = (await tree(page))[0];
        await clickLink(page, root.planeID, '/page-1/contact');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        const contact = byRoute(await tree(page), '/contact');
        expect(await dockedID(page)).toBe(contact.planeID);
        const view = await viewRect(page);
        const before = await camera(page);

        await page.mouse.move(view.left + view.width / 2, view.top + view.height / 2);
        await page.mouse.wheel(0, 400);
        await afterFrames(page, 16);
        expect(await scrollTop(page, contact.planeID)).toBe(0);
        expect(await camera(page)).toEqual(before);
        expect(await dockedID(page)).toBe(contact.planeID);
    });

    test('a pinch undocks and the chrome appears; Escape docks the page back', async ({ page }) => {
        await openFixture(page, 'page-docked');
        const root = (await tree(page))[0];
        const view = await viewRect(page);

        await pinch(page, { x: view.left + view.width / 2, y: view.top + view.height / 2 }, 300);
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
        const reveal = await revealPose(page);
        expect(revealed.scale).toBeCloseTo(reveal.scale as number, 6);
        expect(revealed.pitch).toBeCloseTo(reveal.pitch as number, 6);
        expect(revealed.yaw).toBeCloseTo(reveal.yaw as number, 6);
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
        // the page spawned behind the site stands at 90.1° (never 90), and the camera docks on it
        expect(Math.abs(about.location.rotateY)).toBeCloseTo(90.1, 6);
        expect(await dockedID(page)).toBe(about.planeID);
        const cam = await camera(page);
        expect(cam.scale).toBeCloseTo(1, 6);
        expect(Math.abs(cam.yaw)).toBeCloseTo(90.1, 6);
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
                height: bridge.offsetHeight,
                top: bridge.offsetTop,
                transform: style.transform,
                clip: style.clipPath,
                opacity: parseFloat(style.opacity),
                live: bridge.getAttribute('data-plurid-bridge-live') === 'true',
            };
        }, contact.planeID);

        // A BRIDGE IS A LINE. It was a 30px band, then a band tapering to a thread, and both were
        // objects in the picture: a plate across the space, then a wedge that read as an arrowhead
        // (2026-09-19). One width, no clip, no mask, at rest and scrolled alike.
        const drawnAsALine = (drawn: { clip: string }) => {
            expect(drawn.clip === 'none' || drawn.clip === '').toBe(true);
        };
        drawnAsALine(await leash());

        // scrolled past the header: the link is beyond the fold, the bridge reaches up to the top edge
        await scrollPlaneContent(page, root.planeID, 600);
        const after = (await tree(page))[0].children[0];
        expect(after.location).toEqual(contact.location);
        expect(after.linkCoordinates).toEqual(anchor);
        const stretched = await leash();
        // THE BRIDGE LEANS, IT DOES NOT STRETCH. The link scrolled to the fold, far past the knee:
        // the bridge leans toward it, under the limit, and its far end lands ON the parent's face
        // (a bridge length over the cosine of the lean) instead of reaching across the space to
        // the link's own point. Pointing exactly at a link 400px down a page turned a 100px bridge
        // into a 400px diagonal (2026-09-18).
        const lean = Math.abs(parseFloat(stretched.angle));
        const tilt = Math.atan2(anchor.y, bridgeLength) * 180 / Math.PI;
        // this fixture's link sits a tenth of a bridge down its page: UNDER the knee, so the
        // bridge still points exactly at it and the numbers are the ones this test always pinned
        expect(tilt).toBeLessThan(LEAN_KNEE);
        expect(lean).toBeCloseTo(tilt, 1);
        expect(parseFloat(stretched.reach)).toBeCloseTo(Math.hypot(bridgeLength, anchor.y), 0);
        expect(parseFloat(stretched.reach)).toBeCloseTo(bridgeLength / Math.cos(lean * Math.PI / 180), 0);
        // the leash is a line drawn as a band across an axis-aligned box, never a rotated element
        // (a plane's layer must not cross its parent's plane): as long as the bridge, as tall as
        // the lean's drop plus the LINE's cut at the box's vertical edges, pivoting about the
        // link's line, which is where the placement still puts it (half a strip below the plane's
        // top, `TreePlane.bridgeOffset`).
        const drop = Math.abs(parseFloat(stretched.reach) * Math.sin(lean * Math.PI / 180));
        const half = THREAD / 2 / Math.cos(lean * Math.PI / 180);
        expect(stretched.transform).toBe('none');
        expect(stretched.width).toBe(bridgeLength);
        expect(stretched.height).toBeCloseTo(drop + 2 * half, 0);
        expect(stretched.height).toBeLessThan(2 * THREAD + drop);
        expect(stretched.top).toBeCloseTo(STRIP / 2 - BAR - drop - half, 0);
        drawnAsALine(stretched);

        // back at the top: the bridge rests
        await scrollPlaneContent(page, root.planeID, 0);
        const rested = await leash();
        expect(parseFloat(rested.reach)).toBeCloseTo(bridgeLength, 6);
        expect(parseFloat(rested.angle)).toBe(0);
        expect(rested.width).toBe(bridgeLength);
        // at rest the line is the thread's own width, on the link's line: half a strip below the
        // plane's top, which on a page is the top of its bar, above the sheet
        expect(rested.height).toBe(THREAD);
        // `offsetTop` is a rounded integer and the line's half is 1.5px
        expect(Math.abs(rested.top - (STRIP / 2 - BAR - THREAD / 2))).toBeLessThanOrEqual(0.5);

        // QUIET UNTIL IT MATTERS. A still space is still: the line rests barely there and comes up
        // for the ACTIVE plane, which the engine takes from the pointer. A bridge at one steady
        // tone was the reader's "too much is going on" (2026-09-19). The active plane is ONE
        // value, so this drives it through the bus rather than through the pointer's geometry.
        // THE PRECONDITION IS SET HERE, NOT INHERITED. This gate first read the child as already
        // active, which it was locally only because of where earlier steps had left the pointer;
        // on linux they left it over the root, and CI went red (2026-09-19). Navigating to the
        // child makes it the active plane on every platform.
        await publish(page, 'space.navigateToPlane', { planeID: contact.planeID });
        await settle(page);
        await expect.poll(async () => (await leash()).live).toBe(true);
        const live = await leash();
        await publish(page, 'space.navigateToPlane', { planeID: root.planeID });
        await settle(page);
        await expect.poll(async () => (await leash()).opacity).toBeLessThan(live.opacity);
        const quiet = await leash();
        expect(quiet.live).toBe(false);
        // and comes back up when the reader returns to it
        await publish(page, 'space.navigateToPlane', { planeID: contact.planeID });
        await settle(page);
        await expect.poll(async () => (await leash()).opacity).toBeGreaterThan(quiet.opacity);

        // a resize while scrolled never lifts the child off its sheet (the anchor clamps at the fold)
        await scrollPlaneContent(page, root.planeID, 600);
        await page.setViewportSize({ width: 1100, height: 700 });
        await page.waitForFunction(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().space.viewSize.width === 1100);
        await settle(page);
        const resized = (await tree(page))[0];
        const child = resized.children[0];
        expect(child.location.translateY).toBeGreaterThanOrEqual(resized.location.translateY);
        expect(child.location.translateY).toBeLessThanOrEqual(resized.location.translateY + resized.height);
        expect(child.linkCoordinates.y).toBe(0);
    });

    /**
     * THE LEAN. A bridge points at its link while the tilt is small and LEANS toward it after that,
     * easing to a limit it never passes, with the far end always landing on the parent's face. A
     * link scrolled far down a tall plane used to drag the bridge into a long diagonal band across
     * the space, cutting through every plane it passed (the reader's screenshots, 2026-09-18).
     * The fixture's own link is a tenth of a bridge down its page, so the knee is brought to it.
     */
    test('the bridge leans toward a scrolled link as far as the product allows, and no further', async ({ page }) => {
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
        const tilt = Math.atan2(anchor.y, bridgeLength) * 180 / Math.PI;

        const drawn = () => page.evaluate((id) => {
            const plane = document.querySelector(`[data-plurid-plane="${id}"]`) as HTMLElement;
            const bridge = plane.querySelector('[data-plurid-entity="PluridPlaneBridge"]') as HTMLElement;
            return {
                reach: parseFloat(plane.style.getPropertyValue('--plurid-bridge-reach')),
                angle: Math.abs(parseFloat(plane.style.getPropertyValue('--plurid-bridge-angle'))),
                height: bridge.offsetHeight,
            };
        }, contact.planeID);

        await publish(page, 'configuration', { space: { bridge: { lean: { knee: 2, limit: 6 } } } });
        await scrollPlaneContent(page, root.planeID, 600);
        await settle(page);

        const leaned = await drawn();
        // it leans toward the link it can no longer point at, and stops short of the limit
        expect(leaned.angle).toBeLessThan(tilt);
        expect(leaned.angle).toBeGreaterThan(2);
        expect(leaned.angle).toBeLessThanOrEqual(6);
        // and lands on the parent's face: a bridge length over the cosine of the lean, never the
        // hypotenuse to the link's own point
        expect(leaned.reach).toBeCloseTo(bridgeLength / Math.cos(leaned.angle * Math.PI / 180), 0);
        expect(leaned.reach).toBeLessThan(Math.hypot(bridgeLength, anchor.y));
        // so the box the band is drawn across stays about a strip tall
        expect(leaned.height).toBeLessThan(2 * THREAD + bridgeLength * Math.sin(6 * Math.PI / 180));

        // AND A CONFIGURATION CHANGE WHILE SCROLLED MOVES NOTHING. The follower re-measures the
        // link and RE-ANCHORS the child when it runs, so carrying the lean in the effect's
        // dependency list re-placed a plane at the link's clamped point every time any
        // configuration changed: the page jumped 20px after a scroll, which two visual baselines
        // caught. The lean rides a ref instead. An arrangement is the reader's.
        await publish(page, 'configuration', { space: { fadeInTime: 0 } });
        await settle(page);
        const settled = (await tree(page))[0].children[0];
        expect(settled.location).toEqual(contact.location);
        expect(settled.linkCoordinates).toEqual(anchor);

        // back at the top the bridge rests, whatever the lean allows
        await scrollPlaneContent(page, root.planeID, 0);
        await settle(page);
        const rested = await drawn();
        expect(rested.angle).toBe(0);
        expect(rested.reach).toBeCloseTo(bridgeLength, 6);
        expect(rested.height).toBe(THREAD);
    });

    test('a docking swing never paints the chrome: the destination counts as docked for the whole tween (the default)', async ({ page }) => {
        await openFixture(page, 'page-docked', { extra: SWING });
        const root = (await tree(page))[0];

        let recording = await recordFrames(page);
        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        const about = (await tree(page))[0].children[0];
        const swing = await recording.stop();
        expect(swing.some((frame) => frame.motion === 'tween')).toBe(true);
        expect(swing.filter((frame) => !frame.docked)).toEqual([]);
        expect(swing.filter((frame) => frame.toolbar === 'visible')).toEqual([]);
        expect(await dockedID(page)).toBe(about.planeID);

        // back from the revealed space: the chrome vanishes at the swing's first frame, not at its end.
        // Escape docks the page under the pointer (else the nearest): the pointer is put on `about`, so
        // the destination does not depend on where a runner's mouse happens to rest
        await publish(page, 'space.reveal', { animate: false });
        await waitChromeShown(page);
        const revealed = await planeRect(page, about.planeID);
        await page.mouse.move(revealed.left + revealed.width / 2, revealed.top + revealed.height / 2);
        recording = await recordFrames(page);
        await page.keyboard.press('Escape');
        await settle(page);
        const back = await recording.stop();
        const first = back.findIndex((frame) => frame.motion === 'tween');
        // `>= 0` was a no-op: a findIndex of -1 means the swing never happened, which is the failure
        expect(first, 'Escape never started a swing: ' + motionRuns(back)).toBeGreaterThan(-1);
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
        let recording = await recordFrames(page);
        await clickLink(page, root.planeID, '/page-1/about');
        await settle(page);
        const again = await recording.stop();
        expect((await tree(page))[0].children[0].show).not.toBe(false);
        expect(await dockedID(page)).toBe(about.planeID);
        expect(again.some((frame) => frame.motion === 'tween')).toBe(true);
        expect(again.filter((frame) => !frame.docked || frame.toolbar === 'visible')).toEqual([]);

        // a page closed by its own control and re-opened by the link: the re-show swing (a retarget
        // after the measurement) keeps the chrome hidden and the motion in `tween` until it lands
        await page.locator(BACK).click();
        await settle(page);
        await publish(page, 'space.closePlane', { planeID: about.planeID, navigate: 'stay' });
        await page.waitForFunction(() => ((window as unknown as HarnessWindow).__rtTree()[0].children || []).every((child) => child.show === false));
        recording = await recordFrames(page);
        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        const reopened = await recording.stop();
        expect(await dockedID(page)).toBe(about.planeID);
        expect(reopened.some((frame) => frame.motion === 'tween')).toBe(true);
        expect(reopened.filter((frame) => !frame.docked || frame.toolbar === 'visible')).toEqual([]);
        const firstTween = reopened.findIndex((frame) => frame.motion === 'tween');
        const lastTween = reopened.length - 1 - [...reopened].reverse().findIndex((frame) => frame.motion === 'tween');
        expect(reopened.slice(firstTween, lastTween + 1).filter((frame) => frame.motion !== 'tween')).toEqual([]);
    });

    test('revealed, a link is a toggle again: clicking the open about link closes its page; clicking it once more re-opens it and docks', async ({ page }) => {
        await openFixture(page, 'page-docked');
        const root = (await tree(page))[0];
        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        const about = byRoute(await tree(page), '/about');
        expect(await dockedID(page)).toBe(about.planeID);

        await publish(page, 'space.reveal', { animate: false });
        await settle(page);
        expect(await dockedID(page)).toBeNull();
        await clickLink(page, root.planeID, '/page-1/about');
        await page.waitForFunction(() => ((window as unknown as HarnessWindow).__rtTree()[0].children || []).every((child) => child.show === false));
        await settle(page);
        expect(await page.locator(`[data-plurid-plane="${about.planeID}"]`).count()).toBe(0);
        expect(await dockedID(page)).toBeNull();

        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        expect(byRoute(await tree(page), '/about').show).not.toBe(false);
        expect(await dockedID(page)).toBe(about.planeID);
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
        const about = byRoute(await tree(page), '/about');
        const contact = byRoute(await tree(page), '/contact');
        const asideOf = (planeID: string) => page.evaluate((id) => {
            const element = document.querySelector(`[data-plurid-plane="${id}"]`) as HTMLElement;
            return { aside: element.getAttribute('data-plurid-aside'), opacity: getComputedStyle(element).opacity, pointer: getComputedStyle(element).pointerEvents };
        }, planeID);
        // docked on the site: both children are its lineage
        expect((await asideOf(about.planeID)).aside).toBeNull();
        expect((await asideOf(contact.planeID)).aside).toBeNull();

        const recording = await recordFrames(page);
        await clickLink(page, root.planeID, '/page-1/about');
        await settle(page);
        const swing = await recording.stop();
        expect(await dockedID(page)).toBe(about.planeID);
        const firstTween = swing.findIndex((frame) => frame.motion === 'tween');
        expect(firstTween, 'the link never started a swing: ' + motionRuns(swing)).toBeGreaterThan(-1);
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
        const recording = await recordFrames(page);
        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        const swing = await recording.stop();
        expect(swing.some((frame) => frame.motion === 'tween' && !frame.docked && frame.toolbar === 'visible')).toBe(true);
        expect(await dockedID(page)).toBe((await tree(page))[0].children[0].planeID);
        await waitChromeHidden(page);
    });

    test('docking.motion instant: a link, the back control and Escape jump; the reveal still swings', async ({ page }) => {
        await openFixture(page, 'page-docked', { extra: { ...SWING, dockMotion: 'instant' } });
        const root = (await tree(page))[0];
        let recording = await recordFrames(page);
        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        const about = (await tree(page))[0].children[0];
        const jump = await recording.stop();
        expect(jump.filter((frame) => frame.motion === 'tween')).toEqual([]);
        expect(jump.filter((frame) => frame.toolbar === 'visible')).toEqual([]);
        expect(await dockedID(page)).toBe(about.planeID);

        recording = await recordFrames(page);
        await page.locator(BACK).click();
        await settle(page);
        expect((await recording.stop()).filter((frame) => frame.motion === 'tween')).toEqual([]);
        expect(await dockedID(page)).toBe(root.planeID);

        // the reveal keeps its motion; Escape from it jumps
        recording = await recordFrames(page);
        await page.keyboard.press('KeyG');
        await settle(page);
        expect((await recording.stop()).some((frame) => frame.motion === 'tween')).toBe(true);
        recording = await recordFrames(page);
        await page.keyboard.press('Escape');
        await settle(page);
        expect((await recording.stop()).filter((frame) => frame.motion === 'tween')).toEqual([]);
        expect(await dockedID(page)).toBe(root.planeID);
    });

    test('G reveals the space in grab mode; Escape leaves grab and docks', async ({ page }) => {
        await openFixture(page, 'page-docked');
        const root = (await tree(page))[0];
        const grabMode = () => page.evaluate(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().ui.grabMode);

        await page.keyboard.press('KeyG');
        await settle(page);
        expect(await grabMode()).toBe(true);
        expect((await camera(page)).scale).toBeCloseTo((await revealPose(page)).scale as number, 6);
        expect(await dockedID(page)).toBeNull();

        await page.keyboard.press('Escape');
        await settle(page);
        expect(await grabMode()).toBe(false);
        expect(await dockedID(page)).toBe(root.planeID);
        expectIdentity(await camera(page));
    });

    test('a page brought in from the revealed space ends the grab: G is the door out again (2026-09-13)', async ({ page }) => {
        await openFixture(page, 'page-docked');
        const root = (await tree(page))[0];
        const grabMode = () => page.evaluate(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().ui.grabMode);

        // G opens the space...
        await page.keyboard.press('KeyG');
        await settle(page);
        expect(await grabMode()).toBe(true);
        expect(await dockedID(page)).toBeNull();

        // ...a link from there brings a page in: the space is no longer grabbed
        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        const about = (await tree(page))[0].children[0];
        expect(await dockedID(page)).toBe(about.planeID);
        expect(await grabMode()).toBe(false);

        // so G is the door OUT again, not a flag to toggle off
        await page.keyboard.press('KeyG');
        await settle(page);
        expect(await grabMode()).toBe(true);
        expect(await dockedID(page)).toBeNull();
        await waitChromeShown(page);

        // and the rail's page control ends it the same way: the landing is what counts
        await page.locator(TOGGLE).click();
        await settle(page);
        expect(await dockedID(page)).toBe(about.planeID);
        expect(await grabMode()).toBe(false);

        // the back control leaves the page for its parent, still ungrabbed
        await page.locator(BACK).click();
        await settle(page);
        expect(await dockedID(page)).toBe(root.planeID);
        expect(await grabMode()).toBe(false);
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
        await page.waitForFunction(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().space.viewSize.width === 900);
        await settle(page);
        await expect.poll(async () => (await planeRect(page, root.planeID)).width).toBe(900);
        expectFills(await planeRect(page, root.planeID), await viewRect(page));
        expect(await dockedID(page)).toBe(root.planeID);
        expectIdentity(await camera(page));
        expect((await spaceState(page)).motion).toBe('idle');
    });
    test('touch: a two-finger pinch undocks the page and shows the chrome; Escape docks it back', async ({ browser }) => {
        const context = await browser.newContext({ hasTouch: true, viewport: { width: 1000, height: 700 } });
        const page = await context.newPage();
        await openFixture(page, 'page-docked');
        const root = (await tree(page))[0];
        const view = await viewRect(page);
        const client = await context.newCDPSession(page);
        const cx = view.left + view.width / 2;
        const cy = view.top + view.height / 2;
        const fingers = (spread: number) => [{ x: cx - spread, y: cy, id: 1 }, { x: cx + spread, y: cy, id: 2 }];
        await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: fingers(200) });
        for (let step = 1; step <= 10; step += 1) {
            await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: fingers(200 - step * 12) });
        }
        await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await settle(page);
        expect((await camera(page)).scale).toBeLessThan(0.99);
        expect(await dockedID(page)).toBeNull();
        await waitChromeShown(page);

        await page.keyboard.press('Escape');
        await settle(page);
        expect(await dockedID(page)).toBe(root.planeID);
        await waitChromeHidden(page);
        await context.close();
    });

    test('the keyboard scrolls the docked page: PageDown, Space and the arrows move its content, never the camera; Space never grabs', async ({ page }) => {
        await openFixture(page, 'page-docked');
        const root = (await tree(page))[0];
        const before = await camera(page);
        const grabMode = () => page.evaluate(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().ui.grabMode);

        await page.keyboard.press('PageDown');
        const afterPageDown = await settledScrollTop(page, root.planeID);
        expect(afterPageDown).toBeGreaterThan(200);
        await page.keyboard.press('Space');
        const afterSpace = await settledScrollTop(page, root.planeID);
        expect(afterSpace).toBeGreaterThan(afterPageDown);
        expect(await grabMode()).toBe(false);
        await page.keyboard.press('ArrowDown');
        const afterArrow = await settledScrollTop(page, root.planeID);
        expect(afterArrow).toBeGreaterThan(afterSpace);
        await page.keyboard.press('ArrowUp');
        expect(await settledScrollTop(page, root.planeID)).toBeLessThan(afterArrow);
        await page.keyboard.press('Home');
        expect(await settledScrollTop(page, root.planeID)).toBe(0);
        expect(await camera(page)).toEqual(before);
        expect(await dockedID(page)).toBe(root.planeID);
    });

    test('?persist=1: a reload lands docked on the same page, its chrome hidden', async ({ page }) => {
        await openFixture(page, 'page-docked', { extra: { persist: '1', persistMs: '50' } });
        const root = (await tree(page))[0];
        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        const about = byRoute(await tree(page), '/about');
        expect(await dockedID(page)).toBe(about.planeID);
        await expect.poll(() => page.evaluate(() => Object.keys(localStorage).some((key) => /plurid/i.test(key)))).toBe(true);

        await page.reload();
        await waitForBoot(page);
        await settle(page);
        expect(await dockedID(page)).toBe(about.planeID);
        expectFills(await planeRect(page, about.planeID), await viewRect(page));
        expect(await visibleChrome(page)).toEqual([]);
    });

    test('a grandchild: the about page links on to contact; the back control and Escape walk up one page at a time, a root stays', async ({ page }) => {
        await openFixture(page, 'page-docked');
        const root = (await tree(page))[0];
        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        const about = byRoute(await tree(page), '/about');
        await clickLink(page, about.planeID, '/page-1/contact');
        await waitForChildren(page, about.planeID, 1);
        await settle(page);
        const contact = byRoute(await tree(page), '/contact');
        expect(contact.parentPlaneID).toBe(about.planeID);
        expect(await dockedID(page)).toBe(contact.planeID);
        await expect(page.locator(BACK)).toBeVisible();

        await page.locator(BACK).click();
        await settle(page);
        expect(await dockedID(page)).toBe(about.planeID);
        await page.locator(BACK).click();
        await settle(page);
        expect(await dockedID(page)).toBe(root.planeID);
        expect(await page.locator(BACK).count()).toBe(0);

        // by the keyboard: an open link navigates, two Escapes walk back up, a root does not move
        await clickLink(page, root.planeID, '/page-1/about');
        await settle(page);
        await clickLink(page, about.planeID, '/page-1/contact');
        await settle(page);
        expect(await dockedID(page)).toBe(contact.planeID);
        await page.keyboard.press('Escape');
        await settle(page);
        expect(await dockedID(page)).toBe(about.planeID);
        await page.keyboard.press('Escape');
        await settle(page);
        expect(await dockedID(page)).toBe(root.planeID);
        await page.keyboard.press('Escape');
        await settle(page);
        expect(await dockedID(page)).toBe(root.planeID);
        expectIdentity(await camera(page));
    });

    test('render slots on a page: a custom rail replaces the engine\'s; a custom viewcube leaves the rail in place', async ({ page }) => {
        await openFixture(page, 'page-docked', { extra: { slotDockRail: '1' } });
        await expect(page.locator('#rt-custom-dock-rail')).toBeVisible();
        expect(await page.locator('[data-plurid-rail]').count()).toBe(0);

        await openFixture(page, 'page-docked', { extra: { slotViewcube: '1' } });
        await expect(page.locator('#rt-custom-viewcube')).toBeVisible();
        await expect(page.locator(TOGGLE)).toBeVisible();
        expect(await page.locator('[data-plurid-entity="PluridViewcube"]').count()).toBe(0);
        await expect(page.locator('[data-plurid-rail]')).toBeAttached();
    });

    test('a resize mid-swing: the page still lands docked and view-sized', async ({ page }) => {
        await openFixture(page, 'page-docked', { extra: SWING });
        const root = (await tree(page))[0];
        await clickLink(page, root.planeID, '/page-1/about');
        await page.waitForFunction(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().space.motion === 'tween');
        await page.setViewportSize({ width: 900, height: 620 });
        await page.waitForFunction(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().space.viewSize.width === 900);
        await settle(page);
        const about = byRoute(await tree(page), '/about');
        expect(await dockedID(page)).toBe(about.planeID);
        // to a hundredth: a page at 90.1° renders through a rotation whose cosine is not exact
        await expect.poll(async () => Math.round((await planeRect(page, about.planeID)).width * 100) / 100).toBe(900);
        expectFills(await planeRect(page, about.planeID), await viewRect(page));
        expect((await camera(page)).scale).toBeCloseTo(1, 6);
        await waitChromeHidden(page);
    });

    test('docking.motion instant with a pending re-frame: a re-opened page still arrives in one jump', async ({ page }) => {
        await openFixture(page, 'page-docked', { extra: { ...SWING, dockMotion: 'instant' } });
        const root = (await tree(page))[0];
        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        const about = byRoute(await tree(page), '/about');
        await page.locator(BACK).click();
        await settle(page);
        await publish(page, 'space.closePlane', { planeID: about.planeID, navigate: 'stay' });
        await page.waitForFunction(() => ((window as unknown as HarnessWindow).__rtTree()[0].children || []).every((child) => child.show === false));

        const recording = await recordFrames(page);
        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        const frames = await recording.stop();
        expect(frames.filter((frame) => frame.motion === 'tween')).toEqual([]);
        expect(frames.filter((frame) => !frame.docked || frame.toolbar === 'visible')).toEqual([]);
        expect(await dockedID(page)).toBe(about.planeID);
    });

    test('three pages: a root-to-root dock lands on the other page and sets the rest aside (roots are not each other\'s lineage)', async ({ page }) => {
        await openFixture(page, 'page-docked', { extra: { pages: '3' } });
        const roots = await tree(page);
        expect(roots).toHaveLength(3);
        expect(await dockedID(page)).toBe(roots[0].planeID);

        await publish(page, 'space.dock', { planeID: roots[1].planeID });
        await settle(page);
        expect(await dockedID(page)).toBe(roots[1].planeID);
        expectFills(await planeRect(page, roots[1].planeID), await viewRect(page));
        const aside = (planeID: string) => page.evaluate((id) => document.querySelector(`[data-plurid-plane="${id}"]`)!.getAttribute('data-plurid-aside'), planeID);
        expect(await aside(roots[0].planeID)).toBe('true');
        expect(await aside(roots[2].planeID)).toBe('true');
        expect(await aside(roots[1].planeID)).toBeNull();
        await waitChromeHidden(page);
    });

    test('the host document never scrolls under a docked page\'s wheel: a long page scrolls its content, a short one consumes it', async ({ page }) => {
        await openFixture(page, 'page-docked');
        const root = (await tree(page))[0];
        const view = await viewRect(page);
        // a host document taller than the window: content below the application
        await page.evaluate(() => {
            const spacer = document.createElement('div');
            spacer.style.height = '3000px';
            document.body.appendChild(spacer);
        });
        expect(await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight)).toBe(true);
        await page.mouse.move(view.left + view.width / 2, view.top + view.height / 2);
        await page.mouse.wheel(0, 400);
        await expect.poll(() => scrollTop(page, root.planeID)).toBeGreaterThan(100);
        expect(await page.evaluate(() => window.scrollY)).toBe(0);

        await clickLink(page, root.planeID, '/page-1/contact');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        const before = await camera(page);
        await page.mouse.wheel(0, 400);
        await afterFrames(page, 16);
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
        expect(await camera(page)).toEqual(before);
    });

    test('the bar is the page\'s top: it hangs above the sheet and moves with it, clipped when the top leaves the view, never sliding', async ({ page }) => {
        await openFixture(page, 'page-docked');
        const root = (await tree(page))[0];
        const view = await viewRect(page);
        const barSelector = `[data-plurid-plane="${root.planeID}"] [data-plurid-entity="PluridPlaneControls"]`;
        await publish(page, 'space.reveal', { animate: false });
        await settle(page);
        await waitChromeShown(page);
        // the bar's place in the plane never changes: a fixed height above the sheet's top
        const barTop = () => page.evaluate((selector) => getComputedStyle(document.querySelector(selector)!).top, barSelector);
        const revealed = { sheet: await planeRect(page, root.planeID), bar: (await elementRect(page, barSelector))! };
        expect(await barTop()).toBe(`-${BAR}px`);
        expect(revealed.bar.top).toBeLessThan(revealed.sheet.top);

        // pan until the sheet's top is above the view: the bar goes with it (clipped), it does not slide inside
        await publish(page, 'space.cameraDelta', { pan: { x: 0, y: -(revealed.sheet.top + 120) }, animate: false });
        await settle(page);
        const panned = { sheet: await planeRect(page, root.planeID), bar: (await elementRect(page, barSelector))! };
        expect(await barTop()).toBe(`-${BAR}px`);
        expect(panned.sheet.top).toBeLessThan(view.top);
        expect(panned.bar.top).toBeLessThan(panned.sheet.top);
        expect(panned.bar.top + panned.bar.height).toBeLessThan(view.top + BAR);
        // about the same offset from the sheet as before the pan (a tilted sheet projects its bar a
        // few pixels taller or shorter as it moves in depth; sliding would be a 56 px difference)
        expect(Math.abs((panned.sheet.top - panned.bar.top) - (revealed.sheet.top - revealed.bar.top))).toBeLessThanOrEqual(8);
    });

    test('a grab drag across the page\'s prose orbits the space and never selects its text', async ({ page }) => {
        await openFixture(page, 'page-docked');
        const root = (await tree(page))[0];
        await publish(page, 'space.reveal', { animate: false });
        await settle(page);
        await page.locator('[data-plurid-entity="PluridView"]').focus();
        await page.keyboard.press('KeyG');
        const before = await camera(page);
        const sheet = await planeRect(page, root.planeID);
        const from = { x: sheet.left + sheet.width * 0.4, y: sheet.top + sheet.height * 0.5 };
        await page.mouse.move(from.x, from.y);
        await page.mouse.down();
        for (let step = 1; step <= 10; step += 1) {
            await page.mouse.move(from.x + step * 14, from.y + step * 3);
        }
        await page.mouse.up();
        await settle(page);
        expect((await camera(page)).yaw).not.toBeCloseTo(before.yaw, 1);
        expect(await page.evaluate(() => String(window.getSelection()))).toBe('');
        // one grab: the release ended it; the space stays revealed until Escape docks
        expect(await page.evaluate(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().ui.grabMode)).toBe(false);
        expect(await dockedID(page)).toBeNull();

        // grab off: an orbit that starts on the EMPTY space around the page and crosses its prose
        // never selects it either (the user's report, 2026-09-06)
        const afterGrab = await camera(page);
        const revealedSheet = await planeRect(page, root.planeID);
        const outside = { x: Math.max(8, revealedSheet.left - 40), y: revealedSheet.top + revealedSheet.height * 0.5 };
        expect(outside.x).toBeLessThan(revealedSheet.left);
        await page.mouse.move(outside.x, outside.y);
        await page.mouse.down();
        for (let step = 1; step <= 14; step += 1) {
            await page.mouse.move(outside.x + step * 40, outside.y + step * 2);
        }
        await page.mouse.up();
        await settle(page);
        expect((await camera(page)).yaw).not.toBeCloseTo(afterGrab.yaw, 1);
        expect(await page.evaluate(() => String(window.getSelection()))).toBe('');

        await page.keyboard.press('Escape');
        await settle(page);
        expect(await dockedID(page)).toBe(root.planeID);
    });

    test('Space held on the revealed page grabs from inside its prose: the drag orbits, no selection; docked, Space scrolls', async ({ page }) => {
        await openFixture(page, 'page-docked');
        const root = (await tree(page))[0];
        await publish(page, 'space.reveal', { animate: false });
        await settle(page);
        // the page's scroller still has the focus after the reveal
        expect(await page.evaluate((content) => document.activeElement?.matches(content) ?? false, CONTENT)).toBe(true);
        const before = await camera(page);
        const sheet = await planeRect(page, root.planeID);
        const from = { x: sheet.left + sheet.width * 0.4, y: sheet.top + sheet.height * 0.5 };
        await page.keyboard.down('Space');
        await expect.poll(() => page.evaluate(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().ui.grabHold)).toBe(true);
        await page.mouse.move(from.x, from.y);
        await page.mouse.down();
        for (let step = 1; step <= 10; step += 1) {
            await page.mouse.move(from.x + step * 14, from.y + step * 3);
        }
        await page.mouse.up();
        await page.keyboard.up('Space');
        await settle(page);
        expect((await camera(page)).yaw).not.toBeCloseTo(before.yaw, 1);
        expect(await page.evaluate(() => String(window.getSelection()))).toBe('');
        expect(await scrollTop(page, root.planeID)).toBe(0);
        expect(await page.evaluate(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().ui.grabHold)).toBe(false);
    });

    test('with prefers-reduced-motion: a link lands docked in one commit and the chrome never shows; the reveal is instant too', async ({ browser }) => {
        const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } });
        const page = await context.newPage();
        await openFixture(page, 'page-docked', { extra: SWING });
        expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
        const root = (await tree(page))[0];
        const recording = await recordFrames(page);
        await clickLink(page, root.planeID, '/page-1/about');
        await waitForChildren(page, root.planeID, 1);
        await settle(page);
        const frames = await recording.stop();
        expect(motionRuns(frames)).not.toContain('tween');
        expect(frames.filter((frame) => frame.toolbar === 'visible')).toEqual([]);
        expect(await dockedID(page)).toBe(byRoute(await tree(page), '/about').planeID);

        await page.keyboard.press('KeyG');
        await settle(page);
        expect(await dockedID(page)).toBeNull();
        await waitChromeShown(page);
        await context.close();
    });
});
