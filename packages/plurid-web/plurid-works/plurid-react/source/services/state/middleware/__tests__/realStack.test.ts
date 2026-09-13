// #region imports
    // #region libraries
    import {
        defaultConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import actions from '~services/state/actions';

    import {
        alignSelection,
        distributeSelection,
        duplicateSelection,
        snapSelectionNow,
    } from '~services/state/thunks/selection';

    import {
        treePlane,
    } from '../../../../testing/fixtures';
    import {
        makeSpaceStore,
    } from '../../../../testing/store';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE REAL STACK: a thunk, through the real middleware, into the real reducer.
 *
 * Until 2026-09-13 no test anywhere did this. The reducer was tested with no store; the thunks
 * against a hand-rolled dispatch with no middleware; the history middleware against an 18-line FAKE
 * reducer with invented action types (`TOGGLE_SHOW`, `ADD_LINK`). Each piece was checked against a
 * stand-in for the other two, and the gap had a precise shape: AN ACTION THAT CHANGES THE
 * ARRANGEMENT BUT THAT THE MIDDLEWARE DOES NOT RECORD BREAKS UNDO, AND NOTHING WOULD FAIL.
 *
 * So this file walks the real editing vocabulary — every action and thunk a reader can reach — and
 * asserts the same two things of each: the change lands, and ONE undo takes it back.
 */
/** Three planes at three different places: an align or a distribute has something to do. */
const planes = () => [
    treePlane('/a', { location: { translateX: 0, translateY: 0 } }),
    treePlane('/b', { location: { translateX: 640, translateY: 120 } }),
    treePlane('/c', { location: { translateX: 900, translateY: 380 } }),
];

const store = () => makeSpaceStore(defaultConfiguration, planes());

/** What the arrangement looks like, as the signature sees it. */
const shape = (
    state: ReturnType<ReturnType<typeof makeSpaceStore>['getState']>,
) => JSON.stringify(state.space.tree.map((plane) => ({
    id: plane.planeID,
    show: plane.show,
    at: [Math.round(plane.location.translateX), Math.round(plane.location.translateY)],
    size: [Math.round(plane.width), Math.round(plane.height)],
    mode: plane.sizeMode ?? '',
})));


describe('a real thunk through the real middleware into the real reducer', () => {
    const edits: [string, (dispatch: ReturnType<typeof store>['dispatch'], ids: string[]) => void][] = [
        ['a plane closed', (dispatch, ids) => {
            dispatch(actions.space.setPlaneShow({ planeID: ids[0], show: false }));
        }],
        ['the selection moved by hand', (dispatch, ids) => {
            dispatch(actions.space.setSelection([ids[1]]));
            dispatch(actions.space.transformSelectedPlanes({ deltaX: 120, deltaY: 40 }));
        }],
        ['a plane resized by hand', (dispatch, ids) => {
            dispatch(actions.space.setPlaneSize({ planeID: ids[0], width: 512, height: 384, sizeMode: 'manual' }));
        }],
        ['the selection duplicated', (dispatch, ids) => {
            dispatch(actions.space.setSelection([ids[0]]));
            dispatch(duplicateSelection() as never);
        }],
        ['the selection aligned', (dispatch, ids) => {
            dispatch(actions.space.setSelection(ids));
            dispatch(alignSelection('top') as never);
        }],
        ['the selection distributed', (dispatch, ids) => {
            dispatch(actions.space.setSelection(ids));
            dispatch(distributeSelection('x') as never);
        }],
        ['the selection snapped', (dispatch, ids) => {
            dispatch(actions.space.setSelection([ids[1]]));
            dispatch(actions.space.transformSelectedPlanes({ deltaX: 3, deltaY: 5 }));
            dispatch(snapSelectionNow() as never);
        }],
        ['planes inserted (a paste)', (dispatch) => {
            dispatch(actions.space.insertPlanes({
                tree: [treePlane('/pasted', { location: { translateX: 40, translateY: 40 } })],
                links: [],
            }));
        }],
    ];

    for (const [what, edit] of edits) {
        it(`${what}: the change lands, and ONE undo takes it back`, () => {
            const { dispatch, getState } = store();
            const before = shape(getState());
            const ids = getState().space.tree.map((plane) => plane.planeID);

            edit(dispatch, ids);

            const after = shape(getState());
            expect({ what, changed: after !== before }).toEqual({ what, changed: true });
            expect({ what, canUndo: getState().space.history.canUndo }).toEqual({ what, canUndo: true });

            dispatch(actions.space.undo());
            expect({ what, restored: shape(getState()) }).toEqual({ what, restored: before });
        });
    }

    it('a camera move is not an arrangement change: nothing to undo', () => {
        const { dispatch, getState } = store();
        dispatch(actions.space.applyCameraDelta({ yaw: 30, pitch: -10 }));

        expect(getState().space.camera.yaw).toBeCloseTo(30, 6);
        expect(getState().space.history.canUndo).toBe(false);
    });

    it('the selection alone is not an arrangement change either', () => {
        const { dispatch, getState } = store();
        dispatch(actions.space.setSelection([getState().space.tree[0].planeID]));
        dispatch(actions.space.clearSelection());

        expect(getState().space.history.canUndo).toBe(false);
    });

    it('a whole drag is ONE entry: begin, many moves, end, one undo', () => {
        const { dispatch, getState } = store();
        const before = shape(getState());
        const id = getState().space.tree[1].planeID;

        dispatch(actions.space.setSelection([id]));
        dispatch(actions.space.historyBegin());
        for (let step = 0; step < 8; step += 1) {
            dispatch(actions.space.transformSelectedPlanes({ deltaX: 10, deltaY: 5 }));
        }
        dispatch(actions.space.historyEnd());

        expect(shape(getState())).not.toBe(before);
        expect(getState().space.history.undoDepth).toBe(1);

        dispatch(actions.space.undo());
        expect(shape(getState())).toBe(before);
    });

    it('WITHOUT the history middleware the edits still land — and undo does nothing', () => {
        const headless = makeSpaceStore(defaultConfiguration, planes(), { history: false });
        const before = shape(headless.getState());

        headless.dispatch(actions.space.setPlaneShow({ planeID: headless.getState().space.tree[0].planeID, show: false }));
        expect(shape(headless.getState())).not.toBe(before);

        headless.dispatch(actions.space.undo());
        expect(shape(headless.getState())).not.toBe(before);
        expect(headless.getState().space.history.canUndo).toBe(false);
    });
});
// #endregion module
