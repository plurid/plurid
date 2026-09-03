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
