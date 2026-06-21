/**
 * Minimal plurid' — the hello-world.
 *
 * Three planes laid out in a navigable 3D space, with zero configuration. Drag to orbit, scroll to zoom,
 * hold G to grab-pan, press ? for the shortcuts overlay. Everything beyond this is opt-in — see
 * ../control-surface for the same idea wired through every control seam, and ../../GETTING_STARTED.md
 * for the walkthrough.
 *
 * Type-correct against the public `@plurid/plurid-react` API.
 */

import React from 'react';
import {
    PluridApplication,
    PluridReactPlane,
} from '@plurid/plurid-react';


const page = {
    padding: 24,
    height: '100%',
    background: '#0d0f12',
    color: '#cfe6ff',
    fontFamily: 'system-ui, sans-serif',
} as const;


// A plane is a `route` (its address) + a `component` (what renders on it).
const planes: PluridReactPlane[] = [
    { route: '/one',   component: () => <div style={page}><h3>Plane one</h3><p>Drag to orbit.</p></div> },
    { route: '/two',   component: () => <div style={page}><h3>Plane two</h3><p>Scroll to zoom.</p></div> },
    { route: '/three', component: () => <div style={page}><h3>Plane three</h3><p>Hold G to grab-pan.</p></div> },
];

// The view is the initial arrangement: which routes to show on first render.
const view = ['/one', '/two', '/three'];


const App: React.FC = () => (
    <PluridApplication
        planes={planes}
        view={view}
    />
);


export default App;
