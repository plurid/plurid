import {
    test,
    expect,
    Page,
} from '@playwright/test';

import {
    openHarness,
    collectConsoleErrors,
    publish,
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
