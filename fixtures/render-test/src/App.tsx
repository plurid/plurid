import React, { useState } from 'react';
import {
    PluridApplication,
    PluridReactPlane,
    PluridLink,
    SPACE_LAYOUT,
    definePluridConfiguration,
} from '@plurid/plurid-react';

import Panel, { PanelProps } from './Plane';
import MediaPlane from './MediaPlane';


// A small "control surface" of distinct planes, laid out in space. Each plane is a
// CAD-like instrument panel — enough planes to exercise layout + 3D transforms and to
// make rotate/scale/translate visibly correct (or not).
const PANELS: (PanelProps & { route: string })[] = [
    {
        route: '/geometry', title: 'GEOMETRY', code: 'G-01', accent: '#4da3ff',
        rows: [['vertices', '2 048'], ['faces', '4 092'], ['manifold', 'true'], ['bbox', '120×80×40']],
    },
    {
        route: '/transform', title: 'TRANSFORM', code: 'T-02', accent: '#ffb454',
        rows: [['rotateX', '0.00°'], ['rotateY', '0.00°'], ['scale', '1.000'], ['origin', 'center']],
    },
    {
        route: '/material', title: 'MATERIAL', code: 'M-03', accent: '#7ee787',
        rows: [['shader', 'pbr/standard'], ['roughness', '0.40'], ['metallic', '0.10'], ['ior', '1.450']],
    },
    {
        route: '/topology', title: 'TOPOLOGY', code: 'P-04', accent: '#d2a8ff',
        rows: [['genus', '0'], ['euler', '2'], ['boundary', 'closed'], ['watertight', 'true']],
    },
    {
        route: '/tessellation', title: 'TESSELLATION', code: 'S-05', accent: '#ff7b72',
        rows: [['method', 'delaunay'], ['max edge', '1.20'], ['triangles', '8 184'], ['quality', '0.92']],
    },
];


// Each layout reads different fields off configuration.space.layout. Typed loosely so the
// harness can flip between them without fighting the config union.
const LAYOUTS: { key: string; label: string; layout: any }[] = [
    { key: 'columns', label: 'COLUMNS', layout: { type: SPACE_LAYOUT.COLUMNS, columns: 3, gap: 0.06 } },
    { key: 'rows', label: 'ROWS', layout: { type: SPACE_LAYOUT.ROWS, rows: 1, gap: 0.06 } },
    { key: 'sheaves', label: 'SHEAVES', layout: { type: SPACE_LAYOUT.SHEAVES, depth: 0.5, offsetX: 60, offsetY: 42 } },
    { key: 'faceToFace', label: 'FACE·TO·FACE', layout: { type: SPACE_LAYOUT.FACE_TO_FACE, angle: 38, gap: 0.08, middle: true } },
    { key: 'zigZag', label: 'ZIG·ZAG', layout: { type: SPACE_LAYOUT.ZIG_ZAG, angle: 30, columns: 3, gap: 0.06 } },
];


// A larger generated set to stress-test performance (many planes in one space). `?planes=N`
// sets the size (and turns stress mode on).
const stressParam = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('planes') : null;
const STRESS_COUNT = stressParam ? Math.max(1, Number(stressParam)) : 40;
const STRESS_ACCENTS = ['#4da3ff', '#ffb454', '#7ee787', '#d2a8ff', '#ff7b72'];
const STRESS_PANELS: (PanelProps & { route: string })[] = Array.from(
    { length: STRESS_COUNT },
    (_, i) => ({
        route: `/unit-${i}`,
        title: `UNIT ${String(i).padStart(2, '0')}`,
        code: `U-${String(i).padStart(2, '0')}`,
        accent: STRESS_ACCENTS[i % STRESS_ACCENTS.length],
        rows: [
            ['index', `${i}`],
            ['load', `${(i * 7) % 100}%`],
            ['state', i % 2 ? 'active' : 'idle'],
            ['hash', (i * 2654435761 % 0xffffff).toString(16)],
        ],
    }),
);


