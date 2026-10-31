// #region imports
    // #region libraries
    import type {
        TreePlane,
        CameraState,
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
        openPinnedPlane,
        pinPlane,
        placePinnedPlane,
        collapsePinnedPlane,
        raisePinnedPlane,
        pinnedPlanesOf,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
const roots = (): TreePlane[] => [
    treePlane('a'),
    treePlane('b', { location: { translateX: 600 } }),
    treePlane('c', { location: { translateX: 1200 } }),
];

const storeWith = (
    tree: TreePlane[] = roots(),
): HeadlessStore => {
    const store = makeSpaceStore(configurationWith({}), tree);
    // what the application's registrar answers: `/x` is registered, `/fixed` keeps its plane in the space
    store.extra.resolvePlane = (path) => (path === '/x' || path === '/fixed'
        ? treePlane(path.slice(1), { planeID: 'opened-' + path.slice(1), sourceID: path })
        : undefined);
    store.extra.registeredPlane = (sourceID) => (sourceID === '/fixed' ? { pinnable: false } : {});
    return store;
};

const node = (
    store: HeadlessStore,
    planeID: string,
) => spaceEngine.tree.logic.getTreePlaneByID(store.tree(), planeID)!;

const corners = (
    camera: CameraState,
    view: { width: number; height: number },
    plane: TreePlane,
) => interaction.camera.projectedBounds(camera, view, {
    location: plane.location,
    width: plane.width,
    height: plane.height,
})!;


let warn: jest.SpyInstance;
beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});
afterEach(() => {
    warn.mockRestore();
});


describe('pinning a plane', () => {
    it('lifts it onto the screen at a free slot on the right edge, keeping its node, its id and its place', () => {
        const store = storeWith();
        const before = node(store, 'b');
        expect(store.dispatch(pinPlane('b'))).toBe(true);
        const after = node(store, 'b');
        expect(after.planeID).toBe('b');
        expect(after.route).toBe(before.route);
        expect(after.location).toEqual(before.location);
        const [pinned] = pinnedPlanesOf(store.getState());
        expect(pinned.planeID).toBe('b');
        expect(pinned.frame.left + pinned.frame.width).toBe(store.space().viewSize.width - 16);
        expect(pinned.collapsed).toBe(false);
        // the second pin takes the next free slot, not the first one's
        store.dispatch(pinPlane('c', undefined));
        const frames = pinnedPlanesOf(store.getState()).map((plane) => plane.frame);
        const [one, two] = frames;
        const apart = one.top + one.height <= two.top || two.top + two.height <= one.top
            || one.left + one.width <= two.left || two.left + two.width <= one.left;
        expect(apart).toBe(true);
    });

    it('pins at a rect the host gives, and a pinned plane re-pinned takes the new rect and comes to the front', () => {
        const store = storeWith();
        store.dispatch(pinPlane('a', { x: 10, y: 20, width: 300, height: 200 }));
        store.dispatch(pinPlane('b', { x: 0.5, y: 0.1, width: 0.25, height: 0.5, unit: 'fraction' }));
        expect(pinnedPlanesOf(store.getState()).map((plane) => plane.planeID)).toEqual(['a', 'b']);
        expect(pinnedPlanesOf(store.getState())[1].frame).toEqual({
            left: store.space().viewSize.width * 0.5,
            top: store.space().viewSize.height * 0.1,
            width: store.space().viewSize.width * 0.25,
            height: store.space().viewSize.height * 0.5,
        });
        store.dispatch(pinPlane('a', { x: 40, y: 40, width: 320, height: 240, anchor: 'bottom-left' }));
        const listed = pinnedPlanesOf(store.getState());
        expect(listed.map((plane) => plane.planeID)).toEqual(['b', 'a']);
        expect(listed[1].frame.top).toBe(store.space().viewSize.height - 40 - 240);
    });

    it('refuses a plane registered `pinnable: false`, and one the tree does not hold', () => {
        const store = storeWith([...roots(), treePlane('fixed', { sourceID: '/fixed' })]);
        expect(store.dispatch(pinPlane('fixed'))).toBe(false);
        expect(node(store, 'fixed').pinned).toBeUndefined();
        expect(warn.mock.calls.map((call) => String(call.join(' '))).join('\n')).toMatch(/pinnable: false/);
        expect(store.dispatch(pinPlane('nowhere'))).toBe(false);
    });

    it('uses current instance policy for pin, opening pinned and restored tree state', () => {
        const a = treePlane('a');
        a.routeDivisions.plane.parameters.id = 'a';
        const store = storeWith([a]);
        let allowed = true;
        const policy = jest.fn(({ parameters }) => allowed && parameters.id === 'a');
        store.extra.registeredPlane = () => ({ pinnable: policy });
        store.extra.resolvePlane = () => a;
        expect(store.dispatch(pinPlane('a'))).toBe(true);
        expect(policy).toHaveBeenCalledWith({ planeID: 'a', route: '/a', parameters: { id: 'a' } });
        const pinned = store.tree();
        allowed = false;
        const observed: boolean[] = [];
        const stop = store.subscribe(() => observed.push(!!node(store, 'a').pinned));
        store.dispatch({ type: 'space/restoreArrangement', payload: { tree: pinned, links: [] } });
        stop();
        expect(observed.every((value) => value === false)).toBe(true);
        expect(node(store, 'a').pinned).toBeUndefined();
        expect(store.dispatch(pinPlane('a'))).toBe(false);
        expect(store.dispatch(openPinnedPlane('/a'))).toBeUndefined();
        expect(store.tree()).toHaveLength(1);
        store.extra.registeredPlane = () => ({ pinnable: () => { throw new Error('unavailable'); } });
        expect(store.dispatch(pinPlane('a'))).toBe(false);
    });

    it('pin state, collapse and frame positions are undoable independently of world geometry', () => {
        const store = storeWith();
        const original = node(store, 'a');
        store.dispatch(pinPlane('a', { x: 10, y: 20, width: 320, height: 240 }));
        store.dispatch(collapsePinnedPlane('a', true));
        store.dispatch({ type: 'space/undo' });
        expect(node(store, 'a').pinned?.collapsed).toBeUndefined();
        store.dispatch({ type: 'space/undo' });
        expect(node(store, 'a')).toEqual(original);
        store.dispatch({ type: 'space/redo' });
        expect(node(store, 'a').pinned?.rect.x).toBe(10);
        store.dispatch({ type: 'space/redo' });
        expect(node(store, 'a').pinned?.collapsed).toBe(true);
    });

    it('collapses to the title bar and back, the bars lined up along the bottom edge', () => {
        const store = storeWith();
        store.dispatch(pinPlane('a'));
        store.dispatch(pinPlane('b'));
        expect(store.dispatch(collapsePinnedPlane('a'))).toBe(true);
        expect(store.dispatch(collapsePinnedPlane('b', true))).toBe(true);
        const [a, b] = pinnedPlanesOf(store.getState());
        expect(a.collapsed && b.collapsed).toBe(true);
        expect(a.frame.height).toBe(56);
        expect(a.frame.top).toBe(store.space().viewSize.height - 16 - 56);
        expect(a.frame.left + a.frame.width <= b.frame.left || b.frame.left + b.frame.width <= a.frame.left).toBe(true);
        // the rect is kept while collapsed: expanded, the frame is where it was
        store.dispatch(collapsePinnedPlane('a'));
        expect(pinnedPlanesOf(store.getState())[0].collapsed).toBe(false);
        expect(node(store, 'a').pinned!.collapsed).toBeUndefined();
        expect(store.dispatch(collapsePinnedPlane('c'))).toBe(false);
    });

    it('raises a plane to the front of the pinned planes', () => {
        const store = storeWith();
        store.dispatch(pinPlane('a'));
        store.dispatch(pinPlane('b'));
        store.dispatch(pinPlane('c'));
        store.dispatch(raisePinnedPlane('a'));
        expect(pinnedPlanesOf(store.getState()).map((plane) => plane.planeID)).toEqual(['b', 'c', 'a']);
    });
});


