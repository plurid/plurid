import React, { useState } from 'react';
import {
    PluridApplication,
    PluridReactPlane,
    PluridLink,
    SPACE_LAYOUT,
    definePluridConfiguration,
} from '@plurid/plurid-react';

import Panel, { PanelProps } from './Plane';


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


// A larger generated set to stress-test performance (many planes in one space).
const STRESS_COUNT = 40;
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
    const [stress, setStress] = useState(false);
    // PERSIST toggle is itself persisted so it survives a reload (needed to verify the
    // save→reload→restore round-trip). Each layout gets its own storage slot via `id`.
    const [persist, setPersist] = useState(
        typeof localStorage !== 'undefined' && localStorage.getItem('rt-persist') === '1',
    );
    const active = LAYOUTS.find((l) => l.key === layoutKey) ?? LAYOUTS[0];

    const source = stress ? STRESS_PANELS : PANELS;

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
                />
            ),
        })),
        detailPlane,
    ];

    // `view` = the initially-visible roots. DETAIL_ROUTE is intentionally absent → it only
    // appears when the link is clicked.
    const view = source.map((panel) => panel.route);

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
                key={layoutKey + (stress ? '-stress' : '') + (persist ? '-p' : '')}
                configuration={configuration}
                planes={planes}
                view={view}
                useLocalStorage={persist}
                id={'rt-' + layoutKey + (stress ? '-stress' : '')}
                onPersistContent={() => (window as any).__rtContent}
                onRestoreContent={(c) => { (window as any).__rtRestored = c; }}
                onViewpointChange={(v) => { (window as any).__rtViewpoint = v; }}
            />
        </>
    );
};


export default App;
