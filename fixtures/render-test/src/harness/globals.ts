import type { HarnessFlags } from './flags';
import type { DeclaredSize } from './planes';

/**
 * The `window.__rt*` assertion surface the browser suite reads, installed once the application is
 * ready. Names are part of the e2e contract (docs/HARNESS.md).
 */
export const installHarnessGlobals = (
    api: any,
    flags: HarnessFlags,
    declared: Record<string, DeclaredSize>,
) => {
    const w = window as any;
    w.__pluridApi = api;
    // Camera assertion helpers: the live camera, the v2 viewpoint, and a dispatch/frame counter.
    w.__rtCamera = () => api.store.getState().space.camera;
    w.__rtTree = () => api.store.getState().space.tree;
    w.__rtViewpoint2 = () => api.getViewpoint({ version: 2 });
    w.__rtFlags = () => flags;
    // The declared sizes by registered route (a fixture's `sizes` set) for the DOM-box assertion.
    w.__rtPlanes = () => Object.entries(declared).map(([route, size]) => ({ route, ...size }));
    const perf = (w.__rtPerf = { dispatches: 0, frames: 0 });
    // Which top-level slice keys changed on each notification (a no-op dispatch logs `[]`).
    const changes: string[][] = (w.__rtChanges = []);
    let previous = api.store.getState();
    api.store.subscribe(() => {
        perf.dispatches += 1;
        const next = api.store.getState();
        const changed: string[] = [];
        for (const slice of Object.keys(next)) {
            if (next[slice] !== previous[slice]) {
                const keys = Object.keys(next[slice] || {}).filter((key) => next[slice][key] !== (previous[slice] || {})[key]);
                changed.push(slice + ':' + keys.join('|'));
            }
        }
        changes.push(changed);
        if (changes.length > 200) changes.shift();
        previous = next;
    });
    const tick = () => { perf.frames += 1; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);

    // `?viewpoint=<encoded>`: applied once every root is measured (framing needs the sizes).
    if (flags.viewpoint) {
        const encoded = flags.viewpoint;
        const applyWhenMeasured = () => {
            const tree = api.store.getState().space.tree as any[];
            const measured = tree.length > 0 && tree.every((node) => node.width > 0 && node.height > 0);
            if (!measured) {
                setTimeout(applyWhenMeasured, 30);
                return;
            }
            api.pubsub.publish({ topic: 'space.setViewpoint', data: { viewpoint: encoded, animated: false } });
        };
        setTimeout(applyWhenMeasured, 30);
    }

    // The gallery drives its iframes: a viewpoint's topics arrive as a message.
    window.addEventListener('message', (event) => {
        const data = event.data;
        if (!data || data.type !== 'rt-viewpoint' || !Array.isArray(data.apply)) {
            return;
        }
        for (const step of data.apply) {
            api.pubsub.publish({ topic: step.topic, data: step.data });
        }
    });

    // `?bench=1`: a scripted orbit + pan + zoom, 240 frames, one camera delta per frame; frame
    // times from rAF deltas → window.__rtBench.
    if (flags.bench) {
        const bootMs = performance.now();
        const frameTimes: number[] = [];
        let dispatchesAtStart = 0;
        let index = 0;
        let last = 0;
        const total = 240;
        const run = (now: number) => {
            if (index === 0) {
                dispatchesAtStart = perf.dispatches;
                last = now;
            } else {
                frameTimes.push(now - last);
                last = now;
            }
            const phase = Math.floor(index / 80);
            const delta = phase === 0
                ? { yaw: 0.9, pitch: index % 2 ? 0.3 : -0.3 }
                : (phase === 1
                    ? { pan: { x: index % 40 < 20 ? 6 : -6, y: 2 } }
                    : { zoom: { factor: index % 40 < 20 ? 1.01 : 1 / 1.01 } });
            api.store.dispatch({ type: 'space/applyCameraDelta', payload: delta });
            index += 1;
            if (index < total) {
                requestAnimationFrame(run);
                return;
            }
            const sorted = [...frameTimes].sort((a, b) => a - b);
            const at = (q: number) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))];
            w.__rtBench = {
                bootMs: Math.round(bootMs),
                firstFrameMs: Math.round(frameTimes[0] ?? 0),
                p50FrameMs: Math.round(at(0.5) * 100) / 100,
                p95FrameMs: Math.round(at(0.95) * 100) / 100,
                maxFrameMs: Math.round((sorted[sorted.length - 1] ?? 0) * 100) / 100,
                dispatches: perf.dispatches - dispatchesAtStart,
                frames: frameTimes.length,
            };
        };
        setTimeout(() => requestAnimationFrame(run), 500);
    }
};

/** Installed at module init (no application needed): the roots container's applied size. */
export const installStaticGlobals = () => {
    if (typeof window === 'undefined') {
        return;
    }
    (window as any).__rtRootsSize = () => {
        const roots = document.querySelector('[data-plurid-entity="PluridRoots"]') as HTMLElement | null;
        return roots
            ? { width: roots.style.width, height: roots.style.height }
            : undefined;
    };
};
