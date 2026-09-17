import {
    test,
    expect,
} from '@playwright/test';

import {
    collectConsoleErrors,
    openFixture,
    planeByRoute,
    shownPlanes,
    spaceState,
    tree,
} from './helpers';
import { FIXTURES } from '../src/fixtures/catalog';


/**
 * THE GENERIC INVARIANTS, for every fixture of the catalog: it boots without console errors, every
 * shown plane is measured, a declared size is the plane's DOM box, the roots of a grid layout do
 * not overlap in world X/Y, the minimap shows one dot per shown plane, every on-screen link is hit
 * by itself, and the space settles. Fixture-specific behavior lives in the other specs.
 */
test.describe('fixtures', () => {
    for (const fixture of FIXTURES) {
        test(`${fixture.name}: boots clean, measures, packs, links hit, settles`, async ({ page }) => {
            const errors = collectConsoleErrors(page);
            await openFixture(page, fixture.name);
            const roots = await tree(page);
            const shown = shownPlanes(roots);

            if (fixture.expect?.planes !== undefined) {
                expect(shown.length).toBe(fixture.expect.planes);
            }
            for (const plane of shown) {
                expect(plane.width, plane.planeID).toBeGreaterThan(0);
                expect(plane.height, plane.planeID).toBeGreaterThan(0);
            }

            // a declared size IS the plane's box
            const declared: { route: string; width?: number; height?: number }[] = await page.evaluate(() => (window as any).__rtPlanes());
            if (fixture.expect?.declaredSizes) {
                expect(declared.length).toBeGreaterThan(0);
            }
            for (const declaration of declared) {
                const plane = shown.find((node) => String(node.route).endsWith(declaration.route));
                expect(plane, declaration.route).toBeTruthy();
                expect(plane.sizeMode).toBe('declared');
                const box = await page.evaluate((id) => {
                    const element = document.querySelector(`[data-plurid-plane="${id}"]`) as HTMLElement;
                    return { width: element.offsetWidth, height: element.offsetHeight };
                }, plane.planeID);
                if (declaration.width) {
                    expect(plane.width).toBe(declaration.width);
                    expect(box.width).toBe(declaration.width);
                }
                if (declaration.height) {
                    expect(plane.height).toBe(declaration.height);
                    expect(box.height).toBe(declaration.height);
                }
            }

            // the roots of a grid layout never overlap in world X/Y
            if ((fixture.expect?.overlap ?? 'none') === 'none') {
                const boxes = roots.filter((node: any) => node.show !== false).map((node: any) => ({
                    id: node.planeID,
                    left: node.location.translateX, top: node.location.translateY,
                    right: node.location.translateX + node.width, bottom: node.location.translateY + node.height,
                }));
                for (let a = 0; a < boxes.length; a += 1) {
                    for (let b = a + 1; b < boxes.length; b += 1) {
                        const overlaps = boxes[a].left < boxes[b].right - 1 && boxes[b].left < boxes[a].right - 1
                            && boxes[a].top < boxes[b].bottom - 1 && boxes[b].top < boxes[a].bottom - 1;
                        expect(overlaps, boxes[a].id + ' overlaps ' + boxes[b].id).toBe(false);
                    }
                }
            }

            // the minimap: one dot per shown plane
            if (fixture.expect?.minimap !== false) {
                expect(await page.locator('[data-plurid-minimap-plane]').count()).toBe(shown.length);
            }

            // every on-screen link is hit by itself at the primary viewpoint
            if (fixture.expect?.links !== false) {
                const misses = await page.evaluate(() => {
                    const misses: string[] = [];
                    for (const link of Array.from(document.querySelectorAll('[data-plurid-link-route]'))) {
                        const rect = link.getBoundingClientRect();
                        const x = rect.left + rect.width / 2;
                        const y = rect.top + rect.height / 2;
                        if (rect.width < 4 || x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
                        // a link scrolled out of its plane's content (a declared height it does not
                        // fit in) is clipped: not a hit-test question
                        let clipped = false;
                        for (let ancestor = link.parentElement; ancestor && !clipped; ancestor = ancestor.parentElement) {
                            const overflow = getComputedStyle(ancestor).overflow;
                            if (overflow === 'visible') continue;
                            const box = ancestor.getBoundingClientRect();
                            clipped = x < box.left || x > box.right || y < box.top || y > box.bottom;
                            if (ancestor.hasAttribute('data-plurid-plane')) break;
                        }
                        if (clipped) continue;
                        const top = document.elementFromPoint(x, y);
                        // chrome (the minimap, the toolbar, the viewcube, a control) legitimately floats over content
                        if (top && top.closest('[data-plurid-entity="PluridMinimap"], [data-plurid-entity="PluridToolbar"], [data-plurid-entity="PluridViewcube"], [data-plurid-control]')) continue;
                        if (!top || top.closest('[data-plurid-link-route]') !== link) {
                            misses.push(link.getAttribute('data-plurid-link-route') + ' ← ' + (top ? top.tagName + (top.getAttribute('data-plurid-entity') ? '#' + top.getAttribute('data-plurid-entity') : '') : 'none'));
                        }
                    }
                    return misses;
                });
                expect(misses).toEqual([]);
            }

            // THE PLANES THAT MUST READ at the primary viewpoint: a projected width a reader can use,
            // and, when asked, the plane's own centre hit by the plane itself and nothing over it.
            // A branch at 90° used to be asserted as `overlap: expected`; this is the assertion that
            // it is READABLE, which is the thing a product needs.
            for (const rule of fixture.expect?.visible ?? []) {
                const plane = planeByRoute(roots, rule.route);
                expect(plane, rule.route).toBeTruthy();
                const seen = await page.evaluate((id) => {
                    const element = document.querySelector(`[data-plurid-plane="${id}"]`) as HTMLElement;
                    const rect = element.getBoundingClientRect();
                    const x = rect.left + rect.width / 2;
                    const y = rect.top + rect.height / 2;
                    const top = document.elementFromPoint(x, y);
                    return {
                        width: rect.width,
                        hit: !!top && top.closest('[data-plurid-plane]') === element,
                    };
                }, plane.planeID);
                expect(seen.width, rule.route + ' must read: ' + seen.width.toFixed(1) + 'px wide').toBeGreaterThanOrEqual(rule.minWidth);
                if (rule.unoccluded) {
                    expect(seen.hit, rule.route + ' must not be under another plane').toBe(true);
                }
            }

            // what the bus was told
            for (const kind of fixture.expect?.changed ?? []) {
                const changed: string[] = await page.evaluate(() => (window as any).__rtChanged ?? []);
                expect(changed, 'space.changed kinds reported').toContain(kind);
            }

            expect((await spaceState(page)).motion).toBe('idle');
            expect(errors).toEqual([]);
        });
    }
});
