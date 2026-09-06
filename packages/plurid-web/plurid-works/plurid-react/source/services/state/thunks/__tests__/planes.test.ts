// #region imports
    // #region libraries
    import {
        TreePlane,
        defaultConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        reducer,
        actions,
    } from '~services/state/modules/space';

    import {
        toggleLinkPlane,
        closePlane,
        openLastClosed,
        navigateToParent,
    } from '../planes';

    import {
        reportPlaneSize,
    } from '~services/logic/camera';

    import {
        navigatePlane,
    } from '~services/logic/animation';

    import {
        createThunkExtra,
    } from '~services/state/extra';
    // #endregion external
// #endregion imports



// #region module
const plane = (
    planeID: string,
): TreePlane => ({
    sourceID: planeID,
    planeID,
    route: '/' + planeID,
    routeDivisions: {} as any,
    width: 400,
    height: 300,
    location: {
        translateX: 100,
        translateY: 0,
        translateZ: 0,
        rotateX: 0,
        rotateY: 0,
    },
    show: true,
});

const registry = new Map<string, any>([
    ['/detail', {
        route: { absolute: '/detail', value: '/detail', fragments: { elements: [], texts: [] }, parameters: {}, query: {} },
        component: () => null,
    }],
]);


/** A minimal store: the space reducer under `state.space`, thunk-aware dispatch (with the thunk extra). */
const makeStore = (
    configuration: any = defaultConfiguration,
) => {
    let space = reducer(reducer(undefined, { type: '@@init' }), actions.setViewSize({ width: 1000, height: 600 }));
    space = reducer(space, actions.restoreArrangement({ tree: [plane('a')], links: [] }));
    const getState = () => ({ space, configuration } as any);
    const extra = createThunkExtra();
    const dispatched: any[] = [];
    const dispatch: any = (action: any) => {
        if (typeof action === 'function') {
            return action(dispatch, getState, extra);
        }
        dispatched.push(action);
        space = reducer(space, action);
        return action;
    };
    const cameraCommits = () => dispatched.filter((action) => action.type === actions.setCamera.type);
    return { dispatch, getState, dispatched, extra, cameraCommits, tree: () => space.tree, state: () => space };
};

const child = (store: ReturnType<typeof makeStore>) => store.tree()[0].children![0];

const parameters = (overrides: Partial<Parameters<typeof toggleLinkPlane>[0]> = {}) => ({
    parentPlaneID: 'a',
    linkID: 'a#/detail#0',
    route: '/detail',
    linkCoordinates: { x: 300, y: 40 },
    planesRegistry: registry,
    navigate: false,
    ...overrides,
});


