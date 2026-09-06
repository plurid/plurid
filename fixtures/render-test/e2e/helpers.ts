import {
    Page,
    expect,
} from '@playwright/test';


import type {
    CameraState,
    TreePlane,
    PluridApi,
} from '@plurid/plurid-react';

import type {
    HarnessFlags,
} from '../src/harness/flags';


/** One frame of a recording: what the page presentation's chrome was doing (`recordFrames`). */
export interface RecordedFrame {
    docked: string | null;
    toolbar: string;
    motion: string;
    aside: number;
}

/** One frame of the boot recording: was any plane painted before the view was docked? */
export interface BootFrame {
    plane: boolean;
    docked: boolean;
    toolbar: string;
}

/** The bench result (`?bench=1`, `src/harness/globals.ts`). */
export interface BenchResult {
    bootMs: number;
    firstFrameMs: number;
    p50FrameMs: number;
    p95FrameMs: number;
    maxFrameMs: number;
    dispatches: number;
    frames: number;
}

/**
 * The `window.__rt*` assertion surface the harness installs (`src/harness/globals.ts`, `src/App.tsx`)
 * and the recorders the suite installs itself. Names are part of the e2e contract (docs/HARNESS.md).
 */
export interface HarnessWindow {
    __pluridApi: PluridApi;
    __rtCamera: () => CameraState;
    __rtTree: () => TreePlane[];
    __rtViewpoint2: () => string;
    __rtFlags: () => HarnessFlags;
    __rtPlanes: () => { route: string; width?: number; height?: number }[];
    __rtPerf: { dispatches: number; frames: number };
    __rtChanges: string[][];
    __rtBench?: BenchResult;
    __rtRootsSize: () => { width: string; height: string } | undefined;
    __rtStore?: Map<string, string>;
    __rtContent?: unknown;
    __rtRestored?: unknown;
    __rtViewpoint?: string;
    __rtUnhandled?: string[];
    __rtMediaImageLoaded?: boolean;
    /** the suite's per-frame recorder (`recordFrames`) */
    __rtFrames?: RecordedFrame[];
    __rtRecording?: boolean;
    /** the boot recorder (`page.spec.ts`) */
    __rtBootFrames?: BootFrame[];
}

/** `window` as the harness shapes it, inside `page.evaluate`. */
export const harness = () => window as unknown as HarnessWindow;


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


/**
 * Wait for the application to be ready and every SHOWN plane (roots and spawned children) to be
 * measured; with `planes: false` (an empty scene) only for the application.
 */
export const waitForBoot = async (
    page: Page,
    options: { planes?: boolean } = {},
) => {
    await page.waitForFunction(() => typeof (window as unknown as HarnessWindow).__rtCamera === 'function');
    if (options.planes === false) {
        return;
    }
    await page.waitForFunction(() => {
        const shown = (nodes: TreePlane[]): TreePlane[] => nodes.flatMap((node) => (node.show === false ? [] : [node, ...shown(node.children ?? [])]));
        const tree = shown((window as unknown as HarnessWindow).__rtTree());
        return tree.length > 0 && tree.every((node) => node.width > 0 && node.height > 0);
    });
};

/** Open the harness with query flags and wait for the engine to be ready. */
export const openHarness = async (
    page: Page,
    query = '',
) => {
    await page.goto('/' + query);
    await waitForBoot(page);
};


export const camera = (page: Page) => page.evaluate(() => (window as unknown as HarnessWindow).__rtCamera());

/** The page presentation's reveal pose, as configured (`space.docking.reveal`). */
export const revealPose = (page: Page) => page.evaluate(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().configuration.space.docking!.reveal!);

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

/** Scroll a plane's content (its `PluridPlaneContent` scroller) and let the scroll frame run. */
export const scrollPlaneContent = async (page: Page, planeID: string, top: number) => {
    await page.evaluate(({ planeID, top }) => {
        const content = document.querySelector(`[data-plurid-plane="${planeID}"] [data-plurid-entity="PluridPlaneContent"]`) as HTMLElement | null;
        if (!content) throw new Error('no content scroller in ' + planeID);
        content.scrollTop = top;
    }, { planeID, top });
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
};

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


// #region the page presentation
/** The chrome the page presentation hides while docked (one selector per surface). */
export const PAGE_CHROME = [
    '[data-plurid-entity="PluridToolbar"]',
    '[data-plurid-control="viewcube-fit"]',
    '[data-plurid-entity="PluridMinimap"]',
    '[data-plurid-entity="PluridPlaneControls"]',
    '[data-plurid-entity="PluridTransformOrigin"]',
    '[data-plurid-control="shortcuts"]',
];
export const CONTENT = '[data-plurid-entity="PluridPlaneContent"]';
export const DOCK_TOGGLE = '[data-plurid-control="dock-toggle"]';
export const DOCK_BACK = '[data-plurid-control="dock-back"]';

export interface Rect {
    left: number;
    top: number;
    width: number;
    height: number;
}

/** The docked page's id from the View's attribute (`null` when the camera is off every page). */
export const dockedID = (page: Page) => page.evaluate(() => document.querySelector('[data-plurid-entity="PluridView"]')!.getAttribute('data-plurid-docked'));

/** A plane element's page rect. */
export const planeRect = (page: Page, planeID: string): Promise<Rect> => page.evaluate((id) => {
    const r = document.querySelector(`[data-plurid-plane="${id}"]`)!.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
}, planeID);

