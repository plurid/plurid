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
/**
 * MOVING PLANES AS A COMMAND (`space.movePlanes`, 2026-09-16): the planes named, in world or
 * plane axes, the selection untouched, pinned only when asked, children riding along.
 */
const view = { width: 1000, height: 600 };

const initial = () => reducer(
    reducer(undefined, { type: '@@init' }),
    actions.setViewSize(view),
);

const plane = (
    planeID: string,
    translateX: number,
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
        translateY: 0,
        translateZ: 0,
        rotateX: 0,
        rotateY: 0,
    },
    show: true,
    ...extra,
});

const withTree = (tree: TreePlane[]) => reducer(initial(), actions.restoreArrangement({ tree, links: [] }));

const find = (tree: TreePlane[], planeID: string): TreePlane | undefined => {
    for (const node of tree) {
        if (node.planeID === planeID) return node;
        const found = node.children ? find(node.children, planeID) : undefined;
        if (found) return found;
    }
    return undefined;
};


describe('movePlanes', () => {
    it('moves the planes named by a world delta and leaves the selection alone', () => {
        let state = withTree([plane('a', 0), plane('b', 300)]);
        state = reducer(state, actions.setSelection(['b']));

        state = reducer(state, actions.movePlanes({ planeIDs: ['a'], deltaX: 120, deltaY: 40 }));

        expect(find(state.tree, 'a')!.location).toMatchObject({ translateX: 120, translateY: 40, translateZ: 0 });
        expect(find(state.tree, 'b')!.location.translateX).toBe(300);
        expect(state.selectedPlaneIDs).toEqual(['b']);
    });

    it('moves the selection when no plane is named', () => {
        let state = withTree([plane('a', 0), plane('b', 300)]);
        state = reducer(state, actions.setSelection(['b']));

        state = reducer(state, actions.movePlanes({ deltaX: 10, deltaY: 0 }));

        expect(find(state.tree, 'b')!.location.translateX).toBe(310);
        expect(find(state.tree, 'a')!.location.translateX).toBe(0);
    });

    /** the gate: deltaX in the plane's own frame on a plane turned 90.1 goes along world z */
    it('moves in the plane\'s own axes when asked: deltaX on a plane turned 90.1 goes along world z', () => {
        let state = withTree([plane('fin', 460, { location: { translateX: 460, translateY: 0, translateZ: -100, rotateX: 0, rotateY: 90.1 } })]);

        state = reducer(state, actions.movePlanes({ planeIDs: ['fin'], deltaX: 100, deltaY: 0, frame: 'plane' }));

        const moved = find(state.tree, 'fin')!.location;
        expect(moved.translateZ).toBeCloseTo(-100 - 100 * Math.sin(90.1 * Math.PI / 180), 6);
        expect(moved.translateX).toBeCloseTo(460 + 100 * Math.cos(90.1 * Math.PI / 180), 6);
        expect(Math.abs(moved.translateX - 460)).toBeLessThan(1);
    });

    /** the gate: un-pinned by default, pinned only when asked */
    it('pins only when asked', () => {
        let state = withTree([plane('a', 0)]);

        state = reducer(state, actions.movePlanes({ planeIDs: ['a'], deltaX: 10, deltaY: 0 }));
        expect(find(state.tree, 'a')!.manuallyPositioned).toBeFalsy();

        state = reducer(state, actions.movePlanes({ planeIDs: ['a'], deltaX: 10, deltaY: 0, pinned: true }));
        expect(find(state.tree, 'a')!.manuallyPositioned).toBe(true);
    });

    it('children ride with a moved parent; a tree with no moved children keeps its reference', () => {
        const child = plane('c', 0, {
            parentPlaneID: 'a',
            linkCoordinates: { x: 100, y: 40 },
            bridgeLength: 100,
            planeAngle: 90.1,
            location: { translateX: 100, translateY: 25, translateZ: -100, rotateX: 0, rotateY: 90.1 },
        });
        let state = withTree([plane('a', 0, { children: [child] }), plane('b', 300)]);
        const before = state.tree;

        state = reducer(state, actions.movePlanes({ planeIDs: ['b'], deltaX: 5, deltaY: 0 }));
        expect(find(state.tree, 'c')!.location.translateX).toBeCloseTo(100, 6);

        state = reducer(state, actions.movePlanes({ planeIDs: ['a'], deltaX: 50, deltaY: 0 }));
        // re-placed from its link on the moved parent: 50 + 100, a bridge of 100 at 90.1° (−0.17 in x)
        expect(find(state.tree, 'c')!.location.translateX).toBeCloseTo(150 + 100 * Math.cos(90.1 * Math.PI / 180), 6);
        expect(state.tree).not.toBe(before);
    });

    it('does nothing for no delta or no plane', () => {
        const state = withTree([plane('a', 0)]);
        expect(reducer(state, actions.movePlanes({ planeIDs: ['a'], deltaX: 0, deltaY: 0 })).tree).toBe(state.tree);
        expect(reducer(state, actions.movePlanes({ planeIDs: [], deltaX: 1, deltaY: 0 })).tree).toBe(state.tree);
    });
});


describe('setPlanePinned', () => {
    it('pins a plane where it is, and unpinning a child puts it back on its link', () => {
        const child = plane('c', 0, {
            parentPlaneID: 'a',
            linkCoordinates: { x: 100, y: 40 },
            bridgeLength: 100,
            planeAngle: 90.1,
            manuallyPositioned: true,
            location: { translateX: 900, translateY: 700, translateZ: 0, rotateX: 0, rotateY: 90.1 },
        });
        let state = withTree([plane('a', 0, { children: [child] })]);

        state = reducer(state, actions.setPlanePinned({ planeID: 'c', pinned: false }));
        const placed = find(state.tree, 'c')!;
        expect(placed.manuallyPositioned).toBeFalsy();
        expect(placed.location.translateX).toBeCloseTo(100 + 100 * Math.cos(90.1 * Math.PI / 180), 6);

        state = reducer(state, actions.setPlanePinned({ planeID: 'c', pinned: true }));
        expect(find(state.tree, 'c')!.manuallyPositioned).toBe(true);
    });
});
// #endregion module