const App = () => {
    const [layoutKey, setLayoutKey] = useState('columns');
    const [stress, setStress] = useState(!!stressParam);
    // PERSIST toggle is itself persisted so it survives a reload (needed to verify the
    // save→reload→restore round-trip). Each layout gets its own storage slot via `id`.
    const [persist, setPersist] = useState(
        typeof localStorage !== 'undefined' && localStorage.getItem('rt-persist') === '1',
    );
    const active = LAYOUTS.find((l) => l.key === layoutKey) ?? LAYOUTS[0];

    const source = stress ? STRESS_PANELS : PANELS;

    // Tier 2 opt-out verification surface (default behavior unchanged — all opt-in via query params):
    //   ?undo=0          → space.undo:false (drop the history middleware)
    //   ?store=memory    → route persistence to an in-memory adapter (window.__rtStore), not localStorage
    //   ?persistMs=80    → space.timings.persistDebounce override
    const params = typeof location !== 'undefined'
        ? new URLSearchParams(location.search)
        : new URLSearchParams();
    const undoOff = params.get('undo') === '0';
    const memoryStore = params.get('store') === 'memory';
    const persistMs = params.get('persistMs') ? Number(params.get('persistMs')) : undefined;
    // Gesture-feel overrides (Tier 3): ?rotateSens=0.44&dragThreshold=0
    const rotateSens = params.get('rotateSens') ? Number(params.get('rotateSens')) : undefined;
    const dragThreshold = params.get('dragThreshold') !== null ? Number(params.get('dragThreshold')) : undefined;
    const btnLeft = params.get('btnLeft') as any;       // orbit|pan|zoom|disabled
    const btnRight = params.get('btnRight') as any;     // orbit|pan|zoom|dolly|disabled|menu
    const btnWheel = params.get('btnWheel') as any;     // zoom|disabled
    const buttonMap = (btnLeft || btnRight || btnWheel)
        ? {
            ...(btnLeft ? { left: btnLeft } : {}),
            ...(btnRight ? { right: btnRight } : {}),
            ...(btnWheel ? { wheel: btnWheel } : {}),
        }
        : undefined;
    // Input-layer flags (Phase 2): ?touchOne=pan|orbit|disabled · ?trackpad=pan|zoom|orbit|disabled
    //   ?momentum=0 (no fling) · ?wheel=zoom|scroll-first|disabled · ?dblclick=0
    const touchOne = params.get('touchOne') as any;
    const trackpadScroll = params.get('trackpad') as any;
    const momentumOff = params.get('momentum') === '0';
    const wheelPolicy = params.get('wheel') as any;
    const doubleClickOff = params.get('dblclick') === '0';
    // Navigation-feel surface (Phase 4):
    //   ?home=<viewpoint>  → navigation.home (v1 `rX,rY,tX,tY,tZ,s` or v2)
    //   ?presets=1         → navigation.presets { front, side, top }
    //   ?gamepad=1         → gestures.gamepad.enabled (tests stub navigator.getGamepads)
    //   Layout buttons now switch the layout on the LIVE instance (no remount): children stay
    //   attached and the planes glide (animated relayout).
    const homeParam = params.get('home') || undefined;
    const presets = params.get('presets') === '1'
        ? { front: '0,0,0,0,0,1', side: '0,90,0,0,0,1', top: '80,0,0,0,0,1' }
        : undefined;
    const gamepad = params.get('gamepad') === '1';
    //   ?empty=1 → an empty view (the empty state)
    const emptyView = params.get('empty') === '1';
    // Rendering / perf surface (Phase 6):
    //   ?planes=N     → N generated planes (stress mode on)
    //   ?bench=1      → after boot, a scripted orbit + pan + zoom over 240 frames → window.__rtBench
    //   ?debug=1      → development.spaceDebugger + planeDebugger (the perf HUD)
    //   ?culling=1    → space.culling.enabled (+ ?cullDistance=<n>, ?freezeDistance=<n>)
    //   ?depthFade=1  → elements.plane.depthFade.enabled
    const bench = params.get('bench') === '1';
    const debug = params.get('debug') === '1';
    const cullingOn = params.get('culling') === '1';
    const cullDistance = params.get('cullDistance') ? Number(params.get('cullDistance')) : undefined;
    const freezeDistance = params.get('freezeDistance') ? Number(params.get('freezeDistance')) : undefined;
    const depthFade = params.get('depthFade') === '1';
    // Selection / editing surface (Phase 5): ?resizable=1 → elements.plane.resizable · ?snapGrid=50
    const resizable = params.get('resizable') === '1';
    const snapGrid = params.get('snapGrid') ? Number(params.get('snapGrid')) : undefined;
    const gestures = (rotateSens !== undefined || dragThreshold !== undefined || buttonMap
        || touchOne || trackpadScroll || momentumOff || wheelPolicy || doubleClickOff || gamepad)
        ? {
            ...(gamepad ? { gamepad: { enabled: true } } : {}),
            ...(rotateSens !== undefined ? { rotateSensitivity: rotateSens } : {}),
            ...(dragThreshold !== undefined ? { dragThreshold } : {}),
            ...(buttonMap ? { buttonMap } : {}),
            ...(touchOne ? { touchOne } : {}),
            ...(trackpadScroll ? { trackpadScroll } : {}),
            ...(momentumOff ? { disableMomentum: true } : {}),
            ...(wheelPolicy ? { wheel: wheelPolicy } : {}),
            ...(doubleClickOff ? { doubleClickFrame: false } : {}),
        }
        : undefined;
    // Shortcut config (Tier 3): ?scDisable=all | ?scDisable=modeRotation,modeScale | ?scRemap=modeRotation:KeyP
    // onUnhandledKey is ALWAYS wired to a window collector so a test can assert it fires.
    const scDisableRaw = params.get('scDisable');
    const scDisabled = scDisableRaw === 'all'
        ? true
        : (scDisableRaw ? scDisableRaw.split(',') as any : undefined);
    const scRemapRaw = params.get('scRemap');
    const scKeymap = scRemapRaw
        ? Object.fromEntries(scRemapRaw.split(',').map((pair) => pair.split(':'))) as any
        : undefined;
    const shortcuts = {
        ...(scDisabled !== undefined ? { disabled: scDisabled } : {}),
        ...(scKeymap ? { keymap: scKeymap } : {}),
        onUnhandledKey: (event: KeyboardEvent) => {
            const log: string[] = ((window as any).__rtUnhandled = (window as any).__rtUnhandled || []);
            log.push(event.code);
        },
    };
    // Tier 3 UI overrides: ?slotToolbar=1 (custom toolbar render-slot) · ?hideLinks=1 (hide plane links)
    const slotToolbar = params.get('slotToolbar') === '1';
    const hideLinks = params.get('hideLinks') === '1';
    // Substrate-seam verification surface (default OFF):
    //   ?media=1             → add a consumer-style media plane (usePluridPlane lens,
    //                          lazy image, button-driven video; window.__rtPlaneLens)
    //   ?spaceW=900&spaceH=600 → space.dimensions (the opt-in roots-container sizing)
    const media = params.get('media') === '1';
    const spaceW = params.get('spaceW') ? Number(params.get('spaceW')) : undefined;
    const spaceH = params.get('spaceH') ? Number(params.get('spaceH')) : undefined;
    // Camera-core verification surface (default OFF):
    //   ?perspective=1300   → space.perspective (the CSS lens; read by the camera now)
    //   ?pitchLimit=60      → space.navigation.pitchLimit (orbit never flips past it)
    //   ?vp=2               → space.viewpointURLVersion 2 (full-camera viewpoints in the URL/callback)
    const perspectiveParam = params.get('perspective') ? Number(params.get('perspective')) : undefined;
    const pitchLimitParam = params.get('pitchLimit') ? Number(params.get('pitchLimit')) : undefined;
    const viewpointVersion = params.get('vp') === '2' ? 2 as const : undefined;
    //   ?reducedMotion=1 → navigation.motion.reducedMotion 'respect' is the default; this forces
    //   every tween/fling instant regardless of the OS setting (for deterministic tests).
    const reducedMotion = params.get('reducedMotion') === '1';
    //   ?motionMs=1200 → navigation.motion.duration (a longer tween for timing-tolerant tests)
    const motionMs = params.get('motionMs') ? Number(params.get('motionMs')) : undefined;
    //   ?pivot=view|selection|cursor → navigation.orbitPivot
    const orbitPivot = params.get('pivot') as any;
    // Link/tree verification surface (Phase 3):
    //   ?links=dense → the GEOMETRY plane carries six links (two to the same route)
    //   ?nested=3    → registers a chain of N planes, each linking to the next; GEOMETRY links to
    //                  the first, so a test can spawn a 3-deep chain and check the fan angles
    //   window.__rtTree() → the live space tree
    const denseLinks = params.get('links') === 'dense';
    const nested = params.get('nested') ? Number(params.get('nested')) : 0;
    const spaceDimensions = (spaceW !== undefined || spaceH !== undefined)
        ? {
            ...(spaceW !== undefined ? { width: spaceW } : {}),
            ...(spaceH !== undefined ? { height: spaceH } : {}),
        }
        : undefined;
    // assertion helper: read the roots container's applied size
    if (typeof window !== 'undefined') {
        (window as any).__rtRootsSize = () => {
            const roots = document.querySelector('[data-plurid-entity="PluridRoots"]') as HTMLElement | null;
            return roots
                ? { width: roots.style.width, height: roots.style.height }
                : undefined;
        };
    }

    // A throwaway in-memory backend so a test can confirm writes land HERE (not localStorage).
    const memoryAdapter = React.useMemo(() => {
        if (!memoryStore) return undefined;
        const map: Map<string, string> = ((window as any).__rtStore =
            (window as any).__rtStore || new Map());
        return {
            getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
            setItem: (k: string, v: string) => { map.set(k, v); },
            removeItem: (k: string) => { map.delete(k); },
        };
    }, [memoryStore]);

    // Built with the flat-config shorthand (`definePluridConfiguration`) rather than the full
    // 5-level nested object — exercises that API end-to-end and doubles as its usage example.
    const configuration = definePluridConfiguration({
        theme: 'plurid',
        center: true,
        layout: stress ? { type: SPACE_LAYOUT.COLUMNS, columns: 8, gap: 0.04 } : active.layout,
        planeWidth: stress ? 0.16 : 0.32,
        // Tune the link-spawn bridge length (default 100). Drives both the gap between parent
        // and child AND the rendered bridge, so they stay aligned.
        bridgeLength: 160,
        // Opt-in 2D overview (engine feature #7).
        minimap: true,
        // Tier 2 opt-outs (only set when the query param is present, else default).
        ...(undoOff ? { undo: false } : {}),
        ...(persistMs !== undefined ? { timings: { persistDebounce: persistMs } } : {}),
        // Tier 3 gesture-feel overrides.
        ...(gestures ? { gestures } : {}),
        // Tier 3 shortcut control (onUnhandledKey always on; disabled/keymap via params).
        shortcuts,
        // Tier 3 element show-flags (nested via `extend`).
        ...((hideLinks || debug) ? {
            extend: {
                ...(hideLinks ? { elements: { planeLinks: { show: false }, alignmentGuides: { show: false } } } : {}),
                ...(debug ? { development: { spaceDebugger: true, planeDebugger: true } } : {}),
            },
        } : {}),
        // Opt-in roots-container sizing (the E2/D2 substrate seam).
        ...(spaceDimensions ? { spaceDimensions } : {}),
        // Camera core knobs.
        ...(perspectiveParam !== undefined ? { perspective: perspectiveParam } : {}),
        ...((pitchLimitParam !== undefined || reducedMotion || orbitPivot || homeParam || presets || motionMs !== undefined) ? {
            navigation: {
                ...(pitchLimitParam !== undefined ? { pitchLimit: pitchLimitParam } : {}),
                ...(orbitPivot ? { orbitPivot } : {}),
                ...(reducedMotion ? { motion: { duration: 0 } } : {}),
                ...(!reducedMotion && motionMs !== undefined ? { motion: { duration: motionMs } } : {}),
                ...(homeParam ? { home: homeParam } : {}),
                ...(presets ? { presets } : {}),
            },
        } : {}),
        ...(viewpointVersion ? { viewpointURLVersion: viewpointVersion } : {}),
        ...(resizable ? { planeResizable: true } : {}),
        ...(snapGrid ? { snap: { enabled: true, threshold: 12, grid: snapGrid } } : {}),
        ...(cullingOn ? { culling: { enabled: true, ...(cullDistance ? { distance: cullDistance } : {}), ...(freezeDistance ? { freezeDistance } : {}) } } : {}),
        ...(depthFade ? { planeDepthFade: { enabled: true } } : {}),
    });

    // A plane registered but NOT in the initial `view` — a plurid link spawns it into the
    // space (joined to its parent by a bridge). This is the "planes are pages" core.
    const DETAIL_ROUTE = '/geometry/detail';
    const detailPlane: PluridReactPlane = {
        route: DETAIL_ROUTE,
        component: () => (
            <Panel
                title="GEOMETRY · DETAIL"
                code="G-01·D"
                accent="#4da3ff"
                rows={[['edges', '6 140'], ['normals', 'per-vertex'], ['uv sets', '2'], ['lod', '3']]}
            />
        ),
    };

    const geometryLinks = [
        ...(denseLinks ? [
            { route: '/material', label: 'material' },
            { route: '/topology', label: 'topology' },
            { route: DETAIL_ROUTE, label: 'detail again' },
            { route: '/tessellation', label: 'tessellation' },
            { route: '/transform', label: 'transform' },
        ] : []),
        ...(nested > 0 ? [{ route: '/chain-1', label: 'chain' }] : []),
    ];
    const chainPlanes: PluridReactPlane[] = Array.from({ length: nested }, (_, i) => {
        const index = i + 1;
        return {
            route: `/chain-${index}`,
            component: () => (
                <Panel
                    title={`CHAIN · ${index}`}
                    code={`C-${String(index).padStart(2, '0')}`}
                    accent="#ffb454"
                    rows={[['depth', `${index}`], ['next', index < nested ? `/chain-${index + 1}` : 'none']]}
                    link={index < nested ? { route: `/chain-${index + 1}`, label: 'next' } : undefined}
                />
            ),
        };
    });

    const planes: PluridReactPlane[] = [
        ...source.map((panel) => ({
            route: panel.route,
            component: () => (
                <Panel
                    title={panel.title}
                    code={panel.code}
                    accent={panel.accent}
                    rows={panel.rows}
                    link={panel.route === '/geometry' ? { route: DETAIL_ROUTE, label: 'open detail' } : undefined}
                    links={panel.route === '/geometry' ? geometryLinks : undefined}
                />
            ),
        })),
        detailPlane,
        ...chainPlanes,
        // ?media=1 - the consumer-built media plane (the substrate-seam proof).
        ...(media ? [{ route: '/media', component: MediaPlane }] : []),
    ];

    // `view` = the initially-visible roots. DETAIL_ROUTE is intentionally absent → it only
    // appears when the link is clicked.
    const view = emptyView
        ? []
        : [
            ...source.map((panel) => panel.route),
            ...(media ? ['/media'] : []),
        ];

    return (
        <>
            <div
                style={{
                    position: 'fixed', top: 16, left: 16, zIndex: 9999,
                    display: 'flex', gap: 6,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
            >
                {LAYOUTS.map((l) => (
                    <button
                        key={l.key}
                        onClick={() => { setStress(false); setLayoutKey(l.key); }}
                        style={{
                            padding: '6px 10px', fontSize: 11, letterSpacing: '0.08em',
                            cursor: 'pointer', borderRadius: 6,
                            border: '1px solid ' + (!stress && l.key === layoutKey ? '#4da3ff' : '#ffffff22'),
                            background: !stress && l.key === layoutKey ? '#4da3ff22' : '#0d0f12cc',
                            color: !stress && l.key === layoutKey ? '#cfe6ff' : '#aab2bd',
                        }}
                    >
                        {l.label}
                    </button>
                ))}
                <button
                    onClick={() => setStress((s) => !s)}
                    style={{
                        padding: '6px 10px', fontSize: 11, letterSpacing: '0.08em',
                        cursor: 'pointer', borderRadius: 6,
                        border: '1px solid ' + (stress ? '#ff7b72' : '#ffffff22'),
                        background: stress ? '#ff7b7222' : '#0d0f12cc',
                        color: stress ? '#ffd2cd' : '#aab2bd',
                    }}
                >
                    STRESS·{STRESS_COUNT}
                </button>
                <button
                    onClick={() => setPersist((p) => {
                        const next = !p;
                        if (typeof localStorage !== 'undefined') {
                            localStorage.setItem('rt-persist', next ? '1' : '0');
                        }
                        return next;
                    })}
                    style={{
                        padding: '6px 10px', fontSize: 11, letterSpacing: '0.08em',
                        cursor: 'pointer', borderRadius: 6,
                        border: '1px solid ' + (persist ? '#7ee787' : '#ffffff22'),
                        background: persist ? '#7ee78722' : '#0d0f12cc',
                        color: persist ? '#bff7c4' : '#aab2bd',
                    }}
                    title="Persist the space to localStorage; reload restores it"
                >
                    PERSIST
                </button>
            </div>

            <PluridApplication
                key={(stress ? 'stress' : 'base') + (persist ? '-p' : '')}
                configuration={configuration}
                planes={planes}
                view={view}
                useLocalStorage={persist || memoryStore}
                storageAdapter={memoryAdapter}
                id={'rt' + (stress ? '-stress' : '')}
                onPersistContent={() => (window as any).__rtContent}
                onRestoreContent={(c) => { (window as any).__rtRestored = c; }}
                onViewpointChange={(v) => { (window as any).__rtViewpoint = v; }}
                onReady={(api) => {
                    (window as any).__pluridApi = api;
                    // Camera assertion helpers: the live camera, the v2 viewpoint, and a
                    // dispatch/frame counter for perf assertions.
                    (window as any).__rtCamera = () => api.store.getState().space.camera;
                    (window as any).__rtTree = () => api.store.getState().space.tree;
                    (window as any).__rtViewpoint2 = () => api.getViewpoint({ version: 2 });
                    const perf = ((window as any).__rtPerf = { dispatches: 0, frames: 0 });
                    // Which top-level slice keys changed on each notification (a no-op dispatch
                    // logs `[]`) — for "nothing dispatches while idle" assertions.
                    const changes: string[][] = ((window as any).__rtChanges = []);
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

                    // ?bench=1: a scripted orbit + pan + zoom, 240 frames, one camera delta per
                    // frame; frame times from rAF deltas → window.__rtBench.
                    if (new URLSearchParams(location.search).get('bench') === '1') {
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
                            (window as any).__rtBench = {
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
                }}
                renderToolbar={slotToolbar
                    ? () => (
                        <div
                            id="rt-custom-toolbar"
                            style={{ position: 'fixed', bottom: 12, left: 12, zIndex: 9999, color: '#7ee787' }}
                        >
                            CUSTOM TOOLBAR
                        </div>
                    )
                    : undefined}
            />
        </>
    );
};


export default App;
