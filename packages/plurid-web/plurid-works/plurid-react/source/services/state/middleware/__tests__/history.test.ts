// #region imports
    // #region libraries
    import {
        configureStore,
    } from '@reduxjs/toolkit';
    // #endregion libraries


    // #region internal
    import createHistoryMiddleware from '../history';
    // #endregion internal
// #endregion imports



// #region module
/**
 * The spatial-undo history middleware records ONE entry per real authoring change (structure / manual
 * position / link), ignores relayout reflows + camera churn (signature unchanged), and skips a peer's
 * remotely-applied change. Tested against a real RTK store with a minimal arrangement reducer + the
 * REAL `arrangementSignature` (imported by the middleware) — so the "what counts as a change" logic is
 * the production one. Mirrors the R1/R2 + harness verifications.
 */
const initialState = {
    space: {
        rotationX: 0, // a camera-ish scalar — changing it must NOT record history
        tree: [{ planeID: '/a', show: true }],
        links: [] as any[],
        history: { canUndo: false, canRedo: false, undoDepth: 0, redoDepth: 0, past: [] as any[], future: [] as any[] },
    },
};

const reducer = (state = initialState, action: any) => {
    switch (action.type) {
        case 'TOGGLE_SHOW':
            return { space: { ...state.space, tree: state.space.tree.map((n) => ({ ...n, show: !n.show })) } };
        case 'ADD_LINK':
            return { space: { ...state.space, links: [...state.space.links, action.payload] } };
        case 'NOOP_CAMERA':
            // New state object, but tree + links keep their references (the orbit/zoom case).
            return { space: { ...state.space, rotationX: state.space.rotationX + 10 } };
        case 'space/restoreArrangement':
            return { space: { ...state.space, tree: action.payload.tree, links: action.payload.links } };
        case 'space/setHistoryStatus':
            return { space: { ...state.space, history: action.payload } };
        default:
            return state;
    }
};

const makeStore = () => configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false, immutableCheck: false })
            .concat(createHistoryMiddleware()),
});

const show = (store: any) => store.getState().space.tree[0].show;
const linkCount = (store: any) => store.getState().space.links.length;


