import {
    Page,
    expect,
} from '@playwright/test';


/** The shape the harness exposes on `window` (see `src/App.tsx`). */
export interface HarnessWindow {
    __pluridApi: any;
    __rtCamera: () => any;
    __rtViewpoint2: () => string;
    __rtPerf: { dispatches: number; frames: number };
    __rtViewpoint?: string;
}


/** Console errors the harness is known to emit in development and that are not regressions. */
const KNOWN_CONSOLE_NOISE = [
    /non-serializable value was detected/i,
];


/** Collect console errors during a test, filtering the known development noise. */
export const collectConsoleErrors = (
    page: Page,
): string[] => {
    const errors: string[] = [];
    page.on('console', (message) => {
        if (message.type() !== 'error') {
            return;
        }
        const text = message.text();
        if (KNOWN_CONSOLE_NOISE.some((pattern) => pattern.test(text))) {
            return;
        }
        errors.push(text);
    });
    page.on('pageerror', (error) => {
        errors.push(error.message);
    });
    return errors;
};


/** Open the harness with query flags and wait for the engine to be ready. */
export const openHarness = async (
    page: Page,
    query = '',
) => {
    await page.goto('/' + query);
    await page.waitForFunction(() => {
        const w = window as unknown as HarnessWindow;
        return typeof w.__rtCamera === 'function'
            && document.querySelectorAll('[data-plurid-plane]').length > 0;
    });
    // let the first layout + measurement settle
    await page.waitForFunction(() => {
        const w = window as unknown as HarnessWindow;
        const tree = w.__pluridApi.getSnapshot().space.tree;
        return tree.length > 0 && tree.every((plane: any) => plane.width > 0);
    });
};


export const camera = (page: Page) => page.evaluate(() => (window as unknown as HarnessWindow).__rtCamera());

/** Wait for any camera tween / fling to finish (programmatic moves are animated by default). */
export const settle = async (page: Page) => {
    await page.waitForFunction(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().space.motion === 'idle');
    await page.waitForTimeout(30);
};

export const spaceState = (page: Page) => page.evaluate(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().space);

export const publish = (page: Page, topic: string, data?: unknown) => page.evaluate(
    ({ topic, data }) => (window as unknown as HarnessWindow).__pluridApi.pubsub.publish({ topic, data }),
    { topic, data },
);


/**
 * Project a world point through the CURRENT rendered matrix, page-side (the same projection the
 * browser applies: the `matrix3d` then the CSS perspective divide about the view center).
 */
export const projectWorld = (
    page: Page,
    world: { x: number; y: number; z: number },
) => page.evaluate((world) => {
    const s = (window as unknown as HarnessWindow).__pluridApi.getSnapshot().space;
    const m = s.transform.slice(9, -1).split(',').map(Number);
    const d = s.camera.perspective;
    const C = { x: s.viewSize.width / 2, y: s.viewSize.height / 2 };
    const x = m[0] * world.x + m[4] * world.y + m[8] * world.z + m[12];
    const y = m[1] * world.x + m[5] * world.y + m[9] * world.z + m[13];
    const z = m[2] * world.x + m[6] * world.y + m[10] * world.z + m[14];
    const k = d / (d - z);
    return {
        x: C.x + (x - C.x) * k,
        y: C.y + (y - C.y) * k,
        z,
    };
}, world);


/** The view element's page rect (to convert view px to page px for pointer input). */
export const viewRect = async (
    page: Page,
) => {
    const rect = await page.evaluate(() => {
        const element = document.querySelector('[data-plurid-entity="PluridView"]') as HTMLElement;
        const r = element.getBoundingClientRect();
        return { left: r.left, top: r.top, width: r.width, height: r.height };
    });
    expect(rect.width).toBeGreaterThan(0);
    return rect;
};


/** World-space corners of every visible plane (children included), using the measured sizes. */
export const visibleCorners = (page: Page) => page.evaluate(() => {
    const s = (window as unknown as HarnessWindow).__pluridApi.getSnapshot().space;
    const corners: { x: number; y: number; z: number }[] = [];
    const walk = (nodes: any[]) => {
        for (const node of nodes) {
            if (node.show === false) {
                continue;
            }
            const w = node.width || 400;
            const h = node.height || 300;
            const rx = node.location.rotateX * Math.PI / 180;
            const ry = node.location.rotateY * Math.PI / 180;
            // plane basis: Rx(rx) · Ry(ry) applied to the unit axes (CSS convention)
            const u = { x: Math.cos(ry), y: Math.sin(rx) * Math.sin(ry), z: -Math.cos(rx) * Math.sin(ry) };
            const v = { x: 0, y: Math.cos(rx), z: Math.sin(rx) };
            const o = node.location;
            const add = (p: any, a: any, k: number) => ({ x: p.x + a.x * k, y: p.y + a.y * k, z: p.z + a.z * k });
            const tl = { x: o.translateX, y: o.translateY, z: o.translateZ };
            const tr = add(tl, u, w);
            corners.push(tl, tr, add(tr, v, h), add(tl, v, h));
            if (node.children) {
                walk(node.children);
            }
        }
    };
    walk(s.tree);
    return corners;
});


