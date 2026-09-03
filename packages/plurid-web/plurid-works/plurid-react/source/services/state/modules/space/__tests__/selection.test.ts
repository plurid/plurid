// #region imports
    // #region libraries
    import {
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        reducer,
        actions,
    } from '../index';
    // #endregion external
// #endregion imports



// #region module
const view = { width: 1000, height: 600 };

const initial = () => reducer(
    reducer(undefined, { type: '@@init' }),
    actions.setViewSize(view),
);

const plane = (
    planeID: string,
    translateX: number,
    translateY = 0,
    extra: Partial<TreePlane> = {},
): TreePlane => ({
    sourceID: planeID,
    planeID,
    route: '/' + planeID,
    routeDivisions: {} as any,
    width: 100,
    height: 80,
    location: {
        translateX,
        translateY,
        translateZ: 0,
        rotateX: 0,
        rotateY: 0,
    },
    show: true,
    ...extra,
});

const withTree = (tree: TreePlane[]) => reducer(initial(), actions.restoreArrangement({ tree, links: [] }));
const xs = (tree: TreePlane[]) => tree.map((node) => node.location.translateX);


describe('setPlaneSize and manual sizes', () => {
    it('a measured report never overrides a hand-sized plane', () => {
        let state = withTree([plane('a', 0)]);
        state = reducer(state, actions.setPlaneSize({ planeID: 'a', width: 300, height: 200, sizeMode: 'manual' }));
        const sized = state.tree;
        state = reducer(state, actions.setPlaneSize({ planeID: 'a', width: 100, height: 80 }));
        expect(state.tree).toBe(sized);
        expect(state.tree[0].width).toBe(300);
        expect(state.tree[0].sizeMode).toBe('manual');
    });
});


describe('selection reducers', () => {
    it('selectAll takes every shown plane (children included); invertSelection flips it', () => {
        const child = plane('c', 500, 0, { parentPlaneID: 'a' });
        let state = withTree([plane('a', 0, 0, { children: [child] }), plane('b', 200), plane('h', 400, 0, { show: false })]);
        state = reducer(state, actions.selectAll());
        expect(state.selectedPlaneIDs).toEqual(['a', 'c', 'b']);
        state = reducer(state, actions.setSelection(['b']));
        state = reducer(state, actions.invertSelection());
        expect(state.selectedPlaneIDs).toEqual(['a', 'c']);
    });

    it('alignSelection lines the selection up on the chosen edge and pins the planes', () => {
        let state = withTree([plane('a', 0, 0), plane('b', 200, 50), plane('c', 400, 120)]);
        state = reducer(state, actions.setSelection(['a', 'b', 'c']));
        const left = reducer(state, actions.alignSelection({ edge: 'left' }));
        expect(xs(left.tree)).toEqual([0, 0, 0]);
        expect(left.tree[1].manuallyPositioned).toBe(true);
        const right = reducer(state, actions.alignSelection({ edge: 'right' }));
        expect(xs(right.tree)).toEqual([400, 400, 400]);
        const top = reducer(state, actions.alignSelection({ edge: 'top' }));
        expect(top.tree.map((node) => node.location.translateY)).toEqual([0, 0, 0]);
        const centerY = reducer(state, actions.alignSelection({ edge: 'centerY' }));
        // bounds 0..200 → center 100 → each top = 100 - 40
        expect(centerY.tree.map((node) => node.location.translateY)).toEqual([60, 60, 60]);
    });

    it('distributeSelection spaces three or more planes with equal gaps', () => {
        let state = withTree([plane('a', 0), plane('b', 130), plane('c', 600)]);
        state = reducer(state, actions.setSelection(['a', 'b', 'c']));
        const next = reducer(state, actions.distributeSelection({ axis: 'x' }));
        // span 0..700, widths 300 → gaps (700 - 300) / 2 = 200 → 0, 300, 600
        expect(xs(next.tree)).toEqual([0, 300, 600]);
        // two planes: nothing to do
        state = reducer(state, actions.setSelection(['a', 'c']));
        expect(reducer(state, actions.distributeSelection({ axis: 'x' })).tree).toBe(state.tree);
    });

    it('duplicateSelection copies the selected roots with an offset and selects the copies', () => {
        let state = withTree([plane('a', 0, 0, { children: [plane('c', 500, 0, { parentPlaneID: 'a' })] }), plane('b', 200)]);
        state = reducer(state, actions.setSelection(['a']));
        const next = reducer(state, actions.duplicateSelection({ offset: 40 }));
        expect(next.tree).toHaveLength(3);
        const copy = next.tree[2];
        expect(copy.planeID).not.toBe('a');
        expect(copy.sourceID).toBe('a');
        expect(copy.location.translateX).toBe(40);
        expect(copy.location.translateY).toBe(40);
        expect(copy.children).toBeUndefined();
        expect(copy.manuallyPositioned).toBe(true);
        expect(next.selectedPlaneIDs).toEqual([copy.planeID]);
        // again: a distinct id
        const twice = reducer(next, actions.duplicateSelection({ offset: 40 }));
        expect(new Set(twice.tree.map((node) => node.planeID)).size).toBe(4);
    });

    it('snapSelection uses the shared snap engine (edges, centers, grid) and carries subtrees', () => {
        const child = plane('c', 400, 0, { parentPlaneID: 'b', linkCoordinates: { x: 100, y: 0 }, bridgeLength: 100, planeAngle: 90 });
        let state = withTree([plane('a', 0, 0), plane('b', 107, 300, { children: [child] })]);
        state = reducer(state, actions.setSelection(['b']));
        const snapped = reducer(state, actions.snapSelection({ threshold: 12 }));
        expect(snapped.tree[1].location.translateX).toBe(100);
        // the spawned child was re-placed from its moved parent
        expect(snapped.tree[1].children![0].location.translateX).toBeCloseTo(200, 6);

        const gridState = reducer(withTree([plane('g', 103, 297)]), actions.setSelection(['g']));
        const gridded = reducer(gridState, actions.snapSelection({ threshold: 12, grid: 50 }));
        expect(gridded.tree[0].location.translateX).toBe(100);
        expect(gridded.tree[0].location.translateY).toBe(300);

        // nothing within reach: same tree reference
        const far = reducer(withTree([plane('a', 0), plane('b', 300)]), actions.setSelection(['b']));
        expect(reducer(far, actions.snapSelection({ threshold: 12 })).tree).toBe(far.tree);
    });
});
// #endregion module
