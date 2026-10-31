// #region imports
    // #region libraries
    import type {
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import actions from '~services/state/actions';
    import {
        cameraCommand,
    } from '~services/logic/camera';

    import {
        treePlane,
        configurationWith,
    } from '../../../../testing/fixtures';
    import {
        makeSpaceStore,
        motionStub,
    } from '../../../../testing/store';
    import type {
        HeadlessStore,
    } from '../../../../testing/store';
    // #endregion external


    // #region internal
    import {
        occludedFor,
    } from '../index';
    import {
        pinPlane,
    } from '../../pinned';
    // #endregion internal
// #endregion imports



// #region module
/** A parent and, in front of it, a 2 × 2 grid of its children: the user's case. */
const grid = (): TreePlane[] => [
    {
        ...treePlane('parent', { width: 600, height: 500, location: { translateX: 200, translateY: 50 } }),
        children: [
            treePlane('c1', { parentPlaneID: 'parent', width: 340, height: 280, location: { translateX: 160, translateY: 0, translateZ: 260 }, manuallyPositioned: true }),
            treePlane('c2', { parentPlaneID: 'parent', width: 340, height: 280, location: { translateX: 520, translateY: 0, translateZ: 260 }, manuallyPositioned: true }),
            treePlane('c3', { parentPlaneID: 'parent', width: 340, height: 280, location: { translateX: 160, translateY: 300, translateZ: 260 }, manuallyPositioned: true }),
            treePlane('c4', { parentPlaneID: 'parent', width: 340, height: 280, location: { translateX: 520, translateY: 300, translateZ: 260 }, manuallyPositioned: true }),
        ],
    },
    treePlane('behind', { width: 600, height: 500, location: { translateX: 200, translateY: 50, translateZ: -600 } }),
];

const storeWith = (
    tree: TreePlane[] = grid(),
    partial = {},
): HeadlessStore => makeSpaceStore(configurationWith(partial), tree);

const aimAt = (
    store: HeadlessStore,
    planeID: string,
) => store.dispatch(actions.space.setOcclusionTarget(planeID));


describe('the planes that fade in front of the plane the camera rests on', () => {
    it('THE USER\'S CASE: the four children in front of their parent fade; the plane behind does not', () => {
        const store = storeWith();
        aimAt(store, 'parent');
        const occluded = occludedFor(store.getState());
        expect(occluded.target).toBe('parent');
        expect([...occluded.planeIDs].sort()).toEqual(['c1', 'c2', 'c3', 'c4']);
        // on a child, nothing stands in front of it
        aimAt(store, 'c1');
        expect(occludedFor(store.getState()).planeIDs).toEqual([]);
    });

    it('none with no target, with `occlusion: \'none\'`, with a plane isolated, or for a pinned target', () => {
        expect(occludedFor(storeWith().getState()).planeIDs).toEqual([]);

        const off = storeWith(grid(), { space: { occlusion: 'none' } });
        aimAt(off, 'parent');
        expect(occludedFor(off.getState()).planeIDs).toEqual([]);

        const isolated = storeWith();
        aimAt(isolated, 'parent');
        isolated.dispatch(actions.space.setSpaceField({ field: 'isolatePlane', value: 'parent' } as any));
        expect(occludedFor(isolated.getState()).planeIDs).toEqual([]);

        const pinnedTarget = storeWith();
        pinnedTarget.dispatch(pinPlane('parent'));
        aimAt(pinnedTarget, 'parent');
        expect(occludedFor(pinnedTarget.getState()).planeIDs).toEqual([]);
    });

    it('a pinned plane never fades, and a closed one is not there to', () => {
        const store = storeWith();
        store.dispatch(pinPlane('c1'));
        store.dispatch(actions.space.setPlaneShow({ planeID: 'c2', show: false }));
        aimAt(store, 'parent');
        const faded = occludedFor(store.getState()).planeIDs;
        expect(faded).not.toContain('c1');
        expect(faded).not.toContain('c2');
        expect([...faded].sort()).toEqual(['c3', 'c4']);
    });
});


describe('the plane a camera move comes to rest on', () => {
    it('a frame of one plane, a dock and an anchor name it; a pair, a fit and home name none; a delta keeps it', () => {
        const store = storeWith();
        motionStub(store, { accept: false });
        store.dispatch(cameraCommand({ kind: 'frame', planeID: 'parent' }));
        expect(store.space().occluded.target).toBe('parent');
        store.dispatch(cameraCommand({ kind: 'delta', delta: { yaw: 4 } }));
        expect(store.space().occluded.target).toBe('parent');
        store.dispatch(cameraCommand({ kind: 'fit' }));
        expect(store.space().occluded.target).toBe('');
        store.dispatch(cameraCommand({ kind: 'anchor', anchor: { path: '/c3' } }));
        expect(store.space().occluded.target).toBe('c3');
        // a pair shows two planes: it names none
        store.dispatch(cameraCommand({ kind: 'pair', planeID: 'c2' }));
        expect(store.space().occluded.target).toBe('');
        store.dispatch(cameraCommand({ kind: 'home' }));
        expect(store.space().occluded.target).toBe('');
    });

    it('A MOVE OPTS OUT with `occlusion: \'none\'`: it names no plane, and nothing fades at its rest', () => {
        const store = storeWith();
        motionStub(store, { accept: false });
        store.dispatch(cameraCommand({ kind: 'frame', planeID: 'parent' }));
        store.dispatch(cameraCommand({ kind: 'frame', planeID: 'parent' }, { occlusion: 'none' }));
        expect(store.space().occluded.target).toBe('');
        expect(occludedFor(store.getState()).planeIDs).toEqual([]);
    });

    it('a new target empties the faded set until the next rest; the same set written again keeps its reference', () => {
        const store = storeWith();
        store.dispatch(actions.space.setOccluded({ target: 'parent', planeIDs: ['c1', 'c2'] }));
        const before = store.space().occluded;
        store.dispatch(actions.space.setOccluded({ target: 'parent', planeIDs: ['c1', 'c2'] }));
        expect(store.space().occluded).toBe(before);
        store.dispatch(actions.space.setOcclusionTarget('c1'));
        expect(store.space().occluded).toEqual({ target: 'c1', planeIDs: [] });
    });
});
// #endregion module