// #region harness scenes
/** The live space tree (roots with their spawned children). */
export const tree = (page: Page) => page.evaluate(() => (window as any).__rtTree());

/** A plane (root or spawned) by its id, anywhere in the tree. */
export const findPlane = (nodes: any[], planeID: string): any => {
    for (const node of nodes) {
        if (node.planeID === planeID) return node;
        const found = node.children ? findPlane(node.children, planeID) : undefined;
        if (found) return found;
    }
    return undefined;
};

/** The root registered under `route` (`/geometry`). */
export const rootByRoute = (roots: any[], route: string): any => {
    const root = roots.find((node: any) => String(node.route).endsWith(route));
    if (!root) throw new Error('no root for ' + route);
    return root;
};

/** Click the PluridLink to `route` inside the plane `planeID` (the link's own click handler). */
export const clickLink = (page: Page, planeID: string, route: string) => page.evaluate(({ planeID, route }) => {
    const link = document.querySelector(`[data-plurid-plane="${planeID}"] [data-plurid-link-route$="${route}"]`) as HTMLElement | null;
    if (!link) throw new Error('no link to ' + route + ' in ' + planeID);
    link.click();
}, { planeID, route });

/** Wait until the plane has exactly `count` shown children, measured. */
export const waitForChildren = (page: Page, planeID: string, count: number) => page.waitForFunction(({ planeID, count }) => {
    const find = (nodes: any[]): any => { for (const node of nodes) { if (node.planeID === planeID) return node; const f = node.children ? find(node.children) : undefined; if (f) return f; } return undefined; };
    const plane = find((window as any).__rtTree());
    const children = (plane?.children ?? []).filter((child: any) => child.show !== false);
    return children.length === count && children.every((child: any) => child.width > 0 && child.height > 0);
}, { planeID, count });

/** The plane element's COMPUTED transform (mid-flight during an animated relayout). */
export const computedTransform = (page: Page, planeID: string) => page.evaluate((id) => getComputedStyle(document.querySelector(`[data-plurid-plane="${id}"]`)!).transform, planeID);

/** The plane element's STYLED transform (the target of an animated relayout). */
export const styledTransform = (page: Page, planeID: string) => page.evaluate((id) => (document.querySelector(`[data-plurid-plane="${id}"]`) as HTMLElement).style.transform, planeID);

/** Open the setup panel (the top-left SETUP button). */
export const openSetup = async (page: Page) => {
    await page.locator('[data-rt-setup]').click();
    await page.locator('[data-rt-setup-panel]').waitFor();
};
// #endregion harness scenes


// #region fixtures
import {
    FixtureDefinition,
    fixtureByName,
    fixtureQuery,
} from '../src/fixtures/catalog';

/** Every shown plane of the tree, roots and spawned children. */
export const shownPlanes = (nodes: any[]): any[] => nodes.flatMap((node) => (node.show === false
    ? []
    : [node, ...shownPlanes(node.children ?? [])]));

/** A shown plane (root or spawned) whose route ends with `route`. */
export const planeByRoute = (nodes: any[], route: string): any => shownPlanes(nodes).find((node) => String(node.route).endsWith(route));

/**
 * Open a fixture of the catalog: its URL (deterministic motion), its steps (link clicks), one of
 * its viewpoints (the first by default), then settle. Waits for every shown plane to be measured.
 */
export const openFixture = async (
    page: Page,
    name: string,
    options: { viewpoint?: string; extra?: Record<string, string> } = {},
): Promise<FixtureDefinition> => {
    const fixture = fixtureByName(name);
    if (!fixture) throw new Error('no fixture ' + name);
    await page.goto('/' + fixtureQuery(name, options.extra));
    await page.waitForFunction(() => typeof (window as any).__rtCamera === 'function');
    const measured = () => page.waitForFunction(() => {
        const shown = (nodes: any[]): any[] => nodes.flatMap((node: any) => (node.show === false ? [] : [node, ...shown(node.children ?? [])]));
        return shown((window as any).__rtTree()).every((node: any) => node.width > 0 && node.height > 0);
    });
    if ((fixture.expect?.planes ?? 1) > 0) {
        await page.waitForFunction(() => document.querySelectorAll('[data-plurid-plane]').length > 0);
    }
    await measured();
    for (const step of fixture.steps ?? []) {
        const parent = planeByRoute(await tree(page), step.plane);
        if (!parent) throw new Error('fixture ' + name + ': no plane ' + step.plane);
        const before = (parent.children ?? []).filter((child: any) => child.show !== false).length;
        await clickLink(page, parent.planeID, step.route);
        await waitForChildren(page, parent.planeID, before + 1);
        await settle(page);
    }
    await measured();
    const viewpoint = fixture.viewpoints.find((entry) => entry.name === (options.viewpoint ?? fixture.viewpoints[0]?.name));
    for (const step of viewpoint?.apply ?? []) {
        await publish(page, step.topic, step.data);
    }
    await settle(page);
    return fixture;
};
// #endregion fixtures
