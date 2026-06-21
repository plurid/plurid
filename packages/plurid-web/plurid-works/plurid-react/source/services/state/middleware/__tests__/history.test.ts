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
});
// #endregion module
