import React, { useState } from 'react';
import {
    PluridApplication,
    PluridReactPlane,
    SPACE_LAYOUT,
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


const App = () => {
    const [layoutKey, setLayoutKey] = useState('columns');
    const active = LAYOUTS.find((l) => l.key === layoutKey) ?? LAYOUTS[0];

    const configuration: any = {
        global: { theme: 'plurid' },
        space: { layout: active.layout, center: true },
        elements: { plane: { width: 0.32 } },
    };

    const planes: PluridReactPlane[] = PANELS.map((panel) => ({
        route: panel.route,
        component: () => (
            <Panel title={panel.title} code={panel.code} accent={panel.accent} rows={panel.rows} />
        ),
    }));

    const view = PANELS.map((panel) => panel.route);

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
                        onClick={() => setLayoutKey(l.key)}
                        style={{
                            padding: '6px 10px', fontSize: 11, letterSpacing: '0.08em',
                            cursor: 'pointer', borderRadius: 6,
                            border: '1px solid ' + (l.key === layoutKey ? '#4da3ff' : '#ffffff22'),
                            background: l.key === layoutKey ? '#4da3ff22' : '#0d0f12cc',
                            color: l.key === layoutKey ? '#cfe6ff' : '#aab2bd',
                        }}
                    >
                        {l.label}
                    </button>
                ))}
            </div>

            <PluridApplication
                key={layoutKey}
                configuration={configuration}
                planes={planes}
                view={view}
            />
        </>
    );
};


export default App;
