import {
    test,
    expect,
    Page,
} from '@playwright/test';

import {
    openHarness,
    camera,
    spaceState,
    publish,
    viewRect,
} from './helpers';


const tree = (page: Page) => page.evaluate(() => (window as any).__rtTree());

/** A plane's computed (possibly mid-transition) transform matrix, as numbers. */
const computedTransform = (page: Page, planeID: string) => page.evaluate((id) => {
    const element = document.querySelector(`[data-plurid-plane="${id}"]`) as HTMLElement;
    const value = getComputedStyle(element).transform;
    return value.replace(/^matrix(3d)?\(/, '').replace(/\)$/, '').split(',').map(Number);
}, planeID);

const styledTransform = (page: Page, planeID: string) => page.evaluate((id) => {
    const element = document.querySelector(`[data-plurid-plane="${id}"]`) as HTMLElement;
    return element.style.transform;
}, planeID);

const sameMatrix = (a: number[], b: number[], tolerance = 0.5) => (
    a.length === b.length && a.every((value, index) => Math.abs(value - b[index]) <= tolerance)
);


test.describe('navigation feel', () => {
    test('an animated absolute yaw from 170 to -170 takes the short way round and lands exactly', async ({ page }) => {
        await openHarness(page);
        await publish(page, 'space.cameraDelta', { absolute: { yaw: 170 } });
        expect((await camera(page)).yaw).toBeCloseTo(170, 6);

        await publish(page, 'space.cameraDelta', { absolute: { yaw: -170 }, animate: true });
        await page.waitForTimeout(120);
        const midway = await camera(page);
        // through ±180, never back through 0
        expect(Math.abs(midway.yaw)).toBeGreaterThan(170);
        expect((await spaceState(page)).motion).toBe('tween');

        await page.waitForTimeout(600);
        const landed = await camera(page);
        expect(landed.yaw).toBeCloseTo(-170, 6);
        expect((await spaceState(page)).motion).toBe('idle');
    });

    test('home, presets and bookmarks through the pubsub', async ({ page }) => {
        await openHarness(page, '?presets=1&home=0,30,0,0,0,1&reducedMotion=1');

        await publish(page, 'space.preset', { name: 'side' });
        expect((await camera(page)).yaw).toBeCloseTo(90, 6);

        await publish(page, 'space.home');
        expect((await camera(page)).yaw).toBeCloseTo(30, 6);
        expect((await camera(page)).pitch).toBeCloseTo(0, 6);

        await publish(page, 'space.cameraDelta', { absolute: { yaw: -40, pitch: 15 } });
        await publish(page, 'space.bookmark', { name: 'desk', action: 'save' });
        const saved = (await spaceState(page)).bookmarks.desk;
        expect(saved).toMatch(/^v2\|/);

        await publish(page, 'space.setHome');
        await publish(page, 'space.preset', { name: 'top' });
        expect((await camera(page)).pitch).toBeCloseTo(80, 6);

        await publish(page, 'space.bookmark', { name: 'desk' });
        expect((await camera(page)).yaw).toBeCloseTo(-40, 2);
        expect((await camera(page)).pitch).toBeCloseTo(15, 2);

        await publish(page, 'space.preset', { name: 'front' });
        await publish(page, 'space.home');
        expect((await camera(page)).yaw).toBeCloseTo(-40, 2);

        await publish(page, 'space.bookmark', { name: 'desk', action: 'remove' });
        expect((await spaceState(page)).bookmarks.desk).toBeUndefined();
    });

    test('the Home key returns to the home viewpoint', async ({ page }) => {
        await openHarness(page, '?home=0,25,0,0,0,1&reducedMotion=1');
        const rect = await viewRect(page);
        // focus the view on empty space (bottom-left corner is clear of planes and overlays)
        await page.mouse.click(rect.left + 40, rect.top + rect.height - 120);
        await publish(page, 'space.cameraDelta', { absolute: { yaw: 0 } });
        await page.keyboard.press('Home');
        await page.waitForTimeout(50);
        expect((await camera(page)).yaw).toBeCloseTo(25, 6);
    });

    test('a layout switch glides the planes and keeps spawned children attached', async ({ page }) => {
        await openHarness(page);
        const roots = await tree(page);
        const geometry = roots.find((node: any) => node.route.endsWith('/geometry'));
        await page.evaluate((id) => {
            const link = document.querySelector(`[data-plurid-plane="${id}"] [data-plurid-link-route$="/geometry/detail"]`) as HTMLElement;
            link.click();
        }, geometry.planeID);
        await page.waitForFunction((id) => {
            const root = (window as any).__rtTree().find((node: any) => node.planeID === id);
            return root && root.children && root.children.length === 1;
        }, geometry.planeID);
        await page.waitForTimeout(600);
        const child = (await tree(page)).find((node: any) => node.planeID === geometry.planeID).children[0];
        const mover = roots[roots.length - 1];
        const before = await computedTransform(page, mover.planeID);

        await page.getByRole('button', { name: 'ROWS' }).click();
        await page.waitForFunction(() => (window as any).__pluridApi.getSnapshot().space.layoutTransition > 0);
        await page.waitForTimeout(100);
        const midway = await computedTransform(page, mover.planeID);
        const target = await styledTransform(page, mover.planeID);
        expect(sameMatrix(midway, before)).toBe(false);
        // mid-flight: the computed matrix is not yet the styled target
        const targetNow = await page.evaluate(({ id }) => {
            const element = document.querySelector(`[data-plurid-plane="${id}"]`) as HTMLElement;
            const probe = document.createElement('div');
            probe.style.transform = element.style.transform;
            document.body.appendChild(probe);
            const value = getComputedStyle(probe).transform;
            probe.remove();
            return value.replace(/^matrix(3d)?\(/, '').replace(/\)$/, '').split(',').map(Number);
        }, { id: mover.planeID });
        expect(sameMatrix(midway, targetNow)).toBe(false);

        await page.waitForFunction(() => (window as any).__pluridApi.getSnapshot().space.layoutTransition === 0);
        await page.waitForTimeout(50);
        const landed = await computedTransform(page, mover.planeID);
        expect(sameMatrix(landed, targetNow, 1)).toBe(true);
        expect(target.length).toBeGreaterThan(0);

        // the child rode along, same id, still under its parent
        const after = (await tree(page)).find((node: any) => node.planeID === geometry.planeID);
        expect(after.children).toHaveLength(1);
        expect(after.children[0].planeID).toBe(child.planeID);
        expect(await page.locator(`[data-plurid-plane="${child.planeID}"]`).count()).toBe(1);
    });

    test('double-click frames the plane', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1&momentum=0');
        const roots = await tree(page);
        // a root whose box is inside the viewport (the columns layout wraps to a second row)
        const viewport = page.viewportSize()!;
        let plane: any;
        let box: { x: number; y: number; width: number; height: number } | null = null;
        for (const candidate of roots) {
            const candidateBox = await page.locator(`[data-plurid-plane="${candidate.planeID}"]`).boundingBox();
            if (candidateBox && candidateBox.x > 0 && candidateBox.y + candidateBox.height < viewport.height) {
                plane = candidate;
                box = candidateBox;
                break;
            }
        }
        expect(box).not.toBeNull();
        await page.mouse.dblclick(box!.x + box!.width / 2, box!.y + box!.height / 2);
        await page.waitForTimeout(100);
        const framed = await camera(page);
        expect(framed.pivot.x).toBeCloseTo(plane.location.translateX + plane.width / 2, 0);
        expect(framed.pivot.y).toBeCloseTo(plane.location.translateY + plane.height / 2, 0);
    });

    test('a gamepad stick orbits when enabled', async ({ page }) => {
        await page.addInitScript(() => {
            const button = { pressed: false, touched: false, value: 0 };
            const pad = {
                id: 'stub', index: 0, connected: true, mapping: 'standard', timestamp: 0,
                axes: [0, 0, 0.8, 0],
                buttons: Array.from({ length: 17 }, () => button),
            };
            (navigator as any).getGamepads = () => [pad];
        });
        await openHarness(page, '?gamepad=1&momentum=0');
        await page.waitForTimeout(300);
        expect((await camera(page)).yaw).toBeGreaterThan(5);

        await page.evaluate(() => {
            (navigator as any).getGamepads = () => [];
        });
        await page.waitForTimeout(100);
        const stopped = await camera(page);
        await page.waitForTimeout(150);
        expect((await camera(page)).yaw).toBeCloseTo(stopped.yaw, 6);
    });

    test('a drag interrupts a navigation tween where it is, without a snap', async ({ page }) => {
        await openHarness(page, '?momentum=0');
        const roots = await tree(page);
        await publish(page, 'space.frame', { planeID: roots[roots.length - 1].planeID, animate: true });
        await page.waitForTimeout(120);
        const midway = await camera(page);
        expect((await spaceState(page)).motion).toBe('tween');

        const rect = await viewRect(page);
        const start = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        await page.mouse.move(start.x, start.y);
        await page.mouse.down({ button: 'middle' });
        await page.mouse.move(start.x + 4, start.y);
        await page.mouse.move(start.x + 64, start.y, { steps: 6 });
        await page.mouse.up({ button: 'middle' });
        await page.waitForTimeout(500);

        const after = await camera(page);
        expect((await spaceState(page)).motion).toBe('idle');
        // the pan applied from the interrupted pose; the tween did not resume or jump to its target
        expect(after.scale).toBeCloseTo(midway.scale, 1);
        expect(Math.abs(after.pivot.x - midway.pivot.x)).toBeLessThan(80);
        expect(after.offset.x - midway.offset.x).toBeGreaterThan(30);
    });

    test('an empty space renders the empty state', async ({ page }) => {
        await page.goto('/?empty=1');
        await page.waitForFunction(() => typeof (window as any).__rtCamera === 'function');
        await expect(page.locator('[data-plurid-entity="PluridEmpty"]')).toBeVisible();
        expect(await page.locator('[data-plurid-plane]').count()).toBe(0);
    });
});
