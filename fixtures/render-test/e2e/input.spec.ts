import {
    test,
    expect,
} from '@playwright/test';

import {
    openHarness,
    camera,
    settle,
    spaceState,
    publish,
    viewRect,
    dispatches,
    waitForBoot,
    waitForState,
    waitQuiet,
    afterFrames,
    flick,
    travelUntilIdle,
} from './helpers';


const drag = async (
    page: import('@playwright/test').Page,
    from: { x: number; y: number },
    to: { x: number; y: number },
    options: { button?: 'left' | 'middle' | 'right'; steps?: number; modifiers?: string[] } = {},
) => {
    for (const modifier of options.modifiers || []) {
        await page.keyboard.down(modifier);
    }
    await page.mouse.move(from.x, from.y);
    await page.mouse.down({ button: options.button || 'left' });
    // cross the 4 px drag threshold first (that movement is consumed), then the real drag
    await page.mouse.move(from.x + 4, from.y);
    await page.mouse.move(to.x + 4, to.y, { steps: options.steps ?? 10 });
    await page.mouse.up({ button: options.button || 'left' });
    for (const modifier of options.modifiers || []) {
        await page.keyboard.up(modifier);
    }
};


test.describe('input layer', () => {
    test('a left drag on empty space orbits with the pivot fixed on screen, one commit per frame', async ({ page }) => {
        await openHarness(page, '?momentum=0');
        const rect = await viewRect(page);
        // empty space: below the planes
        // empty space in the bottom band, clear of the toolbar (center) and the viewcube (right)
        const start = { x: rect.left + 120, y: rect.top + rect.height - 60 };
        const before = await camera(page);
        const dispatchesBefore = await dispatches(page);
        const framesBefore = await page.evaluate(() => (window as any).__rtPerf.frames);

        await drag(page, start, { x: start.x + 150, y: start.y }, { steps: 40 });

        const after = await camera(page);
        expect(after.yaw).toBeGreaterThan(before.yaw + 20);
        expect(after.pitch).toBeCloseTo(before.pitch, 3);
        const committed = await dispatches(page) - dispatchesBefore;
        const frames = await page.evaluate(() => (window as any).__rtPerf.frames) - framesBefore;
        // pivot + per-frame commits, never per-event (40 moves)
        expect(committed).toBeLessThanOrEqual(frames + 3);
    });

    test('a left drag over a plane is the page\'s; grab mode makes it orbit', async ({ page }) => {
        await openHarness(page, '?momentum=0');
        const planeBox = await page.locator('[data-plurid-plane]').first().boundingBox();
        expect(planeBox).not.toBeNull();
        const inside = { x: planeBox!.x + planeBox!.width / 2, y: planeBox!.y + planeBox!.height - 40 };

        const before = await camera(page);
        await drag(page, inside, { x: inside.x + 120, y: inside.y }, { steps: 10 });
        expect((await camera(page)).yaw).toBeCloseTo(before.yaw, 6);

        await page.locator('[data-plurid-entity="PluridView"]').focus();
        await page.keyboard.press('g');
        // in grab mode the press is the space's: the drag across the plane's text orbits and never selects
        const contentSelect = () => page.evaluate(() => getComputedStyle(document.querySelector('[data-plurid-entity="PluridPlaneContent"]')!).userSelect);
        expect(await page.evaluate(() => document.querySelector('[data-plurid-entity="PluridView"]')!.getAttribute('data-plurid-navigating'))).toBe('grab');
        expect(await contentSelect()).toBe('none');
        await drag(page, inside, { x: inside.x + 120, y: inside.y }, { steps: 10 });
        expect((await camera(page)).yaw).toBeGreaterThan(before.yaw + 10);
        expect(await page.evaluate(() => String(window.getSelection()))).toBe('');
        // G arms one grab: the release ended it, the page is a page again
        expect(await page.evaluate(() => (window as any).__pluridApi.getSnapshot().ui.grabMode)).toBe(false);
        expect(await page.evaluate(() => document.querySelector('[data-plurid-entity="PluridView"]')!.hasAttribute('data-plurid-navigating'))).toBe(false);
        expect(await contentSelect()).not.toBe('none');
        // a second drag is the page's again
        const afterGrab = await camera(page);
        await drag(page, inside, { x: inside.x + 120, y: inside.y }, { steps: 10 });
        expect((await camera(page)).yaw).toBeCloseTo(afterGrab.yaw, 6);
    });

    test('right-drag pans and suppresses the context menu, a plain right-click keeps it', async ({ page }) => {
        await openHarness(page, '?momentum=0');
        const rect = await viewRect(page);
        // empty space in the bottom band, clear of the toolbar (center) and the viewcube (right)
        const start = { x: rect.left + 120, y: rect.top + rect.height - 60 };
        await page.evaluate(() => {
            (window as any).__rtMenus = 0;
            document.addEventListener('contextmenu', (event) => {
                if (!event.defaultPrevented) { (window as any).__rtMenus += 1; }
            });
        });

        const before = await camera(page);
        await drag(page, start, { x: start.x + 80, y: start.y + 30 }, { button: 'right', steps: 8 });
        const after = await camera(page);
        expect(after.offset.x - before.offset.x).toBeCloseTo(80, 0);
        expect(after.offset.y - before.offset.y).toBeCloseTo(30, 0);
        expect(await page.evaluate(() => (window as any).__rtMenus)).toBe(0);

        // over plane content the right button is the page's: its context menu opens
        const planeBox = (await page.locator('[data-plurid-plane]').first().boundingBox())!;
        await page.mouse.click(planeBox.x + planeBox.width / 2, planeBox.y + planeBox.height - 40, { button: 'right' });
        expect(await page.evaluate(() => (window as any).__rtMenus)).toBe(1);
        expect((await camera(page)).offset.x).toBeCloseTo(after.offset.x, 6);
    });

    test('a flick flings and comes to rest; a pause before release does not; the wheel stops a fling', async ({ page }) => {
        await openHarness(page);
        const rect = await viewRect(page);
        const start = { x: rect.left + 120, y: rect.top + rect.height - 60 };

        // THE RELEASE CARRIES VELOCITY: the camera keeps turning after the pointer is up, and the
        // turning decays to rest on its own. How FAR it gets is the machine's business; that it
        // travelled and then stopped is the engine's.
        await flick(page, start, { x: start.x + 250, y: start.y });
        await waitForState(page, (state) => state.space.motion === 'fling', 'the release to start a fling');
        const travelled = await travelUntilIdle(page, 'yaw');
        expect(travelled).toBeGreaterThan(0.5);

        // and rest means rest
        const settled = await camera(page);
        await afterFrames(page, 10);
        expect((await camera(page)).yaw).toBeCloseTo(settled.yaw, 6);

        // A PAUSE BEFORE RELEASE IS A STOP: the finger was still, so nothing is thrown
        await flick(page, start, { x: start.x + 200, y: start.y }, { pauseBeforeRelease: true });
        const paused = await camera(page);
        expect(await spaceState(page).then((s) => s.motion)).toBe('idle');
        await afterFrames(page, 10);
        expect((await camera(page)).yaw).toBeCloseTo(paused.yaw, 6);

        // A WHEEL DURING A FLING STOPS IT
        await flick(page, start, { x: start.x + 250, y: start.y });
        await waitForState(page, (state) => state.space.motion === 'fling', 'the second release to fling');
        await page.keyboard.down('Control');
        await page.mouse.wheel(0, -50);
        await page.keyboard.up('Control');
        await waitForState(page, (state) => state.space.motion === 'idle', 'the wheel to stop the fling');
    });

    test('touch: one finger on empty space orbits, two fingers pinch-zoom and pan', async ({ browser }) => {
        const context = await browser.newContext({ hasTouch: true, viewport: { width: 1000, height: 700 } });
        const page = await context.newPage();
        await openHarness(page, '?momentum=0');
        const rect = await viewRect(page);
        const before = await camera(page);

        // one finger on empty space → orbit (dispatched through the CDP touch API)
        const client = await context.newCDPSession(page);
        // empty space: bottom-left, clear of the centered first plane, the shortcuts trigger and the toolbar
        const y = rect.top + rect.height - 140;
        const x0 = rect.left + 140;
        const touch = async (type: 'touchStart' | 'touchMove' | 'touchEnd', points: { x: number; y: number; id: number }[]) => {
            await client.send('Input.dispatchTouchEvent', { type, touchPoints: points });
        };
        await touch('touchStart', [{ x: x0, y, id: 1 }]);
        for (let step = 1; step <= 10; step += 1) {
            await touch('touchMove', [{ x: x0 + step * 12, y, id: 1 }]);
        }
        await touch('touchEnd', []);
        const orbited = await camera(page);
        expect(orbited.yaw).toBeGreaterThan(before.yaw + 5);

        // two fingers → pinch out (zoom in) about the midpoint + a small pan
        const scaleBefore = orbited.scale;
        await touch('touchStart', [{ x: x0 - 40, y, id: 1 }, { x: x0 + 40, y, id: 2 }]);
        for (let step = 1; step <= 8; step += 1) {
            await touch('touchMove', [{ x: x0 - 40 - step * 10, y: y - step, id: 1 }, { x: x0 + 40 + step * 10, y: y - step, id: 2 }]);
        }
        await touch('touchEnd', []);
        const pinched = await camera(page);
        expect(pinched.scale).toBeGreaterThan(scaleBefore * 1.5);
        expect(pinched.offset.y).toBeLessThan(orbited.offset.y);
        await context.close();
    });

    test('typing in an editor never navigates; ? opens a dialog that traps focus and Esc closes it', async ({ page }) => {
        await openHarness(page);
        await page.evaluate(() => {
            const editor = document.createElement('div');
            editor.id = 'rt-editor';
            editor.contentEditable = 'true';
            editor.style.cssText = 'position:fixed;top:120px;left:600px;width:200px;height:40px;background:#fff;color:#000;z-index:99999';
            const view = document.querySelector('[data-plurid-entity="PluridView"]') as HTMLElement;
            view.appendChild(editor);
        });
        await publish(page, 'configuration', { space: { firstPerson: true } });
        await waitForState(page, (state) => state.configuration.space.firstPerson === true, 'first person to turn on');
        const before = await camera(page);
        await page.locator('#rt-editor').click();
        await page.keyboard.type('wasdg?');
        // the fly loop runs on animation frames: if typing had moved the camera, these would show it
        await afterFrames(page, 10);
        const after = await camera(page);
        expect(after.offset).toEqual(before.offset);
        expect(await page.evaluate(() => (window as any).__pluridApi.getSnapshot().ui.grabMode)).toBe(false);
        expect(await page.evaluate(() => (window as any).__pluridApi.getSnapshot().ui.shortcutsOverlayVisible)).toBe(false);
        expect(await page.locator('#rt-editor').innerText()).toBe('wasdg?');
        await publish(page, 'configuration', { space: { firstPerson: false } });

        await page.locator('[data-plurid-entity="PluridView"]').focus();
        await page.keyboard.press('Shift+/');
        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible();
        expect(await page.evaluate(() => document.activeElement?.getAttribute('role'))).toBe('dialog');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        const insideDialog = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'));
        expect(insideDialog).toBe(true);
        await page.keyboard.press('Escape');
        await expect(dialog).toHaveCount(0);
    });

    test('first person tilts the horizon: Z / C roll the view, the cube leans with it, and a fit puts it back', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1&momentum=0');
        await publish(page, 'configuration', { space: { firstPerson: true } });
        await page.locator('[data-plurid-entity="PluridView"]').focus();
        expect((await camera(page)).roll).toBe(0);

        // the horizon is a held key, like every other fly control
        await page.keyboard.down('KeyC');
        await expect.poll(async () => (await camera(page)).roll).toBeGreaterThan(2);
        await page.keyboard.up('KeyC');
        const tilted = (await camera(page)).roll;

        // the rendered matrix carries it: the roots container is no longer axis-aligned
        const matrix = await page.evaluate(() => getComputedStyle(
            document.querySelector('[data-plurid-entity="PluridRoots"]') as HTMLElement,
        ).transform);
        const [a, b] = matrix.replace(/^matrix(3d)?\(/, '').split(',').map(Number);
        expect(Math.abs(b)).toBeGreaterThan(0.01);
        expect(a).toBeLessThan(1);

        // the other way takes it back toward level
        await page.keyboard.down('KeyZ');
        await expect.poll(async () => (await camera(page)).roll).toBeLessThan(tilted - 1);
        await page.keyboard.up('KeyZ');

        // a framing lands LEVEL — the way out of a rolled view
        await publish(page, 'configuration', { space: { firstPerson: false } });
        await page.locator('[data-plurid-entity="PluridView"]').focus();
        await page.keyboard.press('Digit0');
        await settle(page);
        expect((await camera(page)).roll).toBe(0);
    });

    test('a tilted horizon travels: the viewpoint is written as v3 and restores the tilt', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1&momentum=0&vpURL=1');
        await publish(page, 'space.cameraDelta', { absolute: { roll: 30, yaw: 15 } });
        await settle(page);

        const encoded = await page.evaluate(() => (window as any).__rtViewpoint2());
        expect(encoded.startsWith('v3|')).toBe(true);

        await page.goto('/?reducedMotion=1&momentum=0&viewpoint=' + encodeURIComponent(encoded));
        await waitForBoot(page);
        await expect.poll(async () => (await camera(page)).roll).toBeCloseTo(30, 1);
        expect((await camera(page)).yaw).toBeCloseTo(15, 1);
    });

    test('a drag-move of a selected plane is one undo entry and keeps the history status current', async ({ page }) => {
        await openHarness(page, '?momentum=0');
        const plane = page.locator('[data-plurid-plane]').first();
        const box = (await plane.boundingBox())!;
        const inside = { x: box.x + box.width / 2, y: box.y + box.height - 40 };
        // `page.mouse.click` has no modifiers option — hold Shift on the keyboard around it
        await page.keyboard.down('Shift');
        await page.mouse.click(inside.x, inside.y);
        await page.keyboard.up('Shift');
        expect(await spaceState(page).then((s) => s.selectedPlaneIDs.length)).toBe(1);

        // a drag on the CONTENT of a selected plane is the page's: the plane stays, and the text is
        // still the reader's to select (it used to take the card along, and the selection with it)
        await drag(page, inside, { x: inside.x + 90, y: inside.y }, { steps: 10 });
        expect((await spaceState(page)).tree[0].location.translateX).toBeCloseTo(0, 1);
        expect(await page.evaluate(() => getComputedStyle(document.querySelector('[data-plurid-entity="PluridPlaneContent"]')!).userSelect)).not.toBe('none');

        // the controls bar is the plane's handle
        const bar = (await plane.locator('[data-plurid-entity="PluridPlaneControls"]').first().boundingBox())!;
        const handle = { x: bar.x + bar.width / 2, y: bar.y + bar.height / 2 };
        const historyBefore = await spaceState(page).then((s) => s.history);
        await drag(page, handle, { x: handle.x + 90, y: handle.y + 20 }, { steps: 30 });
        const state = await spaceState(page);
        expect(state.history.undoDepth).toBe(historyBefore.undoDepth + 1);
        expect(state.history.canUndo).toBe(true);
        expect(state.tree[0].location.translateX).toBeGreaterThan(50);

        await publish(page, 'space.undo');
        const undone = await spaceState(page);
        expect(undone.tree[0].location.translateX).toBeCloseTo(0, 1);
        expect(undone.history.canRedo).toBe(true);
    });

    test('select all, then a plain click on empty space clears the selection; Escape too', async ({ page }) => {
        await openHarness(page, '?momentum=0&reducedMotion=1');
        const rect = await viewRect(page);
        await page.mouse.move(rect.left + 120, rect.top + rect.height - 60);
        await page.mouse.click(rect.left + 120, rect.top + rect.height - 60);
        const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
        const selected = () => spaceState(page).then((state) => state.selectedPlaneIDs.length);

        await page.keyboard.press(`${modifier}+KeyA`);
        await expect.poll(selected, { message: 'select all' }).toBe(5);

        await page.mouse.click(rect.left + 120, rect.top + rect.height - 60);
        await expect.poll(selected, { message: 'a plain click on empty space clears' }).toBe(0);

        await page.keyboard.press(`${modifier}+KeyA`);
        await expect.poll(selected, { message: 'select all again' }).toBe(5);
        await page.keyboard.press('Escape');
        await expect.poll(selected, { message: 'Escape clears' }).toBe(0);
    });

});
