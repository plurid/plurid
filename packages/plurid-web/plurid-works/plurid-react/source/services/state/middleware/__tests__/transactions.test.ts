// #region imports
    // #region libraries
    import {
        configureStore,
    } from '@reduxjs/toolkit';
    // #endregion libraries


    // #region external
    import reducer from '../../store/reducer';
    import actions from '../../actions';
    import createHistoryMiddleware from '../history';
    // #endregion external
// #endregion imports



// #region module
const plane = (planeID: string, x = 0): any => ({
    sourceID: planeID,
    planeID,
    route: '/' + planeID,
    routeDivisions: {},
    width: 100,
    height: 100,
    location: { translateX: x, translateY: 0, translateZ: 0, rotateX: 0, rotateY: 0 },
    show: true,
});

const makeStore = () => configureStore({
    reducer,
    middleware: (getDefault) => getDefault({ serializableCheck: false }).concat(createHistoryMiddleware()),
});


describe('history transactions', () => {
    it('folds every move inside a transaction into one undo entry and publishes the status', () => {
        const store = makeStore();
        store.dispatch({ ...actions.space.restoreArrangement({ tree: [plane('a'), plane('b', 500)], links: [] }), meta: { history: 'skip' } });
        store.dispatch(actions.space.setSelection(['a']));
        expect(store.getState().space.history.canUndo).toBe(false);

        store.dispatch(actions.space.historyBegin());
        for (let i = 0; i < 30; i += 1) {
            store.dispatch(actions.space.transformSelectedPlanes({ deltaX: 2 }));
        }
        expect(store.getState().space.history.undoDepth).toBe(0);
        store.dispatch(actions.space.historyEnd());

        const history = store.getState().space.history;
        expect(history.undoDepth).toBe(1);
        expect(history.canUndo).toBe(true);
        expect(history.canRedo).toBe(false);
        expect(store.getState().space.tree[0].location.translateX).toBe(60);

        store.dispatch(actions.space.undo());
        expect(store.getState().space.tree[0].location.translateX).toBe(0);
        expect(store.getState().space.history.canRedo).toBe(true);
        expect(store.getState().space.history.canUndo).toBe(false);

        store.dispatch(actions.space.redo());
        expect(store.getState().space.tree[0].location.translateX).toBe(60);
    });

    it('records an untransacted change per action and honors meta.history skip', () => {
        const store = makeStore();
        store.dispatch({ ...actions.space.restoreArrangement({ tree: [plane('a')], links: [] }), meta: { history: 'skip' } });
        store.dispatch(actions.space.setSelection(['a']));
        store.dispatch(actions.space.transformSelectedPlanes({ deltaX: 5 }));
        store.dispatch(actions.space.transformSelectedPlanes({ deltaX: 5 }));
        expect(store.getState().space.history.undoDepth).toBe(2);

        store.dispatch({ ...actions.space.transformSelectedPlanes({ deltaX: 5 }), meta: { history: 'skip' } });
        expect(store.getState().space.history.undoDepth).toBe(2);
    });

    it('an empty transaction records nothing', () => {
        const store = makeStore();
        store.dispatch({ ...actions.space.restoreArrangement({ tree: [plane('a')], links: [] }), meta: { history: 'skip' } });
        store.dispatch(actions.space.historyBegin());
        store.dispatch(actions.space.historyEnd());
        expect(store.getState().space.history.undoDepth).toBe(0);
    });
});
// #endregion module
