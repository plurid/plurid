import {
    test,
    expect,
    Page,
} from '@playwright/test';

import {
    openHarness,
    collectConsoleErrors,
    publish,
    settle,
    camera,
    spaceState,
    viewRect,
} from './helpers';


const DEG = Math.PI / 180;

/** The live tree (see `__rtTree` in the harness). */
const tree = (page: Page) => page.evaluate(() => (window as any).__rtTree());

const rootByRoute = (nodes: any[], route: string) => nodes.find((node) => node.route.endsWith(route));

/** Click the `index`-th link to `route` inside the plane `planeID` — a DOM click, independent of the camera. */
const clickLink = (
    page: Page,
    planeID: string,
    route: string,
    index = 0,
) => page.evaluate(({ planeID, route, index }) => {
    const selector = `[data-plurid-plane="${planeID}"] [data-plurid-link-route$="${route}"]`;
    const links = document.querySelectorAll(selector);
    const link = links[index] as HTMLElement | undefined;
    if (!link) {
        throw new Error(`no link ${selector}[${index}] (${links.length} found)`);
    }
    link.click();
}, { planeID, route, index });

const linkOpen = (
    page: Page,
    planeID: string,
    route: string,
    index = 0,
) => page.evaluate(({ planeID, route, index }) => {
    const link = document.querySelectorAll(`[data-plurid-plane="${planeID}"] [data-plurid-link-route$="${route}"]`)[index];
    return link ? link.getAttribute('data-plurid-link-open') : null;
}, { planeID, route, index });

/** Wait until the plane `planeID` has `count` children (deep lookup). */
const waitForChildren = (
    page: Page,
    planeID: string,
    count: number,
) => page.waitForFunction(({ planeID, count }) => {
    const find = (nodes: any[]): any => {
        for (const node of nodes) {
            if (node.planeID === planeID) {
                return node;
            }
            if (node.children) {
                const hit = find(node.children);
                if (hit) {
                    return hit;
                }
            }
        }
        return undefined;
    };
    const plane = find((window as any).__rtTree());
    return !!plane && (plane.children || []).length === count;
}, { planeID, count });

const findPlane = (nodes: any[], planeID: string): any => {
    for (const node of nodes) {
        if (node.planeID === planeID) {
            return node;
        }
        if (node.children) {
            const hit = findPlane(node.children, planeID);
            if (hit) {
                return hit;
            }
        }
    }
    return undefined;
};

/** The engine's child geometry, restated: where a child spawned from `link` on `parent` must sit. */
const expectedChildLocation = (
    parent: any,
    link: { x: number; y: number },
    bridgeLength: number,
    planeAngle: number,
) => {
    const parentAngle = parent.rotateY * DEG;
    const linkX = parent.translateX + link.x * Math.cos(parentAngle);
    const linkZ = parent.translateZ - link.x * Math.sin(parentAngle);
    const bridgeAngle = (parent.rotateY + planeAngle) * DEG;
    return {
        translateX: linkX + bridgeLength * Math.cos(bridgeAngle),
        translateY: parent.translateY + link.y,
        translateZ: linkZ - bridgeLength * Math.sin(bridgeAngle),
        rotateY: parent.rotateY + planeAngle,
    };
};


