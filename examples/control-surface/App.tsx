/**
 * Developer-Control Surface — a runnable reference.
 *
 * A tiny "spatial notes" skeleton that exercises EVERY tier of the control surface in one place:
 *   Tier 0  onReady(api) / ref ...... the escape hatch (store + pubsub + synchronous reads) and the
 *                                     typed imperative handle (camera / selection / history / tree)
 *   Tier 1  pubsub control/observe .. typed topics; `usePluridPubSub` for one-line observers
 *   Hooks   useCamera / useSelection / usePluridHistory — for anything rendered under the app
 *   Tier 2  opt-outs ................ a sessionStorage adapter + tuned timings (undo left ON)
 *   Tier 3  knobs/UI/exports ........ gestures.buttonMap, shortcuts, presets, a custom toolbar slot
 *
 * Companion to docs/CONTROL_SURFACE.md. Type-correct against the public `@plurid/plurid-react` API.
 */

import React, { useRef, useState } from 'react';
import {
    PluridApplication,
    PluridApplicationHandle,
    PluridReactPlane,
    PluridStorageAdapter,
    PLURID_PUBSUB_TOPIC,
    definePluridConfiguration,
    SPACE_LAYOUT,
    useCamera,
    useSelection,
    usePluridHistory,
    usePluridPubSub,
} from '@plurid/plurid-react';


// A couple of notes, each rendered as a plane. (In a real app these come from your store / backend.)
const NOTES = [
    { route: '/notes/intro', title: 'Intro', body: 'Welcome to spatial notes.' },
    { route: '/notes/ideas', title: 'Ideas', body: 'Everything is a plane in space.' },
    { route: '/notes/todo', title: 'Todo', body: 'Wire the editor through the persistence seam.' },
];


// Tier 2 — persist to sessionStorage instead of localStorage (engine still owns serialization).
const sessionAdapter: PluridStorageAdapter = {
    getItem: (key) => sessionStorage.getItem(key),
    setItem: (key, value) => { sessionStorage.setItem(key, value); },
    removeItem: (key) => { sessionStorage.removeItem(key); },
};


// Built with the flat preset — every knob reachable without the nested config object.
const configuration = definePluridConfiguration({
    theme: 'plurid',
    layout: { type: SPACE_LAYOUT.COLUMNS, columns: 3, gap: 0.06 },

    // Tier 2 — tune the debounces (undo is intentionally left ON / default).
    timings: { persistDebounce: 500, viewpointChangeDebounce: 250 },

    // Tier 3 — make a plain left-drag orbit directly (no grab mode), keep the wheel for the page.
    gestures: {
        rotateSensitivity: 0.25,
        buttonMap: { left: 'orbit', wheel: 'disabled' },
    },

    // Tier 3 — named viewpoints and a home; every programmatic move is an interruptible tween.
    navigation: {
        home: '0,0,0,0,0,1',
        presets: { overview: '25,0,0,0,0,0.6', side: '0,90,0,0,0,1' },
    },

    // Tier 3 — the app owns Cmd/Ctrl+K for its own palette; everything else stays default.
    shortcuts: {
        onUnhandledKey: (event) => {
            if ((event.metaKey || event.ctrlKey) && event.code === 'KeyK') {
                event.preventDefault();
                // openCommandPalette();
            }
        },
    },
});


// The planes are a module constant: a `planes` array rebuilt on every render would recompute the
// store on every render (the engine warns about that in development).
const planes: PluridReactPlane[] = NOTES.map((note) => ({
    route: note.route,
    component: () => (
        <article style={{ padding: 16, background: '#0d0f12', color: '#cfe6ff', height: '100%' }}>
            <h3>{note.title}</h3>
            <p>{note.body}</p>
        </article>
    ),
}));
const view = NOTES.map((n) => n.route);


/**
 * The app's own chrome, rendered through the `renderToolbar` slot — INSIDE the application, so
 * the hooks read the engine directly: no ref threading, no snapshot diffing.
 */
const Toolbar: React.FC = () => {
    const camera = useCamera();
    const selection = useSelection();
    const history = usePluridHistory();
    const [lastKind, setLastKind] = useState('');

    // Tier 1 OBSERVE — one typed subscription, kept current across renders.
    usePluridPubSub(PLURID_PUBSUB_TOPIC.CHANGED, ({ kind }) => {
        setLastKind(kind);
    });

    return (
        <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 50, display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => camera.fit()}>Fit all</button>
            <button onClick={() => camera.home()}>Home</button>
            <button onClick={() => camera.preset('overview')}>Overview</button>
            <button onClick={() => camera.bookmark('desk', 'save')}>Save desk</button>
            <button onClick={() => camera.bookmark('desk')} disabled={!camera.bookmarks.desk}>Go desk</button>
            <button onClick={() => history.undo()} disabled={!history.canUndo}>Undo</button>
            <button onClick={() => history.redo()} disabled={!history.canRedo}>Redo</button>
            <button onClick={() => selection.selectAll()}>Select all</button>
            <button onClick={() => selection.align('top')} disabled={selection.selected.length < 2}>Align top</button>
            <span style={{ color: '#7ee787' }}>
                {selection.selected.length} selected · {camera.motion} · last change: {lastKind || '-'}
            </span>
        </div>
    );
};


const App: React.FC = () => {
    // Tier 0 — the typed imperative handle: the `onReady` api plus camera / selection / history / tree.
    const plurid = useRef<PluridApplicationHandle>(null);

    return (
        <PluridApplication
            ref={plurid}
            configuration={configuration}
            planes={planes}
            view={view}
            id="spatial-notes"

            // Tier 2 — persistence routed to sessionStorage.
            useLocalStorage
            storageAdapter={sessionAdapter}

            // Tier 1 — the camera, debounced (e.g. for a share link). The engine never touches the URL.
            onViewpointChange={(viewpoint) => {
                // updateShareLink(viewpoint);
                void viewpoint;
            }}

            // Tier 0 — the escape hatch. The same api the ref's handle extends.
            onReady={(api) => {
                // e.g. frame the first note once the layout resolved, without animation
                api.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.SPACE_FRAME, data: { animate: false } });
                // later, from anywhere: plurid.current?.camera.frame({ planeID }), .tree.spawn(route, parentID) …
            }}

            // Tier 3 — replace the engine toolbar with the app's own chrome (hooks inside).
            renderToolbar={() => <Toolbar />}
        />
    );
};


export default App;
