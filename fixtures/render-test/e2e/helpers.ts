import {
    Page,
    expect,
} from '@playwright/test';


import type {
    CameraState,
    TreePlane,
    PluridApi,
    PluridInspection,
    PluridState,
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

/** One frame of the boot recording (`page.spec.ts`): was any plane painted before the view was docked? */
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
    /** every `space.changed` kind reported, in order */
    __rtChanged: string[];
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
    /** the boot recorder (`page.spec.ts`) */
    __rtBootFrames?: BootFrame[];
    /** the suite's boot recorder (`recordDockedFrames`): the docked page per frame from the first script */
    __rtDockedFrames?: (string | null)[];
    __rtDockedRecording?: boolean;
    /** the detach tier's DOM counts */
    __rtMounted: () => { shells: number; contents: number; detached: number };
    /** the diagnostic surface (`api.inspect()`) */
    __rtInspect: () => PluridInspection;
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

/**
 * THE WAITING VOCABULARY (2026-09-13). A test waits on STATE, never on a duration: a sleep is a guess
 * about a machine, and a guess that is right on this laptop is wrong on a loaded CI runner — which is
 * how a suite starts failing for reasons that say nothing about the code. Everything below names the
 * state it waits for, so a timeout reports what never happened instead of "30 s elapsed".
 *
 * `waitForState` — a predicate on the engine's own state, with a message.
 * `afterFrames`   — let the browser paint N frames (a rAF chain, not a clock).
 * `settle`        — the camera is idle AND the frame that follows it has run.
 * `waitQuiet`     — the dispatch count after N still frames: the "nothing oscillates" probe.
 *
 * A `page.waitForTimeout` in this directory is a lint error (`eslint.config.mjs`).
 */

/** Let the page paint: a chain of `requestAnimationFrame`s, resolved inside the browser. */
export const afterFrames = (
    page: Page,
    frames = 1,
) => page.evaluate((count) => new Promise<void>((resolve) => {
    let left = Math.max(1, count);
    const step = () => {
        left -= 1;
        if (left <= 0) {
            resolve();
            return;
        }
        requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}), frames);


/**
 * Wait until the engine's state satisfies `predicate`. `what` is what the failure says, so a timeout
 * reads "waiting for: the camera to come to rest" instead of a stack trace. The predicate runs IN THE
 * PAGE, so it cannot close over the test's variables — whatever it needs comes through `argument`.
 */
export const waitForState = async <T = undefined>(
    page: Page,
    predicate: (state: PluridState, argument: T) => boolean,
    what: string,
    argument?: T,
    options: { timeout?: number } = {},
) => {
    try {
        await page.waitForFunction(
            ({ source, value }) => {
                const test = new Function('state', 'argument', 'return (' + source + ')(state, argument);');
                return !!test((window as unknown as HarnessWindow).__pluridApi.getSnapshot(), value);
            },
            { source: predicate.toString(), value: (argument ?? null) as T },
            { timeout: options.timeout ?? 10_000 },
        );
    } catch (error) {
        throw new Error('waiting for: ' + what + ' — it never happened (' + String(error).split('\n')[0] + ')');
    }
};


/** Wait for any camera tween / fling to finish (programmatic moves are animated by default). */
export const settle = async (page: Page) => {
    await waitForState(page, (state) => state.space.motion === 'idle', 'the camera to come to rest');
    // the store is idle; the frame that renders that state has still to run
    await afterFrames(page, 2);
};


/**
 * A FLICK, DISPATCHED IN THE PAGE (2026-09-13). `page.mouse.*` round-trips every event through CDP, so
 * on a loaded machine the last move can land more than `estimateVelocity`'s staleness window (60 ms)
 * before the release — and the engine correctly reads that as "the finger stopped", so no fling starts
 * and a test about flinging fails for a reason that is about the machine. Dispatching the whole gesture
 * inside ONE page task removes the round trip: the moves are paced by the browser's own frame clock
 * (the same clock the engine samples on, so they stretch together) and the release follows the last
 * move in the same task. What the test then asserts — a release with velocity keeps the camera moving
 * — is the engine's behaviour and nothing else.
 */
export const flick = (
    page: Page,
    from: { x: number; y: number },
    to: { x: number; y: number },
    options: { steps?: number; pauseBeforeRelease?: boolean } = {},
) => page.evaluate(async ({ from, to, steps, pause }) => {
    const view = document.querySelector('[data-plurid-entity="PluridView"]') as HTMLElement;
    const at = (type: string, x: number, y: number, buttons: number) => {
        view.dispatchEvent(new PointerEvent(type, {
            pointerId: 1,
            isPrimary: true,
            pointerType: 'mouse',
            button: type === 'pointermove' ? -1 : 0,
            buttons,
            clientX: x,
            clientY: y,
            bubbles: true,
            cancelable: true,
        }));
    };
    const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    at('pointerdown', from.x, from.y, 1);
    // past the drag threshold first, so the gesture is a drag and not a click
    at('pointermove', from.x + 6, from.y, 1);
    await frame();
    for (let step = 1; step <= steps; step += 1) {
        const t = step / steps;
        at('pointermove', from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t, 1);
        await frame();
    }
    if (pause) {
        // THE FINGER CAME TO REST before lifting, and "at rest" is defined by the engine: a sample
        // older than `estimateVelocity`'s staleness window (60 ms) is not a throw. The pause is
        // counted in REAL elapsed time, not in frames — a 120 Hz display makes eight frames 66 ms and
        // a 240 Hz one 33 ms, which is how this test could still flake once in a thousand runs.
        const start = performance.now();
        while (performance.now() - start < 150) {
            await frame();
        }
    }
    at('pointerup', to.x, to.y, 0);
}, { from, to, steps: options.steps ?? 6, pause: !!options.pauseBeforeRelease });


/**
 * HOW FAR THE CAMERA TRAVELLED BEFORE IT STOPPED: the total arc of `axis` accumulated frame by frame
 * in the page, resolving when the motion goes idle. A fling's REACH depends on the machine (a faster
 * flick throws further, and a strong one can pass half a turn, which wrecks any before/after
 * comparison of a wrapped angle) — the total travelled does not. What it asserts is the behaviour: a
 * release with velocity keeps the camera moving, and the movement decays to rest on its own.
 */
export const travelUntilIdle = (
    page: Page,
    axis: 'yaw' | 'pitch' = 'yaw',
    limitFrames = 900,
) => page.evaluate(({ axis, limitFrames }) => new Promise<number>((resolve) => {
    const api = (window as unknown as { __pluridApi: PluridApi }).__pluridApi;
    let last = (api.getSnapshot().space.camera as unknown as Record<string, number>)[axis];
    let total = 0;
    let frames = 0;
    const tick = () => {
        const space = api.getSnapshot().space;
        const value = (space.camera as unknown as Record<string, number>)[axis];
        // the shortest arc per frame: an angle that wraps past 180 still accumulates honestly
        total += Math.abs(((value - last + 540) % 360) - 180);
        last = value;
        frames += 1;
        if (space.motion === 'idle' || frames > limitFrames) {
            resolve(total);
            return;
        }
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}), { axis, limitFrames });


/**
 * THE QUIESCENCE PROBE: the store's dispatch count after `frames` still frames. A space that nobody
 * touches must dispatch NOTHING — the assertion is `after === before`, and the wait is frames of the
 * browser's own clock rather than a guess at how long an internal timer lasts.
 */
export const waitQuiet = async (
    page: Page,
    frames = 30,
): Promise<number> => {
    await afterFrames(page, frames);
    return dispatches(page);
};

export const spaceState = (page: Page) => page.evaluate(() => (window as unknown as HarnessWindow).__pluridApi.getSnapshot().space);

export const publish = (page: Page, topic: string, data?: unknown) => page.evaluate(
    ({ topic, data }) => (window as unknown as HarnessWindow).__pluridApi.pubsub.publish({ topic, data } as any),
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
/** N shown, measured roots: what `view.setPlanes` leaves behind */
export const waitForRoots = (page: Page, count: number) => page.waitForFunction((count) => {
    const roots = ((window as any).__rtTree() as any[]).filter((node) => node.show !== false);
    return roots.length === count && roots.every((node) => node.width > 0 && node.height > 0);
}, count);

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

/**
 * Wait for a plane's (smooth) scroll to come to rest, then return the offset. A scroll that never
 * settles FAILS the test — the old loop returned the last value it saw, so a runaway scroll was
 * asserted against mid-flight (2026-09-13).
 */
export const settledScrollTop = async (page: Page, planeID: string): Promise<number> => {
    let last = await scrollTop(page, planeID);
    let still = 0;
    await expect.poll(async () => {
        const next = await scrollTop(page, planeID);
        still = next === last ? still + 1 : 0;
        last = next;
        // two consecutive equal readings: the smooth scroll has stopped, not merely paused
        return still >= 2;
    }, { message: 'the plane\'s content scroll never came to rest' }).toBe(true);
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
    // the bus shape boots EMPTY: its planes arrive through the steps
    await waitForBoot(page, { planes: planes && !fixture.query.bus });
    const measured = () => waitForBoot(page, { planes });
    for (const step of fixture.steps ?? []) {
        if (step.kind === 'setPlanes') {
            await publish(page, 'view.setPlanes', { view: step.view });
            await waitForRoots(page, step.view.length);
            await settle(page);
            continue;
        }
        if (step.kind === 'publish') {
            await publish(page, step.topic, step.data);
            await settle(page);
            continue;
        }
        if (step.kind === 'spawn') {
            const parent = planeByRoute(await tree(page), step.plane);
            if (!parent) throw new Error('fixture ' + name + ': no plane ' + step.plane);
            const shown = (parent.children ?? []).filter((child: any) => child.show !== false).length;
            await publish(page, 'space.spawnPlane', {
                route: step.route,
                parentPlaneID: parent.planeID,
                ...(step.linkCoordinates ? { linkCoordinates: step.linkCoordinates } : {}),
                ...(step.token ? { token: step.token } : {}),
            });
            await waitForChildren(page, parent.planeID, shown + 1);
            await settle(page);
            continue;
        }
        if (step.kind === 'focus') {
            await page.focus(`[data-plurid-control="${step.control}"]`);
            continue;
        }
        if (step.kind === 'key') {
            // the engine's keydown listener lives on the view: the key is pressed there
            await page.locator('[data-plurid-entity="PluridView"]').focus();
            await page.keyboard.press(step.press);
            await settle(page);
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
        if (step.kind === 'move') {
            await movePlane(page, parent.planeID, step.deltaX, step.deltaY);
            continue;
        }
        // on a DOCKED page a link is a link: clicking an OPEN one navigates to it and spawns nothing
        // (every catalog click happens docked: a `dock` step precedes it, or the boot docked the page)
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

/** Open a fixture AT A PATH (the address bar is the page): the fixture's query on the given pathname. */
export const openPath = async (
    page: Page,
    path: string,
    name: string,
    extra: Record<string, string> = {},
) => {
    const fixture = fixtureByName(name);
    if (!fixture) throw new Error('no fixture ' + name);
    await page.goto(path + fixtureQuery(name, extra));
    await waitForBoot(page, { planes: (fixture.expect?.planes ?? 1) > 0 });
    await settle(page);
    return fixture;
};

export const pathname = (page: Page) => page.evaluate(() => window.location.pathname);
export const historyLength = (page: Page) => page.evaluate(() => window.history.length);
/** The detach tier's counts from the DOM: shells, contents mounted (and not hidden), detached shells. */
export const mounted = (page: Page) => page.evaluate(() => (window as unknown as HarnessWindow).__rtMounted());
/** The diagnostic surface, as `api.inspect()` gives it. */
export const inspect = (page: Page) => page.evaluate(() => (window as unknown as HarnessWindow).__rtInspect());
/** Chrome's own DOM node and heap counts (the memory budget; a DOM count is machine-independent). */
export const cdpMetrics = async (page: Page) => {
    const session = await page.context().newCDPSession(page);
    await session.send('Performance.enable');
    const { metrics } = await session.send('Performance.getMetrics');
    await session.detach();
    const read = (name: string) => metrics.find((metric) => metric.name === name)?.value ?? 0;
    return { nodes: read('Nodes'), heap: read('JSHeapUsedSize'), listeners: read('JSEventListeners') };
};

export const historyDocked = (page: Page) => page.evaluate(() => (window.history.state as { plurid?: { docked?: string } } | null)?.plurid?.docked ?? null);

/**
 * MOVE A PLANE BY HAND — with a hand. The plane is selected by clicking its controls bar, then
 * dragged with a real pointer (past the drag threshold, in steps, released), and deselected.
 *
 * It used to dispatch three store actions while being named "by hand" (2026-09-13): the gesture
 * recogniser, the hit test, the threshold and the pointer capture were all bypassed, so the scenario
 * called "a dragged child stays where it was dropped" — and the `detail-dragged` picture — never
 * dragged anything. `movePlaneByStore` is still there for SETUP that is not about the drag.
 */
export const movePlane = async (
    page: Page,
    planeID: string,
    deltaX: number,
    deltaY: number,
) => {
    const plane = `[data-plurid-plane="${planeID}"]`;
    // A HAND TAKES HOLD OF WHAT IT CAN SEE: a child is framed WITH its parent from the yaw between
    // them (`childFraming: 'pair'`), which puts a fin at 45° and behind a neighbour's face; a
    // reader frames the plane before dragging it, and so does this (a camera move, never a step
    // of the arrangement history)
    await publish(page, 'space.frame', { planeID, animate: false });
    await settle(page);
    // the controls bar is the plane's handle: a press on its CONTENT would be the page's
    const bar = page.locator(`${plane} [data-plurid-entity="PluridPlaneControls"]`).first();
    const box = await bar.boundingBox();
    if (!box) {
        throw new Error('no plane bar to drag for ' + planeID);
    }

    // select it the way a reader does (the modifier-click the selection contract names)
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    const from = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    await page.keyboard.down(modifier);
    await page.mouse.click(from.x, from.y);
    await page.keyboard.up(modifier);
    await waitForState(
        page,
        (state, id) => state.space.selectedPlaneIDs.includes(id as string),
        'the plane to be selected by the click',
        planeID,
    );

    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    // past the drag threshold first, then the move itself
    await page.mouse.move(from.x + 6, from.y, { steps: 2 });
    await page.mouse.move(from.x + deltaX, from.y + deltaY, { steps: 8 });
    await page.mouse.up();

    await page.evaluate(() => (window as unknown as HarnessWindow).__pluridApi.store.dispatch({ type: 'space/setSelection', payload: [] }));
    await settle(page);
};


/** The same move, through the store: SETUP for a test that is not about dragging. */
export const movePlaneByStore = async (page: Page, planeID: string, deltaX: number, deltaY: number) => {
    await page.evaluate(({ id, dx, dy }) => {
        const api = (window as unknown as HarnessWindow).__pluridApi;
        api.store.dispatch({ type: 'space/setSelection', payload: [id] });
        api.store.dispatch({ type: 'space/transformSelectedPlanes', payload: { deltaX: dx, deltaY: dy } });
        api.store.dispatch({ type: 'space/setSelection', payload: [] });
    }, { id: planeID, dx: deltaX, dy: deltaY });
    await settle(page);
};

/** The store's notification count (`__rtPerf`): a still space dispatches nothing. */
export const dispatches = (page: Page) => page.evaluate(() => (window as unknown as HarnessWindow).__rtPerf.dispatches);

/** A root's world box: the tree's placement and size. */
export interface Box {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export const overlaps = (a: Box, b: Box): boolean =>
    a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

/** The shown roots' world boxes. */
export const rootBoxes = async (page: Page): Promise<Box[]> => ((await tree(page)) as any[])
    .filter((root: any) => root.show !== false)
    .map((root: any) => ({ id: root.planeID, x: root.location.translateX, y: root.location.translateY, width: root.width, height: root.height }));

/**
 * Leave the plane the scenario touched: the pointer to the view's corner, the focus blurred, the
 * selection and the active plane cleared — a clicked plane is active, selected AND focused, three
 * culling exceptions, so this comes before a plane may be culled or detached.
 */
export const leavePlane = async (page: Page) => {
    const view = await page.locator('[data-plurid-entity="PluridView"]').boundingBox();
    await page.mouse.move((view?.x ?? 0) + 2, (view?.y ?? 0) + 2);
    await page.evaluate(() => {
        (document.activeElement as HTMLElement | null)?.blur();
        const api = (window as unknown as HarnessWindow).__pluridApi;
        api.store.dispatch({ type: 'space/setSelection', payload: [] });
        api.store.dispatch({ type: 'space/setSpaceField', payload: { field: 'activePlaneID', value: '' } });
    });
};

/**
 * Record the view's docked page per frame from BEFORE the first script runs (the navigation follows):
 * a boot on the wrong page shows as a frame docked on it, a chrome frame as `null`.
 */
export const recordDockedFrames = async (page: Page) => {
    await page.addInitScript(() => {
        const w = window as unknown as HarnessWindow;
        const frames: (string | null)[] = (w.__rtDockedFrames = []);
        w.__rtDockedRecording = true;
        const tick = () => {
            const view = document.querySelector('[data-plurid-entity="PluridView"]');
            if (view) frames.push(view.getAttribute('data-plurid-docked'));
            if (w.__rtDockedRecording && frames.length < 600) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    });
    return {
        stop: (): Promise<(string | null)[]> => page.evaluate(() => {
            const w = window as unknown as HarnessWindow;
            w.__rtDockedRecording = false;
            return w.__rtDockedFrames ?? [];
        }),
    };
};
// #endregion fixtures


/**
 * A TRACKPAD PINCH, as the browser delivers one: a burst of small Ctrl + wheel deltas. A single
 * Ctrl + notch is the browser's page zoom now and never reaches the camera, so a test that means a
 * pinch sends a pinch. `deltaY` is the whole gesture (negative zooms in), spread over `steps`.
 */
export const pinch = async (
    page: Page,
    at: { x: number; y: number },
    deltaY: number,
    steps = 8,
) => {
    await page.mouse.move(at.x, at.y);
    await page.keyboard.down('Control');
    for (let step = 0; step < steps; step += 1) {
        await page.mouse.wheel(0, deltaY / steps);
    }
    await page.keyboard.up('Control');
};