describe('createHistoryMiddleware', () => {
    it('records an authoring change and undo reverts it', () => {
        const store = makeStore();
        expect(show(store)).toBe(true);

        store.dispatch({ type: 'TOGGLE_SHOW' });
        expect(show(store)).toBe(false);

        store.dispatch({ type: 'space/undo' });
        expect(show(store)).toBe(true);
    });

    it('redo reapplies the undone change', () => {
        const store = makeStore();
        store.dispatch({ type: 'TOGGLE_SHOW' });
        store.dispatch({ type: 'space/undo' });
        expect(show(store)).toBe(true);

        store.dispatch({ type: 'space/redo' });
        expect(show(store)).toBe(false);
    });

    it('undo with an empty stack is a no-op', () => {
        const store = makeStore();
        store.dispatch({ type: 'space/undo' });
        expect(show(store)).toBe(true);
        expect(linkCount(store)).toBe(0);
    });

    it('does NOT record a camera change (tree + links references unchanged)', () => {
        const store = makeStore();
        store.dispatch({ type: 'NOOP_CAMERA' });
        expect(store.getState().space.rotationX).toBe(10);

        // Nothing was recorded → undo can't revert the camera (it isn't arrangement history).
        store.dispatch({ type: 'space/undo' });
        expect(store.getState().space.rotationX).toBe(10);
    });

    it('skips a remotely-applied change (meta.remote) — not in YOUR undo', () => {
        const store = makeStore();
        store.dispatch({ type: 'ADD_LINK', payload: { id: 'L1', sourcePlaneID: '/a', targetPlaneID: '/b', kind: 'ref' }, meta: { remote: true } });
        expect(linkCount(store)).toBe(1); // applied to state...

        store.dispatch({ type: 'space/undo' }); // ...but never recorded, so undo no-ops
        expect(linkCount(store)).toBe(1);
    });

    it('a fresh authoring change invalidates the redo branch', () => {
        const store = makeStore();
        store.dispatch({ type: 'TOGGLE_SHOW' });       // show -> false (recorded)
        store.dispatch({ type: 'space/undo' });        // show -> true  (redo now holds the toggle)
        store.dispatch({ type: 'ADD_LINK', payload: { id: 'L2', sourcePlaneID: '/a', targetPlaneID: '/c', kind: 'ref' } });

        // The redo branch was cleared by the new action → redo does nothing.
        store.dispatch({ type: 'space/redo' });
        expect(show(store)).toBe(true);
        expect(linkCount(store)).toBe(1);
    });

    it('only ONE entry per user action — multi-step undo walks back through them', () => {
        const store = makeStore();
        store.dispatch({ type: 'TOGGLE_SHOW' });        // entry 1: show false
        store.dispatch({ type: 'ADD_LINK', payload: { id: 'L3', sourcePlaneID: '/a', targetPlaneID: '/d', kind: 'ref' } }); // entry 2: link

        store.dispatch({ type: 'space/undo' });          // undo link
        expect(linkCount(store)).toBe(0);
        expect(show(store)).toBe(false);

        store.dispatch({ type: 'space/undo' });          // undo toggle
        expect(show(store)).toBe(true);
    });

    it("a peer's applied change REBASES the local undo/redo stacks: undo restores the local change on its plane and keeps the peer's work (2026-09-10)", () => {
        const store = makeStore();
        store.dispatch({ type: 'TOGGLE_SHOW' });                       // local: A hidden — one entry
        const afterLocal = store.getState().space.tree;
        // the peer, who saw A hidden, adds B (hidden)
        store.dispatch({
            type: 'space/restoreArrangement',
            payload: { tree: [{ planeID: '/a', show: false }, { planeID: '/b', show: false }], links: [] },
            meta: { remote: true },
        });
        const afterRemote = store.getState().space.tree;
        expect(afterRemote).not.toBe(afterLocal);
        store.dispatch({ type: 'space/undo' });
        // the local change undone (A shown again), the peer's plane kept
        const undone = store.getState().space.tree;
        expect(undone.map((node: any) => node.planeID)).toEqual(['/a', '/b']);
        expect(undone[0].show).toBe(true);
        expect(undone[1].show).toBe(false);
        store.dispatch({ type: 'space/redo' });
        expect(store.getState().space.tree[0].show).toBe(false);
        expect(store.getState().space.tree[1].show).toBe(false);
    });

    it("a peer's change identical to the local history's target drops the snapshot: nothing local is left to undo", () => {
        const store = makeStore();
        store.dispatch({ type: 'TOGGLE_SHOW' });                       // local: A hidden
        store.dispatch({
            type: 'space/restoreArrangement',
            payload: { tree: [{ planeID: '/a', show: true }], links: [] },   // the peer shows A: the undo target
            meta: { remote: true },
        });
        const afterRemote = store.getState().space.tree;
        store.dispatch({ type: 'space/undo' });
        expect(store.getState().space.tree).toBe(afterRemote);
    });

    it('every entry carries the name of its change and when it happened; the status lists them', () => {
        const store = makeStore();
        const history = () => store.getState().space.history;

        store.dispatch({ type: 'TOGGLE_SHOW' });
        store.dispatch({ type: 'TOGGLE_SHOW' });
        expect(history().past.map((entry: any) => entry.label)).toEqual(['closed /a', 'opened /a']);
        expect(history().future).toEqual([]);
        for (const entry of history().past) {
            expect(entry.at).toBeGreaterThan(0);
        }

        // an undo moves the newest step into the future, carrying its own name
        store.dispatch({ type: 'space/undo' });
        expect(history().past.map((entry: any) => entry.label)).toEqual(['closed /a']);
        expect(history().future.map((entry: any) => entry.label)).toEqual(['opened /a']);
        expect(history().canUndo).toBe(true);
        expect(history().canRedo).toBe(true);
    });

    it('goTo jumps several steps as ONE restore, in both directions, and clamps to what exists', () => {
        const store = makeStore();
        const history = () => store.getState().space.history;

        store.dispatch({ type: 'TOGGLE_SHOW' });
        store.dispatch({ type: 'ADD_LINK', payload: { id: 'l1', sourcePlaneID: '/a', targetPlaneID: '/b' } });
        store.dispatch({ type: 'TOGGLE_SHOW' });
        expect(history().past).toHaveLength(3);
        expect(show(store)).toBe(true);
        expect(linkCount(store)).toBe(1);

        // two steps back, as ONE restore: the link is undone with the second show toggle
        store.dispatch({ type: 'space/historyGoTo', payload: { index: -2 } });
        expect(show(store)).toBe(false);
        expect(linkCount(store)).toBe(0);
        expect(history().past).toHaveLength(1);
        expect(history().future).toHaveLength(2);

        // and forward again: both steps redone in one restore
        store.dispatch({ type: 'space/historyGoTo', payload: { index: 2 } });
        expect(show(store)).toBe(true);
        expect(linkCount(store)).toBe(1);
        expect(history().past).toHaveLength(3);
        expect(history().future).toHaveLength(0);

        // past the end: clamped to what exists — the arrangement the space started from
        store.dispatch({ type: 'space/historyGoTo', payload: { index: -99 } });
        expect(history().past).toHaveLength(0);
        expect(history().canUndo).toBe(false);
        expect(show(store)).toBe(true);
        expect(linkCount(store)).toBe(0);
        const before = JSON.stringify(store.getState().space.tree);
        store.dispatch({ type: 'space/historyGoTo', payload: { index: -1 } });
        expect(JSON.stringify(store.getState().space.tree)).toBe(before);
    });
});
