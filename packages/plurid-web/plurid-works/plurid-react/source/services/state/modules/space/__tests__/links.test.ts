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
    location: Partial<TreePlane['location']> = {},
    extra: Partial<TreePlane> = {},
): TreePlane => ({
    sourceID: planeID,
    planeID,
    route: '/' + planeID,
    routeDivisions: {} as any,
    width: 400,
    height: 300,
    location: {
        translateX: 0,
        translateY: 0,
        translateZ: 0,
        rotateX: 0,
        rotateY: 0,
        ...location,
    },
    show: true,
    ...extra,
});

/** A root with one spawned child (bridge 100, angle 90 from link (200, 40)) and a grandchild. */
const spawnedTree = () => {
    const grandchild = plane('c', { translateX: 300, translateY: 40, translateZ: -100, rotateY: 0 }, {
        parentPlaneID: 'b',
        linkCoordinates: { x: 100, y: 0 },
        bridgeLength: 100,
        planeAngle: -90,
        spawnedByLinkID: 'b#/c#0',
    });
    const child = plane('b', { translateX: 200, translateY: 40, translateZ: -100, rotateY: 90 }, {
        parentPlaneID: 'a',
        linkCoordinates: { x: 200, y: 40 },
        bridgeLength: 100,
        planeAngle: 90,
        spawnedByLinkID: 'a#/b#0',
        children: [grandchild],
    });
    return [plane('a', {}, { children: [child] })];
};

const withTree = (tree: TreePlane[]) => reducer(initial(), actions.restoreArrangement({ tree, links: [] }));


describe('updateLinkCoordinates', () => {
    it('is equality-gated: equal coordinates keep the tree reference', () => {
        const state = withTree(spawnedTree());
        const next = reducer(state, actions.updateLinkCoordinates({ planeID: 'b', linkCoordinates: { x: 200, y: 40 } }));
        expect(next.tree).toBe(state.tree);
    });

    it('re-places the child and its subtree from the live parent', () => {
        const state = withTree(spawnedTree());
        const next = reducer(state, actions.updateLinkCoordinates({ planeID: 'b', linkCoordinates: { x: 200, y: 140 } }));
        expect(next.tree).not.toBe(state.tree);
        const child = next.tree[0].children![0];
        expect(child.location.translateY).toBe(140);
        expect(child.linkCoordinates).toEqual({ x: 200, y: 140 });
        // the grandchild followed
        expect(child.children![0].location.translateY).toBe(140);
    });

    it('keeps the deprecated alias', () => {
        const state = withTree(spawnedTree());
        const next = reducer(state, actions.updateSpaceLinkCoordinates({ planeID: 'b', linkCoordinates: { x: 50, y: 40 } }));
        expect(next.tree[0].children![0].location.translateX).toBeCloseTo(50, 9);
    });
});


describe('removePlane', () => {
    it('path-copies and prunes the link graph', () => {
        let state = withTree(spawnedTree());
        state = reducer(state, actions.addPlaneLink({ id: 'l1', sourcePlaneID: 'a', targetPlaneID: 'c' }));
        state = reducer(state, actions.addPlaneLink({ id: 'l2', sourcePlaneID: 'a', targetPlaneID: 'b' }));
        const untouchedRoot = state.tree[0];

        const next = reducer(state, actions.removePlane('c'));
        expect(next.tree[0]).not.toBe(untouchedRoot);
        expect(next.tree[0].children![0].children).toEqual([]);
        expect(next.links.map((link) => link.id)).toEqual(['l2']);
    });

    it('is a no-op for an unknown plane', () => {
        const state = withTree(spawnedTree());
        const next = reducer(state, actions.removePlane('nope'));
        expect(next.tree).toBe(state.tree);
    });
});


describe('link graph guards', () => {
    it('rejects self-links', () => {
        const state = reducer(initial(), actions.addPlaneLink({ id: 'self', sourcePlaneID: 'a', targetPlaneID: 'a' }));
        expect(state.links).toEqual([]);
    });

    it('updatePlaneLink cannot change the id', () => {
        let state = reducer(initial(), actions.addPlaneLink({ id: 'l1', sourcePlaneID: 'a', targetPlaneID: 'b' }));
        state = reducer(state, actions.updatePlaneLink({ id: 'l1', update: { id: 'hijack', kind: 'reference' } as any }));
        expect(state.links[0].id).toBe('l1');
        expect((state.links[0] as any).kind).toBe('reference');
    });

    it('setTree and restoreArrangement prune dangling links', () => {
        let state = withTree(spawnedTree());
        state = reducer(state, actions.addPlaneLink({ id: 'l1', sourcePlaneID: 'a', targetPlaneID: 'c' }));
        const next = reducer(state, actions.setTree([plane('a')]));
        expect(next.links).toEqual([]);

        const restored = reducer(state, actions.restoreArrangement({
            tree: [plane('a')],
            links: [{ id: 'x', sourcePlaneID: 'a', targetPlaneID: 'gone' }],
        }));
        expect(restored.links).toEqual([]);
    });
});


describe('setPlaneShow', () => {
    it('hides a child (deep) with its subtree, records the last closed plane, and path-copies', () => {
        const other = plane('o');
        const state = withTree([...spawnedTree(), other]);
        const hidden = reducer(state, actions.setPlaneShow({ planeID: 'b', show: false }));
        expect(hidden.tree[0].children![0].show).toBe(false);
        expect(hidden.tree[0].children![0].children![0].show).toBe(false);
        expect(hidden.lastClosedPlane).toBe('b');
        // unrelated roots keep their references
        expect(hidden.tree[1]).toBe(state.tree[1]);

        const shown = reducer(hidden, actions.setPlaneShow({ planeID: 'b', show: true }));
        expect(shown.tree[0].children![0].show).toBe(true);
        expect(shown.tree[0].children![0].children![0].show).toBe(true);
        expect(shown.tree[0].children![0].planeID).toBe('b');

        // unknown plane: same tree reference
        expect(reducer(state, actions.setPlaneShow({ planeID: 'nope', show: false })).tree).toBe(state.tree);
    });
});


describe('transformSelectedPlanes / snapSelection carry the subtree', () => {
    it('moving a parent moves its spawned children by the same delta', () => {
        let state = withTree(spawnedTree());
        state = reducer(state, actions.setSelection(['a']));
        const next = reducer(state, actions.transformSelectedPlanes({ deltaX: 50, deltaY: 0, deltaZ: 0 }));
        expect(next.tree[0].location.translateX).toBe(50);
        expect(next.tree[0].children![0].location.translateX).toBe(250);
        expect(next.tree[0].children![0].children![0].location.translateX).toBe(350);
        expect(next.tree[0].manuallyPositioned).toBe(true);
    });

    it('snapping the selection carries the subtree too', () => {
        const other = plane('o', { translateX: 8, translateY: 0 });
        let state = withTree([...spawnedTree(), other]);
        state = reducer(state, actions.setSelection(['a']));
        const next = reducer(state, actions.snapSelection({ threshold: 12 }));
        expect(next.tree[0].location.translateX).toBe(8);
        expect(next.tree[0].children![0].location.translateX).toBe(208);
    });
});
// #endregion module