describe('toggleLinkPlane()', () => {
    it('spawns once, then toggles the SAME plane by the link id', () => {
        const store = makeStore();

        toggleLinkPlane(parameters())(store.dispatch, store.getState);
        const spawned = store.tree()[0].children![0];
        expect(spawned.spawnedByLinkID).toBe('a#/detail#0');
        expect(spawned.show).toBe(true);
        expect(spawned.location.translateX).toBeCloseTo(400, 9);

        toggleLinkPlane(parameters())(store.dispatch, store.getState);
        expect(store.tree()[0].children).toHaveLength(1);
        expect(store.tree()[0].children![0].planeID).toBe(spawned.planeID);
        expect(store.tree()[0].children![0].show).toBe(false);
        expect(store.state().lastClosedPlane).toBe(spawned.planeID);

        toggleLinkPlane(parameters())(store.dispatch, store.getState);
        expect(store.tree()[0].children).toHaveLength(1);
        expect(store.tree()[0].children![0].show).toBe(true);
    });

    it('two links in one plane spawn two distinct children', () => {
        const store = makeStore();
        toggleLinkPlane(parameters({ linkID: 'a#/detail#0', linkCoordinates: { x: 300, y: 40 } }))(store.dispatch, store.getState);
        toggleLinkPlane(parameters({ linkID: 'a#/detail#1', linkCoordinates: { x: 300, y: 140 } }))(store.dispatch, store.getState);
        const children = store.tree()[0].children!;
        expect(children).toHaveLength(2);
        expect(children[0].planeID).not.toBe(children[1].planeID);
        // deterministic: the id derives from the link id
        expect(children[0].planeID).toMatch(/\/detail@[0-9a-f]{8}$/);
        expect(children[0].location.translateY).toBe(40);
        expect(children[1].location.translateY).toBe(140);
    });

    it('closePlane / openLastClosed round-trip a spawned child', () => {
        const store = makeStore();
        toggleLinkPlane(parameters())(store.dispatch, store.getState);
        const id = store.tree()[0].children![0].planeID;

        closePlane(id)(store.dispatch, store.getState);
        expect(store.tree()[0].children![0].show).toBe(false);
        expect(store.state().lastClosedPlane).toBe(id);

        openLastClosed()(store.dispatch, store.getState);
        expect(store.tree()[0].children![0].show).toBe(true);
        expect(store.state().lastClosedPlane).toBe('');
    });

    it('does nothing for an unregistered route', () => {
        const store = makeStore();
        toggleLinkPlane(parameters({ route: '/missing', linkID: 'a#/missing#0' }))(store.dispatch, store.getState);
        expect(store.tree()[0].children ?? []).toHaveLength(0);
    });

    it('reopening relocates the plane from the fresh link coordinates BEFORE framing it', () => {
        const store = makeStore();
        toggleLinkPlane(parameters({ navigate: true }))(store.dispatch, store.getState);
        toggleLinkPlane(parameters())(store.dispatch, store.getState);
        expect(child(store).show).toBe(false);
        const commitsBefore = store.cameraCommits().length;

        // the link moved (a resize): the click measures new coordinates
        toggleLinkPlane(parameters({ navigate: true, linkCoordinates: { x: 300, y: 240 } }))(store.dispatch, store.getState);
        expect(child(store).show).toBe(true);
        expect(child(store).linkCoordinates).toEqual({ x: 300, y: 240 });
        expect(child(store).location.translateY).toBe(240);
        // framed once from the best-known geometry, with a re-frame pending on the first measurement
        expect(store.cameraCommits().length).toBe(commitsBefore + 1);
        expect(store.extra.pendingFrame).toEqual({ planeID: child(store).planeID, animate: true });
    });

    it('the first measurement after a reopen re-frames the plane, then the pending frame is spent', () => {
        const store = makeStore();
        toggleLinkPlane(parameters({ navigate: true }))(store.dispatch, store.getState);
        toggleLinkPlane(parameters())(store.dispatch, store.getState);
        toggleLinkPlane(parameters({ navigate: true }))(store.dispatch, store.getState);
        const planeID = child(store).planeID;
        const commitsBefore = store.cameraCommits().length;

        store.dispatch(reportPlaneSize({ planeID, width: 900, height: 500 }));
        expect(child(store).width).toBe(900);
        expect(store.cameraCommits().length).toBe(commitsBefore + 1);
        expect(store.extra.pendingFrame).toBeUndefined();

        // a later measurement is just a size
        store.dispatch(reportPlaneSize({ planeID, width: 910, height: 500 }));
        expect(store.cameraCommits().length).toBe(commitsBefore + 1);
    });

    it('a measurement never re-frames while the user drives the camera', () => {
        const store = makeStore();
        toggleLinkPlane(parameters({ navigate: true }))(store.dispatch, store.getState);
        const planeID = child(store).planeID;
        store.extra.pendingFrame = { planeID, animate: true };
        store.dispatch(actions.setMotion('gesture'));
        const commitsBefore = store.cameraCommits().length;

        store.dispatch(reportPlaneSize({ planeID, width: 900, height: 500 }));
        expect(store.cameraCommits().length).toBe(commitsBefore);
        expect(store.extra.pendingFrame).toBeUndefined();
    });
});


