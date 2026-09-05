import {
    test,
    expect,
} from '@playwright/test';

import {
    collectConsoleErrors,
    openFixture,
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
                        if (!top || top.closest('[data-plurid-link-route]') !== link) {
                            misses.push(link.getAttribute('data-plurid-link-route') + ' ← ' + (top ? top.tagName + (top.getAttribute('data-plurid-entity') ? '#' + top.getAttribute('data-plurid-entity') : '') : 'none'));
                        }
                    }
                    return misses;
                });
                expect(misses).toEqual([]);
            }

            expect((await spaceState(page)).motion).toBe('idle');
            expect(errors).toEqual([]);
        });
    }
});
