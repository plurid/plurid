// #region imports
    // #region libraries
    import type {
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        interaction,
        space as spaceEngine,
    } from '~services/engine';

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
        stackPlanes,
        unstackPlanes,
        stacksOf,
    } from '../index';
    import {
        pinPlane,
    } from '../../pinned';
    // #endregion internal
// #endregion imports



// #region module
const tree = (): TreePlane[] => [
    treePlane('a'),
    // a plane the reader placed by hand, and one the layout placed
    treePlane('b', { location: { translateX: 600, translateY: -40, rotateY: 15 }, manuallyPositioned: true }),
    {
        ...treePlane('c', { location: { translateX: 1200 } }),
        children: [treePlane('d', { parentPlaneID: 'c', location: { translateX: 1700, translateZ: -80 } })],
    },
];

const storeWith = (): HeadlessStore => makeSpaceStore(configurationWith({}), tree());

const node = (
    store: HeadlessStore,
    planeID: string,
) => spaceEngine.tree.logic.getTreePlaneByID(store.tree(), planeID)!;

const placements = (
    store: HeadlessStore,
    planeIDs: string[],
) => planeIDs.map((planeID) => ({
    location: node(store, planeID).location,
    manuallyPositioned: node(store, planeID).manuallyPositioned,
}));


describe('stacking planes', () => {
    it('sets them where the engine\'s stack puts them, each by hand, and keeps what each had before', () => {
        const store = storeWith();
        const ids = ['a', 'b', 'd'];
        const before = placements(store, ids);
        const stackID = store.dispatch(stackPlanes(ids, { step: { x: 30, y: 70, z: 90 } }))!;
        expect(stackID).toBe('stack-1');

        const expected = interaction.camera.stackLocations(
            store.space().camera,
            store.space().viewSize,
            ids.map((planeID) => ({ width: 400, height: 300, location: tree().flatMap((plane) => [plane, ...(plane.children || [])]).find((plane) => plane.planeID === planeID)!.location })),
            { x: 30, y: 70, z: 90 },
            'camera',
        );
        ids.forEach((planeID, index) => {
            expect(node(store, planeID).location).toEqual(expected[index]);
            expect(node(store, planeID).manuallyPositioned).toBe(true);
        });
        const [stack] = stacksOf(store.getState());
        expect(stack.planeIDs).toEqual(ids);
        expect(ids.map((planeID) => stack.previous[planeID])).toEqual(before.map((placement) => (
            placement.manuallyPositioned === undefined ? { location: placement.location } : placement
        )));
    });

    it('UNSTACK PUTS EACH PLANE BACK EXACTLY: its location and whether it was placed by hand', () => {
        const store = storeWith();
        const ids = ['a', 'b', 'c', 'd'];
        const before = placements(store, ids);
        const stackID = store.dispatch(stackPlanes(ids))!;
        expect(store.dispatch(unstackPlanes(stackID))).toBe(true);
        expect(placements(store, ids)).toEqual(before);
        expect(stacksOf(store.getState())).toEqual([]);
    });

    it('a plane stacked again keeps the placement it had before its first stack; unstacking some leaves the rest stacked', () => {
        const store = storeWith();
        const before = placements(store, ['a', 'b', 'c']);
        store.dispatch(stackPlanes(['a', 'b']));
        const second = store.dispatch(stackPlanes(['b', 'c']))!;
        expect(stacksOf(store.getState()).map((stack) => stack.planeIDs)).toEqual([['a'], ['b', 'c']]);
        store.dispatch(unstackPlanes(['a', 'b']));
        expect(placements(store, ['a', 'b'])).toEqual(before.slice(0, 2));
        expect(stacksOf(store.getState())).toEqual([expect.objectContaining({ stackID: second, planeIDs: ['c'] })]);
        store.dispatch(unstackPlanes(second));
        expect(placements(store, ['a', 'b', 'c'])).toEqual(before);
    });

    it('refuses fewer than 2 or more than 12 planes, an absent one, a closed one and a pinned one', () => {
        const store = storeWith();
        expect(store.dispatch(stackPlanes(['a']))).toBeUndefined();
        expect(store.dispatch(stackPlanes(Array.from({ length: 13 }, (_, index) => 'p' + index)))).toBeUndefined();
        expect(store.dispatch(stackPlanes(['a', 'nowhere']))).toBeUndefined();
        store.dispatch(pinPlane('c'));
        expect(store.dispatch(stackPlanes(['a', 'c']))).toBeUndefined();
        expect(stacksOf(store.getState())).toEqual([]);
        expect(store.dispatch(unstackPlanes('stack-9'))).toBe(false);
    });

    it('glides there for the motion\'s duration, at once under reduced motion or `animate: false`', () => {
        const store = storeWith();
        motionStub(store);
        store.dispatch(stackPlanes(['a', 'b']));
        expect(store.space().layoutTransition).toBe(configurationWith({}).space.navigation!.motion!.duration);

        const reduced = storeWith();
        motionStub(reduced, { reducedMotion: true });
        reduced.dispatch(stackPlanes(['a', 'b']));
        expect(reduced.space().layoutTransition).toBe(0);

        const jump = storeWith();
        motionStub(jump);
        jump.dispatch(stackPlanes(['a', 'b'], { animate: false }));
        expect(jump.space().layoutTransition).toBe(0);
    });

    it('prunes removed and pinned members, retains closed members, and restores membership on undo', () => {
        const store = storeWith();
        store.dispatch(stackPlanes(['a', 'b', 'c', 'd']));
        store.dispatch({ type: 'space/patchPlanes', payload: [{ planeID: 'b', patch: { show: false } }] });
        expect(stacksOf(store.getState())[0].planeIDs).toEqual(['a', 'b', 'c', 'd']);
        store.dispatch({ type: 'space/removePlane', payload: 'c' });
        expect(stacksOf(store.getState())[0].planeIDs).toEqual(['a', 'b']);
        store.dispatch({ type: 'space/undo' });
        expect(stacksOf(store.getState())[0].planeIDs).toEqual(['a', 'b', 'c', 'd']);
        store.dispatch(pinPlane('a'));
        expect(stacksOf(store.getState())[0].planeIDs).toEqual(['b', 'c', 'd']);
        store.dispatch({ type: 'space/undo' });
        expect(stacksOf(store.getState())[0].planeIDs).toEqual(['a', 'b', 'c', 'd']);
    });

    it('restores a serialized stack and can unstack it after restart', () => {
        const first = storeWith();
        const before = placements(first, ['a', 'b']);
        const id = first.dispatch(stackPlanes(['a', 'b']))!;
        const serialized = JSON.parse(JSON.stringify({ tree: first.tree(), links: [], stacks: first.space().stacks }));
        const reopened = storeWith();
        reopened.dispatch({ type: 'space/restoreArrangement', payload: serialized });
        expect(stacksOf(reopened.getState())[0].stackID).toBe(id);
        reopened.dispatch(unstackPlanes(id));
        expect(placements(reopened, ['a', 'b'])).toEqual(before);
        expect(stacksOf(reopened.getState())).toEqual([]);
    });

    it('undo over an unrelated peer edit restores both stack metadata and original auto placements', () => {
        const store = storeWith();
        const before = placements(store, ['a', 'b']);
        store.dispatch(stackPlanes(['a', 'b']));
        const remote = store.tree().map((plane) => plane.planeID === 'c'
            ? { ...plane, manuallyPositioned: true, location: { ...plane.location, translateX: 3000 } }
            : plane);
        store.dispatch({ type: 'space/restoreArrangement', payload: { tree: remote, links: [] }, meta: { remote: true } });
        store.dispatch({ type: 'space/undo' });
        expect(placements(store, ['a', 'b']).map((value) => value.location)).toEqual(before.map((value) => value.location));
        expect(node(store, 'a').manuallyPositioned).toBe(false);
        expect(node(store, 'c').location.translateX).toBe(3000);
        expect(stacksOf(store.getState())).toEqual([]);
        store.dispatch({ type: 'space/redo' });
        expect(stacksOf(store.getState())[0].planeIDs).toEqual(['a', 'b']);
        expect(node(store, 'c').location.translateX).toBe(3000);
    });

    it('a nested layout transaction restores stack metadata and geometry in one undo', () => {
        const store = storeWith();
        const id = store.dispatch(stackPlanes(['a', 'b']))!;
        const stacked = placements(store, ['a', 'b']);
        store.dispatch({ type: 'space/historyBegin' });
        store.dispatch(unstackPlanes(id));
        store.dispatch({ type: 'space/historyBegin' });
        store.dispatch({ type: 'space/patchPlanes', payload: [{ planeID: 'a', patch: { location: { ...node(store, 'a').location, translateX: 900 }, manuallyPositioned: true } }] });
        store.dispatch({ type: 'space/historyEnd' });
        store.dispatch({ type: 'space/historyEnd' });
        store.dispatch({ type: 'space/undo' });
        expect(placements(store, ['a', 'b'])).toEqual(stacked);
        expect(stacksOf(store.getState())[0].stackID).toBe(id);
    });

    it('a stack and an unstack are each one step of the history', () => {
        const store = storeWith();
        const before = placements(store, ['a', 'b', 'c']);
        const stackID = store.dispatch(stackPlanes(['a', 'b', 'c']))!;
        const stacked = placements(store, ['a', 'b', 'c']);
        store.dispatch({ type: 'space/undo' });
        expect(placements(store, ['a', 'b', 'c'])).toEqual(before);
        expect(stacksOf(store.getState())).toEqual([]);
        store.dispatch({ type: 'space/redo' });
        expect(placements(store, ['a', 'b', 'c'])).toEqual(stacked);
        expect(stacksOf(store.getState())[0].stackID).toBe(stackID);
        store.dispatch(unstackPlanes(stackID));
        expect(stacksOf(store.getState())).toEqual([]);
        store.dispatch({ type: 'space/undo' });
        expect(placements(store, ['a', 'b', 'c'])).toEqual(stacked);
        expect(stacksOf(store.getState())[0].stackID).toBe(stackID);
        store.dispatch({ type: 'space/redo' });
        expect(stacksOf(store.getState())).toEqual([]);
        expect(placements(store, ['a', 'b', 'c'])).toEqual(before);
    });
});
// #endregion module