describe('closePlane()', () => {
    it('closing the ACTIVE child hands the camera to its parent', () => {
        const store = makeStore();
        toggleLinkPlane(parameters({ navigate: true }))(store.dispatch, store.getState);
        const id = child(store).planeID;
        store.dispatch(actions.setSpaceField({ field: 'activePlaneID', value: id }));
        const commitsBefore = store.cameraCommits().length;

        closePlane(id)(store.dispatch, store.getState);
        expect(child(store).show).toBe(false);
        expect(store.cameraCommits().length).toBe(commitsBefore + 1);
        expect(store.state().activePlaneID).toBe('a');
        // the parent is framed: the pivot sits on the parent plane's center
        const camera = store.state().camera;
        expect(camera.pivot.x).toBeCloseTo(100 + 400 / 2, 6);
        expect(camera.pivot.y).toBeCloseTo(300 / 2, 6);
    });

    it('closing the child the camera LOOKS AT hands the camera to its parent (no hover needed)', () => {
        const store = makeStore();
        toggleLinkPlane(parameters({ navigate: true }))(store.dispatch, store.getState);
        const id = child(store).planeID;
        store.dispatch(reportPlaneSize({ planeID: id, width: 400, height: 300 }));
        store.dispatch(navigatePlane(child(store), { animate: false }));
        store.dispatch(actions.setSpaceField({ field: 'activePlaneID', value: '' }));
        const commitsBefore = store.cameraCommits().length;

        closePlane(id)(store.dispatch, store.getState);
        expect(store.cameraCommits().length).toBe(commitsBefore + 1);
        expect(store.state().activePlaneID).toBe('a');
    });

    it('`navigate: "stay"`, the `space.navigation.onClose` policy, and roots never move the camera', () => {
        const store = makeStore();
        toggleLinkPlane(parameters({ navigate: true }))(store.dispatch, store.getState);
        const id = child(store).planeID;
        store.dispatch(actions.setSpaceField({ field: 'activePlaneID', value: id }));
        let commits = store.cameraCommits().length;

        closePlane(id, { navigate: 'stay' })(store.dispatch, store.getState);
        expect(store.cameraCommits().length).toBe(commits);
        expect(child(store).show).toBe(false);

        const staying = makeStore({
            ...defaultConfiguration,
            space: { ...defaultConfiguration.space, navigation: { ...defaultConfiguration.space.navigation, onClose: 'stay' } },
        });
        toggleLinkPlane(parameters({ navigate: true }))(staying.dispatch, staying.getState);
        const stayingID = child(staying).planeID;
        staying.dispatch(actions.setSpaceField({ field: 'activePlaneID', value: stayingID }));
        commits = staying.cameraCommits().length;
        closePlane(stayingID)(staying.dispatch, staying.getState);
        expect(staying.cameraCommits().length).toBe(commits);

        // a root has no parent to return to
        store.dispatch(actions.setSpaceField({ field: 'activePlaneID', value: 'a' }));
        commits = store.cameraCommits().length;
        closePlane('a')(store.dispatch, store.getState);
        expect(store.tree()[0].show).toBe(false);
        expect(store.cameraCommits().length).toBe(commits);
    });

    it('a child that is neither active nor in view closes in place', () => {
        const store = makeStore();
        toggleLinkPlane(parameters({ navigate: false }))(store.dispatch, store.getState);
        const id = child(store).planeID;
        // the camera sits on the parent: the child (spawned to the right) is not under the view center
        store.dispatch(navigatePlane(store.tree()[0], { animate: false }));
        store.dispatch(actions.setSpaceField({ field: 'activePlaneID', value: '' }));
        const commits = store.cameraCommits().length;

        closePlane(id)(store.dispatch, store.getState);
        expect(child(store).show).toBe(false);
        expect(store.cameraCommits().length).toBe(commits);
    });
});