describe('opening a route pinned', () => {
    it('ADDS A PINNED ROOT AND MOVES NO OTHER: the node and the view entry in one write', () => {
        const store = storeWith();
        store.dispatch({ type: 'space/spaceSetView', payload: ['/a', '/b', '/c'] });
        const before = store.tree().map((plane) => plane.location);
        const writes = store.dispatched.length;
        const planeID = store.dispatch(openPinnedPlane('/x', { rect: { x: 8, y: 8, width: 320, height: 240 } }));
        expect(planeID).toBe('opened-x');
        // one write (the history's own status aside): no relayout follows it
        expect(store.dispatched.slice(writes).map((action) => action.type).filter((type) => type !== 'space/setHistoryStatus')).toEqual(['space/addRootPlane']);
        expect(store.space().view).toEqual(['/a', '/b', '/c', '/x']);
        expect(store.tree().slice(0, 3).map((plane) => plane.location)).toEqual(before);
        expect(pinnedPlanesOf(store.getState())[0]).toMatchObject({ planeID: 'opened-x', frame: { left: 8, top: 8, width: 320, height: 240 } });
    });

    it('cannot open a route whose registration refuses pinning', () => {
        const store = storeWith();
        expect(store.dispatch(openPinnedPlane('/fixed'))).toBeUndefined();
        expect(store.tree()).toHaveLength(3);
    });

    it('answers `undefined` for a route nothing is registered at', () => {
        const store = storeWith();
        expect(store.dispatch(openPinnedPlane('/missing'))).toBeUndefined();
        expect(store.tree()).toHaveLength(3);
    });
});