test.describe('links and tree', () => {
    test('two links in one plane spawn two children at distinct positions; same-route links get ordinals', async ({ page }) => {
        const errors = collectConsoleErrors(page);
        await openHarness(page, '?links=dense&reducedMotion=1');
        const root = rootByRoute(await tree(page), '/geometry');

        await clickLink(page, root.planeID, '/material');
        await waitForChildren(page, root.planeID, 1);
        await clickLink(page, root.planeID, '/topology');
        await waitForChildren(page, root.planeID, 2);

        let geometry = findPlane(await tree(page), root.planeID);
        const [material, topology] = geometry.children;
        expect(material.planeID).not.toBe(topology.planeID);
        expect(material.spawnedByLinkID).not.toBe(topology.spawnedByLinkID);
        expect(material.parentPlaneID).toBe(root.planeID);
        // stacked links → stacked children (the y of each link), same bridge and fan
        expect(Math.abs(material.location.translateY - topology.location.translateY)).toBeGreaterThan(8);
        expect(material.bridgeLength).toBe(160);
        expect(material.planeAngle).toBe(90);
        expect(material.location.rotateY).toBeCloseTo(geometry.location.rotateY + 90, 6);
        for (const child of [material, topology]) {
            const expected = expectedChildLocation(geometry.location, child.linkCoordinates, child.bridgeLength, child.planeAngle);
            expect(child.location.translateX).toBeCloseTo(expected.translateX, 3);
            expect(child.location.translateY).toBeCloseTo(expected.translateY, 3);
            expect(child.location.translateZ).toBeCloseTo(expected.translateZ, 3);
        }
        expect(await linkOpen(page, root.planeID, '/material')).toBe('true');
        expect(await linkOpen(page, root.planeID, '/tessellation')).toBeNull();

        // two links to the SAME route: distinct ordinals, distinct children
        await clickLink(page, root.planeID, '/geometry/detail', 0);
        await waitForChildren(page, root.planeID, 3);
        await clickLink(page, root.planeID, '/geometry/detail', 1);
        await waitForChildren(page, root.planeID, 4);
        geometry = findPlane(await tree(page), root.planeID);
        const details = geometry.children.filter((child: any) => child.route.endsWith('/geometry/detail'));
        expect(details).toHaveLength(2);
        expect(details[0].spawnedByLinkID.endsWith('#0')).toBe(true);
        expect(details[1].spawnedByLinkID.endsWith('#1')).toBe(true);
        expect(details[0].location.translateY).not.toBeCloseTo(details[1].location.translateY, 0);
        expect(errors).toEqual([]);
    });

    test('a 3-deep chain alternates the fan angle so no plane faces away', async ({ page }) => {
        await openHarness(page, '?nested=3&reducedMotion=1');
        const root = rootByRoute(await tree(page), '/geometry');

        await clickLink(page, root.planeID, '/chain-1');
        await waitForChildren(page, root.planeID, 1);
        const chain1 = findPlane(await tree(page), root.planeID).children[0];

        await clickLink(page, chain1.planeID, '/chain-2');
        await waitForChildren(page, chain1.planeID, 1);
        const chain2 = findPlane(await tree(page), chain1.planeID).children[0];

        await clickLink(page, chain2.planeID, '/chain-3');
        await waitForChildren(page, chain2.planeID, 1);
        const chain3 = findPlane(await tree(page), chain2.planeID).children[0];

        const rootYaw = root.location.rotateY;
        expect(chain1.planeAngle).toBe(90);
        expect(chain2.planeAngle).toBe(-90);
        expect(chain3.planeAngle).toBe(90);
        expect(chain1.location.rotateY).toBeCloseTo(rootYaw + 90, 6);
        expect(chain2.location.rotateY).toBeCloseTo(rootYaw, 6);
        expect(chain3.location.rotateY).toBeCloseTo(rootYaw + 90, 6);
        expect(chain2.parentPlaneID).toBe(chain1.planeID);
        expect(chain3.parentPlaneID).toBe(chain2.planeID);

        // the grandchild sits where the geometry says, from its LIVE parent
        const expected = expectedChildLocation(chain1.location, chain2.linkCoordinates, chain2.bridgeLength, chain2.planeAngle);
        expect(chain2.location.translateX).toBeCloseTo(expected.translateX, 3);
        expect(chain2.location.translateZ).toBeCloseTo(expected.translateZ, 3);
    });

    test('toggling a link hides and shows the SAME plane; undo then click spawns no duplicate', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1');
        const root = rootByRoute(await tree(page), '/geometry');

        await clickLink(page, root.planeID, '/geometry/detail');
        await waitForChildren(page, root.planeID, 1);
        const spawned = findPlane(await tree(page), root.planeID).children[0];
        expect(spawned.show).toBe(true);
        expect(await linkOpen(page, root.planeID, '/geometry/detail')).toBe('true');

        await clickLink(page, root.planeID, '/geometry/detail');
        await page.waitForFunction((id) => {
            const find = (nodes: any[]): any => nodes.flatMap((n) => [n, ...(n.children ? find(n.children) : [])]);
            const plane = find((window as any).__rtTree()).find((n: any) => n.planeID === id);
            return plane && plane.show === false;
        }, spawned.planeID);
        let geometry = findPlane(await tree(page), root.planeID);
        expect(geometry.children).toHaveLength(1);
        expect(geometry.children[0].planeID).toBe(spawned.planeID);
        expect(await linkOpen(page, root.planeID, '/geometry/detail')).toBeNull();
        // hidden subtree unmounts
        expect(await page.locator(`[data-plurid-plane="${spawned.planeID}"]`).count()).toBe(0);

        await clickLink(page, root.planeID, '/geometry/detail');
        await page.waitForFunction((id) => document.querySelector(`[data-plurid-plane="${id}"]`) !== null, spawned.planeID);
        geometry = findPlane(await tree(page), root.planeID);
        expect(geometry.children).toHaveLength(1);
        expect(geometry.children[0].planeID).toBe(spawned.planeID);
        expect(geometry.children[0].show).toBe(true);

        // undo back to the pre-spawn tree, then click again: exactly one child
        for (let i = 0; i < 8; i += 1) {
            await publish(page, 'space.undo');
            const current = findPlane(await tree(page), root.planeID);
            if (!current.children || current.children.length === 0) {
                break;
            }
        }
        expect((findPlane(await tree(page), root.planeID).children || []).length).toBe(0);
        expect(await linkOpen(page, root.planeID, '/geometry/detail')).toBeNull();

        await clickLink(page, root.planeID, '/geometry/detail');
        await waitForChildren(page, root.planeID, 1);
        geometry = findPlane(await tree(page), root.planeID);
        expect(geometry.children).toHaveLength(1);
        expect(geometry.children[0].show).toBe(true);
    });

    test('relayouts keep children attached at their link; idle spaces dispatch nothing', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1');
        const root = rootByRoute(await tree(page), '/geometry');
        await clickLink(page, root.planeID, '/geometry/detail');
        await waitForChildren(page, root.planeID, 1);
        // let the spawn's navigation settle (its transition window and active-plane timers)
        await page.waitForTimeout(1200);

        // idle: no periodic dispatches with a link open
        const idleBefore = await page.evaluate(() => (window as any).__rtPerf.dispatches);
        await page.waitForTimeout(1500);
        const idleAfter = await page.evaluate(() => (window as any).__rtPerf.dispatches);
        const idleChanges = await page.evaluate((count) => (window as any).__rtChanges.slice(-count), idleAfter - idleBefore);
        expect(idleAfter - idleBefore, 'idle dispatches: ' + JSON.stringify(idleChanges)).toBe(0);

        // a view resize relays the roots; the child follows its parent and its link
        const beforeRoots = await tree(page);
        const before = findPlane(beforeRoots, root.planeID);
        const planeCount = await page.locator('[data-plurid-plane]').count();
        const resizeBefore = await page.evaluate(() => (window as any).__rtPerf.dispatches);
        await page.setViewportSize({ width: 1100, height: 720 });
        await page.waitForFunction(() => (window as any).__pluridApi.getSnapshot().space.viewSize.width === 1100);
        await page.waitForTimeout(600);
        const resizeAfter = await page.evaluate(() => (window as any).__rtPerf.dispatches);
        expect(resizeAfter - resizeBefore).toBeLessThanOrEqual(planeCount * 2 + 8);

        const rootsAfter = await tree(page);
        const after = findPlane(rootsAfter, root.planeID);
        // the relayout moved the roots (the first column may stay at x = 0; a later one moves)
        expect(rootsAfter.some((node: any, index: number) => Math.abs(node.location.translateX - beforeRoots[index].location.translateX) > 1)).toBe(true);
        expect(after.children).toHaveLength(1);
        expect(after.children[0].planeID).toBe(before.children[0].planeID);
        const child = after.children[0];
        const expected = expectedChildLocation(after.location, child.linkCoordinates, child.bridgeLength, child.planeAngle);
        expect(child.location.translateX).toBeCloseTo(expected.translateX, 2);
        expect(child.location.translateY).toBeCloseTo(expected.translateY, 2);
        expect(child.location.translateZ).toBeCloseTo(expected.translateZ, 2);

        // removing a root through the pubsub relayouts too (no collapse to the origin)
        await publish(page, 'view.removePlane', { plane: '/tessellation' });
        await page.waitForFunction(() => (window as any).__rtTree().length === 4);
        const roots = await tree(page);
        const xs = roots.map((node: any) => Math.round(node.location.translateX));
        expect(new Set(xs).size).toBeGreaterThan(1);
        const geometry = findPlane(roots, root.planeID);
        expect(geometry.children).toHaveLength(1);
        expect(geometry.children[0].planeID).toBe(child.planeID);
    });
});


