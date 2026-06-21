/**
 * Developer-Control Surface — a runnable reference.
 *
 * A tiny "spatial notes" skeleton that exercises EVERY tier of the control surface in one place:
 *   Tier 0  onReady(api) ............ the escape hatch (store + pubsub + synchronous reads)
 *   Tier 1  pubsub control/observe .. fit-to-view button + react to selection changes
 *   Tier 2  opt-outs ................ a sessionStorage adapter + tuned timings (undo left ON)
 *   Tier 3  knobs/UI/exports ........ gestures.buttonMap, shortcuts, a custom toolbar render-slot
 *
 * Companion to docs/CONTROL_SURFACE.md. Type-correct against the public `@plurid/plurid-react` API.
 */

import React, { useRef, useState } from 'react';
import {
    PluridApplication,
    PluridReactPlane,
    PluridApi,
    PluridStorageAdapter,
    PLURID_PUBSUB_TOPIC,
    definePluridConfiguration,
    SPACE_LAYOUT,
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


const App: React.FC = () => {
    const apiRef = useRef<PluridApi | null>(null);
    const [selectionCount, setSelectionCount] = useState(0);

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

    return (
        <PluridApplication
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

            // Tier 0 — the escape hatch. Wire control + observe once the engine is live.
            onReady={(api) => {
                apiRef.current = api;

                // Tier 1 OBSERVE — react to selection changes with ONE subscription.
                api.pubsub.subscribe({
                    topic: PLURID_PUBSUB_TOPIC.CHANGED, // 'space.changed'
                    callback: ({ kind, value }) => {
                        if (kind === 'selection') {
                            setSelectionCount((value as string[]).length);
                        }
                    },
                });
            }}

            // Tier 3 — replace the engine toolbar with the app's own chrome.
            renderToolbar={() => (
                <div style={{ position: 'fixed', top: 16, left: 16, zIndex: 9999, display: 'flex', gap: 8 }}>
                    <button
                        // Tier 1 CONTROL — drive the engine declaratively over the pubsub bus.
                        onClick={() => apiRef.current?.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.FIT_TO_VIEW })}
                    >
                        Fit all
                    </button>
                    <button
                        onClick={() => apiRef.current?.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.UNDO })}
                    >
                        Undo
                    </button>
                    <span style={{ color: '#7ee787', alignSelf: 'center' }}>
                        {selectionCount} selected
                    </span>
                </div>
            )}
        />
    );
};


export default App;