describe('placing a pinned plane in the space', () => {
    const rect = { x: 600, y: 80, width: 360, height: 420 };

    it('PUTS IT WHERE ITS FRAME IS, face-on: drawn on the frame\'s rect, at the frame\'s size, a free root', async () => {
        const store = storeWith();
        store.dispatch(pinPlane('b', rect));
        expect(await store.dispatch(placePinnedPlane('b'))).toBe('placed');
        const placed = node(store, 'b');
        expect(placed.pinned).toBeUndefined();
        expect(placed).toMatchObject({ manuallyPositioned: true, free: true, sizeMode: 'manual', width: 360, height: 420 });
        const drawn = corners(store.space().camera, store.space().viewSize, placed);
        expect(Math.abs(drawn.left - rect.x)).toBeLessThan(1);
        expect(Math.abs(drawn.top - rect.y)).toBeLessThan(1);
        expect(Math.abs(drawn.width - rect.width)).toBeLessThan(1);
        expect(Math.abs(drawn.height - rect.height)).toBeLessThan(1);
        // the other roots stand where they stood
        expect(node(store, 'a').location).toEqual(roots()[0].location);
        expect(node(store, 'c').location).toEqual(roots()[2].location);
    });

    it('a camera turned both ways is levelled first, a tween; the plane lands with it, and an input that takes the camera leaves it pinned', async () => {
        const store = storeWith();
        const motion = motionStub(store);
        const view = store.space().viewSize;
        const turned = interaction.camera.applyCameraDelta(store.space().camera, { yaw: 25, pitch: -15 }, view);
        store.dispatch({ type: 'space/setCamera', payload: turned });
        store.dispatch(pinPlane('a', rect));

        const placing = store.dispatch(placePinnedPlane('a'));
        expect(motion.tweens).toHaveLength(1);
        expect(motion.tweens[0].target).toMatchObject({ yaw: store.space().camera.yaw, pitch: 0, roll: 0 });
        expect(motion.tweens[0].options?.onInterrupt).toBeInstanceOf(Function);
        // still pinned while the camera turns
        expect(node(store, 'a').pinned).toBeDefined();
        motion.land();
        expect(await placing).toBe('placed');
        const drawn = corners(store.space().camera, view, node(store, 'a'));
        expect(Math.abs(drawn.left - rect.x)).toBeLessThan(1);
        expect(Math.abs(drawn.top - rect.y)).toBeLessThan(1);

        store.dispatch({ type: 'space/setCamera', payload: interaction.camera.applyCameraDelta(store.space().camera, { pitch: -20 }, view) });
        store.dispatch(pinPlane('b', rect));
        const interrupted = store.dispatch(placePinnedPlane('b'));
        store.extra.motion!.cancel();
        expect(await interrupted).toBe('interrupted');
        expect(node(store, 'b').pinned).toBeDefined();
    });

    it('a child stays its parent\'s child; `parentPlaneID` hangs it under another plane, and `\'\'` makes it a root', async () => {
        const child = treePlane('child', { parentPlaneID: 'a', location: { translateX: 50 } });
        const store = storeWith([{ ...treePlane('a'), children: [child] }, treePlane('b', { location: { translateX: 600 } })]);
        store.dispatch(pinPlane('child', rect));
        expect(await store.dispatch(placePinnedPlane('child'))).toBe('placed');
        expect(node(store, 'child').parentPlaneID).toBe('a');
        expect(node(store, 'child').free).toBeUndefined();

        store.dispatch(pinPlane('child', rect));
        expect(await store.dispatch(placePinnedPlane('child', { parentPlaneID: 'b' }))).toBe('placed');
        expect(node(store, 'b').children!.map((plane) => plane.planeID)).toEqual(['child']);
        expect(node(store, 'a').children ?? []).toEqual([]);

        store.dispatch(pinPlane('child', rect));
        expect(await store.dispatch(placePinnedPlane('child', { parentPlaneID: '' }))).toBe('placed');
        expect(store.tree().map((plane) => plane.planeID)).toEqual(['a', 'b', 'child']);
        expect(node(store, 'child').free).toBe(true);
        expect(store.space().view).toContain('/child');
    });

    it('refuses a plane that is not pinned, and a parent that is not there', async () => {
        const store = storeWith();
        expect(await store.dispatch(placePinnedPlane('a'))).toBe('refused');
        store.dispatch(pinPlane('a'));
        expect(await store.dispatch(placePinnedPlane('a', { parentPlaneID: 'nowhere' }))).toBe('refused');
        expect(node(store, 'a').pinned).toBeDefined();
    });

    it('a place is one step of the history: an undo pins the plane again', async () => {
        const store = storeWith();
        store.dispatch(pinPlane('b', rect));
        await store.dispatch(placePinnedPlane('b'));
        store.dispatch({ type: 'space/undo' });
        expect(node(store, 'b').pinned).toMatchObject({ rect });
    });
});
// #endregion module