describe('navigateToParent() / openLastClosed()', () => {
    it('navigateToParent frames the parent and is a no-op for roots', () => {
        const store = makeStore();
        toggleLinkPlane(parameters({ navigate: false }))(store.dispatch, store.getState);
        const commits = store.cameraCommits().length;

        navigateToParent(child(store).planeID)(store.dispatch, store.getState);
        expect(store.cameraCommits().length).toBe(commits + 1);
        expect(store.state().activePlaneID).toBe('a');

        navigateToParent('a')(store.dispatch, store.getState);
        expect(store.cameraCommits().length).toBe(commits + 1);
    });

    it('openLastClosed brings the plane back into view, re-framed on its first measurement', () => {
        const store = makeStore();
        toggleLinkPlane(parameters({ navigate: false }))(store.dispatch, store.getState);
        const id = child(store).planeID;
        closePlane(id, { navigate: 'stay' })(store.dispatch, store.getState);
        const commits = store.cameraCommits().length;

        openLastClosed()(store.dispatch, store.getState);
        expect(child(store).show).toBe(true);
        expect(store.cameraCommits().length).toBe(commits + 1);
        expect(store.extra.pendingFrame?.planeID).toBe(id);

        closePlane(id, { navigate: 'stay' })(store.dispatch, store.getState);
        openLastClosed({ navigate: false })(store.dispatch, store.getState);
        expect(store.cameraCommits().length).toBe(commits + 1);
    });

describe('the page presentation: docking controls on the link path', () => {
    const pageConfiguration = (docking?: { motion: 'swing' | 'instant'; chrome: 'hidden' | 'shown' }) => ({
        ...defaultConfiguration,
        space: { ...defaultConfiguration.space, presentation: 'page' as const, ...(docking ? { docking } : {}) },
        elements: { ...defaultConfiguration.elements, plane: { ...defaultConfiguration.elements.plane, height: 1 } },
    });
    /** A mounted View's motion controller, as a spy. */
    const withMotion = (store: ReturnType<typeof makeStore>) => {
        const tweens: any[] = [];
        store.extra.motion = {
            tweenTo: (target: any, options: any) => { tweens.push({ target, options }); },
            cancel: () => {},
            fling: () => {},
            isActive: () => false,
            reducedMotion: () => false,
        } as any;
        return tweens;
    };

    it('a link click swings to the child and records it as the destination (the chrome stays hidden)', () => {
        const store = makeStore(pageConfiguration());
        const tweens = withMotion(store);
        store.dispatch(toggleLinkPlane(parameters({ navigate: true })));
        expect(tweens).toHaveLength(1);
        expect(tweens[0].target.scale).toBe(1);
        expect(store.cameraCommits()).toHaveLength(0);
        const destinations = store.dispatched.filter((action) => action.type === actions.setDockingPlaneID.type).map((action) => action.payload);
        expect(destinations).toEqual([child(store).planeID]);
    });

    it('on a page a link is a link: clicking an OPEN link navigates to it instead of closing it', () => {
        const store = makeStore(pageConfiguration());
        const tweens = withMotion(store);
        store.dispatch(toggleLinkPlane(parameters({ navigate: true })));
        expect(child(store).show).toBe(true);
        store.dispatch(toggleLinkPlane(parameters({ navigate: true })));
        expect(child(store).show).toBe(true);
        expect(store.state().lastClosedPlane).toBe('');
        expect(tweens).toHaveLength(2);
        expect(tweens[1].target.scale).toBe(1);
        // the space presentation keeps the toggle
        const space = makeStore(defaultConfiguration);
        space.dispatch(toggleLinkPlane(parameters({ navigate: true })));
        space.dispatch(toggleLinkPlane(parameters({ navigate: true })));
        expect(child(space).show).toBe(false);
    });

    it('docking.motion instant: the link click lands on the child in one jump', () => {
        const store = makeStore(pageConfiguration({ motion: 'instant', chrome: 'hidden' }));
        const tweens = withMotion(store);
        store.dispatch(toggleLinkPlane(parameters({ navigate: true })));
        expect(tweens).toHaveLength(0);
        expect(store.cameraCommits()).toHaveLength(1);
        expect(store.state().camera.scale).toBe(1);
        expect(Math.abs(store.state().camera.yaw)).toBeCloseTo(90, 6);
    });
});

});
// #endregion module
