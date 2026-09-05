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
const plane = (
    planeID: string,
    extra: Partial<TreePlane> = {},
): TreePlane => ({
    sourceID: planeID,
    planeID,
    route: '/' + planeID,
    routeDivisions: {} as any,
    width: 0,
    height: 0,
    location: { translateX: 0, translateY: 0, translateZ: 0, rotateX: 0, rotateY: 0 },
    show: true,
    ...extra,
});

const withTree = (tree: TreePlane[]) => reducer(
    reducer(reducer(undefined, { type: '@@init' }), actions.setViewSize({ width: 1000, height: 600 })),
    actions.restoreArrangement({ tree, links: [] }),
);


describe('setPlaneSize with declared sizes', () => {
    it('a measurement fills the undeclared dimension of a declared plane and keeps it declared', () => {
        let state = withTree([plane('a', { width: 480, height: 0, sizeMode: 'declared' })]);
        state = reducer(state, actions.setPlaneSize({ planeID: 'a', width: 480, height: 300 }));
        expect(state.tree[0]).toMatchObject({ width: 480, height: 300, sizeMode: 'declared' });
        const tree = state.tree;
        state = reducer(state, actions.setPlaneSize({ planeID: 'a', width: 480, height: 300 }));
        expect(state.tree).toBe(tree);
    });

    it('a hand resize overrides a declaration, and a later measurement no longer does', () => {
        let state = withTree([plane('a', { width: 480, height: 300, sizeMode: 'declared' })]);
        state = reducer(state, actions.setPlaneSize({ planeID: 'a', width: 600, height: 400, sizeMode: 'manual' }));
        expect(state.tree[0]).toMatchObject({ width: 600, height: 400, sizeMode: 'manual' });
        const manual = state.tree;
        state = reducer(state, actions.setPlaneSize({ planeID: 'a', width: 480, height: 300 }));
        expect(state.tree).toBe(manual);
    });
});
// #endregion module