/** The page rect of a plane element (CSS 3D transforms are reflected in the bounding box). */
const planeRect = (
    page: Page,
    planeID: string,
) => page.evaluate((planeID) => {
    const element = document.querySelector(`[data-plurid-plane="${planeID}"]`) as HTMLElement | null;
    if (!element) {
        return null;
    }
    const r = element.getBoundingClientRect();
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
}, planeID);

const viewCenter = async (page: Page) => {
    const rect = await viewRect(page);
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
};

/** Wait until the plane `planeID` is shown (or hidden) in the tree. */
const waitForShown = (
    page: Page,
    planeID: string,
    shown: boolean,
) => page.waitForFunction(({ planeID, shown }) => {
    const find = (nodes: any[]): any => {
        for (const node of nodes) {
            if (node.planeID === planeID) {
                return node;
            }
            if (node.children) {
                const hit = find(node.children);
                if (hit) {
                    return hit;
                }
            }
        }
        return undefined;
    };
    const plane = find((window as any).__rtTree());
    return !!plane && (plane.show !== false) === shown;
}, { planeID, shown });


test.describe('reopen, close and the camera (the hypod issue)', () => {
    test('a child reopened after a viewport resize is framed where it really is', async ({ page }) => {
        const errors = collectConsoleErrors(page);
        await page.setViewportSize({ width: 390, height: 844 });
        await openHarness(page, '?reducedMotion=1');
        const root = rootByRoute(await tree(page), '/geometry');

        // open the child at the narrow viewport, then close it (the camera returns to the parent)
        await clickLink(page, root.planeID, '/geometry/detail');
        await waitForChildren(page, root.planeID, 1);
        const child = findPlane(await tree(page), root.planeID).children[0];
        await settle(page);
        await publish(page, 'space.closePlane', { id: child.planeID });
        await waitForShown(page, child.planeID, false);
        await settle(page);

        // the viewport grows: the closed (unmounted) child kept its narrow size and its link moved
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.waitForFunction(() => (window as any).__pluridApi.getSnapshot().space.viewSize.width === 1440);
        await settle(page);

        // reopen: the plane is relocated from the fresh link measurement and re-framed once measured
        await clickLink(page, root.planeID, '/geometry/detail');
        await waitForShown(page, child.planeID, true);
        await page.waitForFunction((planeID) => !!document.querySelector(`[data-plurid-plane="${planeID}"]`), child.planeID);
        await settle(page);
        await page.waitForTimeout(120);
        await settle(page);

        const rect = (await planeRect(page, child.planeID))!;
        const view = await viewRect(page);
        const center = await viewCenter(page);
        expect(rect.left).toBeGreaterThanOrEqual(view.left - 1);
        expect(rect.right).toBeLessThanOrEqual(view.left + view.width + 1);
        expect(rect.top).toBeGreaterThanOrEqual(view.top - 1);
        expect(rect.bottom).toBeLessThanOrEqual(view.top + view.height + 1);
        expect(Math.abs((rect.left + rect.right) / 2 - center.x)).toBeLessThanOrEqual(12);
        expect(Math.abs((rect.top + rect.bottom) / 2 - center.y)).toBeLessThanOrEqual(12);

        // the child's stored coordinates are the link's CURRENT measurement, not the narrow one
        const reopened = findPlane(await tree(page), child.planeID);
        const measured = await page.evaluate(({ planeID, route }) => {
            const link = document.querySelector(`[data-plurid-plane="${planeID}"] [data-plurid-link-route$="${route}"]`) as HTMLElement;
            const plane = link.closest('[data-plurid-plane]') as HTMLElement;
            // layout offsets up the offsetParent chain (what the engine measures), not transformed rects
            let left = 0;
            let top = 0;
            let element: HTMLElement | null = link;
            while (element && element !== plane) {
                left += element.offsetLeft;
                top += element.offsetTop;
                element = element.offsetParent as HTMLElement | null;
            }
            return { x: left + link.offsetWidth, y: top + link.offsetHeight / 2 };
        }, { planeID: root.planeID, route: '/geometry/detail' });
        expect(Math.abs(reopened.linkCoordinates.x - measured.x)).toBeLessThanOrEqual(2);
        expect(Math.abs(reopened.linkCoordinates.y - measured.y)).toBeLessThanOrEqual(2);

        // close again without options: the parent comes back into view, centred
        await publish(page, 'space.closePlane', { id: child.planeID });
        await waitForShown(page, child.planeID, false);
        await settle(page);
        const parentRect = (await planeRect(page, root.planeID))!;
        expect(Math.abs((parentRect.left + parentRect.right) / 2 - center.x)).toBeLessThanOrEqual(12);
        expect(Math.abs((parentRect.top + parentRect.bottom) / 2 - center.y)).toBeLessThanOrEqual(12);
        expect(await linkOpen(page, root.planeID, '/geometry/detail')).toBeNull();
        expect(errors).toEqual([]);
    });

    test('closing the child in view hands the camera to the parent; `navigate: "stay"` keeps it', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1');
        const root = rootByRoute(await tree(page), '/geometry');
        await clickLink(page, root.planeID, '/geometry/detail');
        await waitForChildren(page, root.planeID, 1);
        const child = findPlane(await tree(page), root.planeID).children[0];
        await settle(page);
        const framedChild = await camera(page);

        // default: the closed child was in view → the parent is framed and becomes active
        await publish(page, 'space.closePlane', { id: child.planeID });
        await waitForShown(page, child.planeID, false);
        await settle(page);
        const afterClose = await camera(page);
        expect(Math.hypot(afterClose.pivot.x - framedChild.pivot.x, afterClose.pivot.z - framedChild.pivot.z)).toBeGreaterThan(50);
        expect((await spaceState(page)).activePlaneID).toBe(root.planeID);
        const center = await viewCenter(page);
        const parentRect = (await planeRect(page, root.planeID))!;
        expect(Math.abs((parentRect.left + parentRect.right) / 2 - center.x)).toBeLessThanOrEqual(12);

        // stay: the camera does not move
        await clickLink(page, root.planeID, '/geometry/detail');
        await waitForShown(page, child.planeID, true);
        await settle(page);
        await page.waitForTimeout(120);
        await settle(page);
        const before = await camera(page);
        await publish(page, 'space.closePlane', { id: child.planeID, navigate: 'stay' });
        await waitForShown(page, child.planeID, false);
        await settle(page);
        const after = await camera(page);
        expect(after.pivot).toEqual(before.pivot);
        expect(after.yaw).toBe(before.yaw);
        expect(after.scale).toBe(before.scale);
    });

    test('a reference-only tree update never reopens a closed child (the hypod 0.0.0-36 patch)', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1');
        const root = rootByRoute(await tree(page), '/geometry');
        await clickLink(page, root.planeID, '/geometry/detail');
        await waitForChildren(page, root.planeID, 1);
        const child = findPlane(await tree(page), root.planeID).children[0];
        await publish(page, 'space.closePlane', { id: child.planeID, navigate: 'stay' });
        await waitForShown(page, child.planeID, false);

        // the same tree, new references (a host `setTree` / a collaboration echo)
        for (let i = 0; i < 3; i += 1) {
            await page.evaluate(() => {
                const api = (window as any).__pluridApi;
                api.store.dispatch({ type: 'space/setTree', payload: JSON.parse(JSON.stringify(api.store.getState().space.tree)) });
            });
            await page.waitForTimeout(100);
        }
        await page.waitForTimeout(300);

        const after = findPlane(await tree(page), child.planeID);
        expect(after.show).toBe(false);
        expect(await linkOpen(page, root.planeID, '/geometry/detail')).toBeNull();
    });
});