/** An element's page rect, by selector (the first match). */
export const elementRect = (page: Page, selector: string): Promise<Rect | null> => page.evaluate((s) => {
    const element = document.querySelector(s);
    if (!element) return null;
    const r = element.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
}, selector);

/** Wait for a plane's (smooth) scroll to come to rest, then return the offset. */
export const settledScrollTop = async (page: Page, planeID: string): Promise<number> => {
    let last = await scrollTop(page, planeID);
    for (let index = 0; index < 60; index += 1) {
        await page.waitForTimeout(50);
        const next = await scrollTop(page, planeID);
        if (next === last) {
            return next;
        }
        last = next;
    }
    return last;
};

/** A plane's content scroller offset. */
export const scrollTop = (page: Page, planeID: string) => page.evaluate(({ id, content }) => (document.querySelector(`[data-plurid-plane="${id}"] ${content}`) as HTMLElement).scrollTop, { id: planeID, content: CONTENT });

/** The chrome selectors whose element renders visible (absent or `visibility: hidden` = not). */
export const visibleChrome = (page: Page, selectors: string[] = PAGE_CHROME) => page.evaluate((list) => list.filter((selector) => {
    const element = document.querySelector(selector);
    return !!element && getComputedStyle(element).visibility === 'visible';
}), selectors);

export const waitChromeHidden = (page: Page) => expect.poll(() => visibleChrome(page)).toEqual([]);
export const waitChromeShown = (page: Page) => expect.poll(() => visibleChrome(page)).toContain(PAGE_CHROME[0]);

/** `rect` covers `view` to the pixel. */
export const expectFills = (rect: Rect, view: Rect) => {
    expect(Math.abs(rect.left - view.left)).toBeLessThanOrEqual(1);
    expect(Math.abs(rect.top - view.top)).toBeLessThanOrEqual(1);
    expect(Math.abs(rect.width - view.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(rect.height - view.height)).toBeLessThanOrEqual(1);
};

/** The camera is the identity: face-on, scale 1, no pan. */
export const expectIdentity = (cam: { scale: number; yaw: number; pitch: number; offset: { x: number; y: number } }) => {
    expect(cam.scale).toBeCloseTo(1, 6);
    expect(cam.yaw).toBeCloseTo(0, 6);
    expect(cam.pitch).toBeCloseTo(0, 6);
    expect(cam.offset.x).toBeCloseTo(0, 6);
    expect(cam.offset.y).toBeCloseTo(0, 6);
};

/**
 * Record every animation frame from now on — the docked attribute, the toolbar's visibility, the
 * motion, the aside count — until `stop()`, which returns the frames (at most 900).
 */
export const recordFrames = async (page: Page) => {
    await page.evaluate(() => {
        const w = window as unknown as HarnessWindow;
        const frames: RecordedFrame[] = (w.__rtFrames = []);
        w.__rtRecording = true;
        const tick = () => {
            const toolbar = document.querySelector('[data-plurid-entity="PluridToolbar"]');
            frames.push({
                docked: document.querySelector('[data-plurid-entity="PluridView"]')!.getAttribute('data-plurid-docked'),
                toolbar: toolbar ? getComputedStyle(toolbar).visibility : 'none',
                motion: w.__pluridApi.getSnapshot().space.motion,
                aside: document.querySelectorAll('[data-plurid-aside]').length,
            });
            if (w.__rtRecording && frames.length < 900) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    });
    return {
        /** the frames, run-length encoded on the motion: what a failure should print */
        stop: (): Promise<RecordedFrame[]> => page.evaluate(() => {
            const w = window as unknown as HarnessWindow;
            w.__rtRecording = false;
            return w.__rtFrames ?? [];
        }),
    };
};
/** The frames' motions, run-length encoded (`tween×12, idle×3`): the readable form of a recording. */
export const motionRuns = (frames: RecordedFrame[]): string => {
    const runs: [string, number][] = [];
    for (const frame of frames) {
        const last = runs[runs.length - 1];
        if (last && last[0] === frame.motion) {
            last[1] += 1;
        } else {
            runs.push([frame.motion, 1]);
        }
    }
    return runs.map(([motion, count]) => motion + '×' + count).join(', ');
};
// #endregion the page presentation


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
    const planes = (fixture.expect?.planes ?? 1) > 0;
    await waitForBoot(page, { planes });
    const measured = () => waitForBoot(page, { planes });
    for (const step of fixture.steps ?? []) {
        if (step.kind === 'focus') {
            await page.focus(`[data-plurid-control="${step.control}"]`);
            continue;
        }
        const parent = planeByRoute(await tree(page), step.plane);
        if (!parent) throw new Error('fixture ' + name + ': no plane ' + step.plane);
        if (step.kind === 'scroll') {
            await scrollPlaneContent(page, parent.planeID, step.top);
            continue;
        }
        if (step.kind === 'dock') {
            await publish(page, 'space.dock', { planeID: parent.planeID, animate: false });
            await settle(page);
            continue;
        }
        // on a page a link is a link: clicking an OPEN one navigates to it and spawns nothing
        const shown = (parent.children ?? []).filter((child: any) => child.show !== false);
        const open = shown.some((child: any) => String(child.route).endsWith(step.route));
        await clickLink(page, parent.planeID, step.route);
        if (!open) {
            await waitForChildren(page, parent.planeID, shown.length + 1);
        }
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
