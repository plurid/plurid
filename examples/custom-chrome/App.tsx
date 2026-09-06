/**
 * Custom chrome — the headless mode with the host's own controls.
 *
 * `chrome: 'none'` renders a bare space: planes, links and bridges, no toolbar, viewcube, minimap,
 * plane bars, rail or `?`. Every key and every topic still work. The host draws its own bar through a
 * render slot (a slot renders whatever the mode), built on the hooks and on the exported primitives —
 * a PILL and a PANEL on the look's tokens — so it matches the look by construction. The look itself is
 * a preset with one token laid over it.
 *
 * Type-correct against the public `@plurid/plurid-react` API.
 */

import React from 'react';
import {
    PluridApplication,
    PluridReactPlane,
    PluridPanel,
    PluridPill,
    PluridKey,
    useCamera,
    useSelection,
    usePluridHistory,
    useLook,
} from '@plurid/plurid-react';


const page = {
    padding: 24,
    height: '100%',
    background: 'var(--plurid-plane)',
    color: 'var(--plurid-plane-ink)',
    fontFamily: 'var(--plurid-font)',
} as const;


const planes: PluridReactPlane[] = [
    { route: '/one',   component: () => <div style={page}><h3>Plane one</h3><p>The bar below is the host's.</p></div> },
    { route: '/two',   component: () => <div style={page}><h3>Plane two</h3><p>No engine chrome at all.</p></div> },
    { route: '/three', component: () => <div style={page}><h3>Plane three</h3><p>Every key still works.</p></div> },
];


/**
 * The host's bar: rendered INSIDE the application through `renderToolbar`, so the hooks read the
 * engine directly. `PluridPanel` and `PluridPill` are the engine's own vocabulary; the bar reads
 * on every look because it is drawn from the same `--plurid-*` tokens.
 */
const Bar: React.FC = () => {
    const camera = useCamera();
    const selection = useSelection();
    const history = usePluridHistory();
    const look = useLook();

    return (
        <PluridPanel
            data-plurid-overlay="host-bar"
            style={{
                position: 'absolute',
                left: 'var(--plurid-margin)',
                right: 'var(--plurid-margin)',
                bottom: 'var(--plurid-margin)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--plurid-gap)',
                padding: 'var(--plurid-gap)',
            }}
        >
            <PluridPill type="button" aria-label="Fit everything" onClick={() => camera.fit()}>⤢</PluridPill>
            <PluridPill type="button" aria-label="Home" onClick={() => camera.home()}>⌂</PluridPill>
            <PluridPill type="button" aria-label="Undo" onClick={() => history.undo()}>↶</PluridPill>
            <PluridPill type="button" aria-label="Redo" onClick={() => history.redo()}>↷</PluridPill>
            <span style={{ flex: 1, color: 'var(--plurid-ink-muted)', fontSize: 'var(--plurid-font-size-small)' }}>
                {selection.selected.length} selected · zoom {camera.camera.scale.toFixed(2)} · look {look.name}
            </span>
            <span style={{ color: 'var(--plurid-ink-muted)', fontSize: 'var(--plurid-font-size-small)' }}>
                <PluridKey>G</PluridKey> grab · <PluridKey>0</PluridKey> fit
            </span>
        </PluridPanel>
    );
};


const App: React.FC = () => (
    <PluridApplication
        planes={planes}
        view={['/one', '/two', '/three']}
        configuration={{
            chrome: 'none',
            look: { preset: 'ink', tokens: { radius: '999px' } },
        }}
        renderToolbar={() => <Bar />}
    />
);


export default App;
