// #region imports
    // #region libraries
    import {
        defaultConfiguration,
        PluridConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        actions,
    } from '~services/state/modules/space';

    import {
        reportPlaneSize,
    } from '~services/logic/camera';

    import {
        navigatePlane,
    } from '~services/logic/animation';

    import {
        treePlane,
        pageConfiguration,
    } from '../../../../testing/fixtures';
    import {
        makeSpaceStore,
        motionSpy,
        HeadlessStore,
    } from '../../../../testing/store';
    // #endregion external


    // #region internal
    import {
        toggleLinkPlane,
        closePlane,
        openLastClosed,
        navigateToParent,
    } from '../planes';
    // #endregion internal
// #endregion imports



// #region module
type LinkParameters = Parameters<typeof toggleLinkPlane>[0];

const registry: LinkParameters['planesRegistry'] = new Map([
    ['/detail', {
        route: { absolute: '/detail', value: '/detail', fragments: { elements: [], texts: [] }, parameters: {}, query: {} },
        component: () => null,
    }],
]);


/** One root at x 100, the thunk extra live (a motion controller is a spy, when a test mounts one). */
const makeStore = (
    configuration: PluridConfiguration = defaultConfiguration,
): HeadlessStore => makeSpaceStore(configuration, [treePlane('a', { location: { translateX: 100 } })]);

const child = (store: HeadlessStore) => store.tree()[0].children![0];

const parameters = (
    overrides: Partial<LinkParameters> = {},
): LinkParameters => ({
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

        store.dispatch(toggleLinkPlane(parameters()));
        const spawned = child(store);
        expect(spawned.spawnedByLinkID).toBe('a#/detail#0');
        expect(spawned.show).toBe(true);
        expect(spawned.location.translateX).toBeCloseTo(400, 9);

        store.dispatch(toggleLinkPlane(parameters()));
        expect(store.tree()[0].children).toHaveLength(1);
        expect(child(store).planeID).toBe(spawned.planeID);
        expect(child(store).show).toBe(false);
        expect(store.space().lastClosedPlane).toBe(spawned.planeID);

        store.dispatch(toggleLinkPlane(parameters()));
        expect(store.tree()[0].children).toHaveLength(1);
        expect(child(store).show).toBe(true);
    });

    it('two links in one plane spawn two distinct children', () => {
        const store = makeStore();
        store.dispatch(toggleLinkPlane(parameters({ linkID: 'a#/detail#0', linkCoordinates: { x: 300, y: 40 } })));
        store.dispatch(toggleLinkPlane(parameters({ linkID: 'a#/detail#1', linkCoordinates: { x: 300, y: 140 } })));
        const children = store.tree()[0].children!;
        expect(children).toHaveLength(2);
        expect(children[0].planeID).not.toBe(children[1].planeID);
        // deterministic: the id derives from the link id
        expect(children[0].planeID).toMatch(/\/detail@[0-9a-f]{8}$/);
        // a child's top (its bar's top) sits half a strip above its link's midline: the bridge is centred on the link
        expect(children[0].bridgeOffset).toBe(-15);
        expect(children[0].location.translateY).toBe(40 - 15);
        expect(children[1].location.translateY).toBe(140 - 15);
    });

    it('closePlane / openLastClosed round-trip a spawned child', () => {
        const store = makeStore();
        store.dispatch(toggleLinkPlane(parameters()));
        const id = child(store).planeID;

        store.dispatch(closePlane(id));
        expect(child(store).show).toBe(false);
        expect(store.space().lastClosedPlane).toBe(id);

        store.dispatch(openLastClosed());
        expect(child(store).show).toBe(true);
        expect(store.space().lastClosedPlane).toBe('');
    });

    it('does nothing for an unregistered route', () => {
        const store = makeStore();
        store.dispatch(toggleLinkPlane(parameters({ route: '/missing', linkID: 'a#/missing#0' })));
        expect(store.tree()[0].children ?? []).toHaveLength(0);
    });

    it('reopening relocates the plane from the fresh link coordinates BEFORE framing it', () => {
        const store = makeStore();
        store.dispatch(toggleLinkPlane(parameters({ navigate: true })));
        store.dispatch(toggleLinkPlane(parameters()));
        expect(child(store).show).toBe(false);
        const commitsBefore = store.cameraCommits().length;

        // the link moved (a resize): the click measures new coordinates
        store.dispatch(toggleLinkPlane(parameters({ navigate: true, linkCoordinates: { x: 300, y: 240 } })));
        expect(child(store).show).toBe(true);
        expect(child(store).linkCoordinates).toEqual({ x: 300, y: 240 });
        expect(child(store).location.translateY).toBe(240 - 15);
        // framed once from the best-known geometry, with a re-frame pending on the first measurement
        expect(store.cameraCommits().length).toBe(commitsBefore + 1);
        expect(store.extra.pendingFrame).toEqual({ planeID: child(store).planeID, animate: true });
    });

    it('the first measurement after a reopen re-frames the plane, then the pending frame is spent', () => {
        const store = makeStore();
        store.dispatch(toggleLinkPlane(parameters({ navigate: true })));
        store.dispatch(toggleLinkPlane(parameters()));
        store.dispatch(toggleLinkPlane(parameters({ navigate: true })));
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
        store.dispatch(toggleLinkPlane(parameters({ navigate: true })));
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
        store.dispatch(toggleLinkPlane(parameters({ navigate: true })));
        const id = child(store).planeID;
        store.dispatch(actions.setSpaceField({ field: 'activePlaneID', value: id }));
        const commitsBefore = store.cameraCommits().length;

        store.dispatch(closePlane(id));
        expect(child(store).show).toBe(false);
        expect(store.cameraCommits().length).toBe(commitsBefore + 1);
        expect(store.space().activePlaneID).toBe('a');
        // the parent is framed: the pivot sits on the parent plane's center
        const camera = store.space().camera;
        expect(camera.pivot.x).toBeCloseTo(100 + 400 / 2, 6);
        expect(camera.pivot.y).toBeCloseTo(300 / 2, 6);
    });

    it('closing the child the camera LOOKS AT hands the camera to its parent (no hover needed)', () => {
        const store = makeStore();
        store.dispatch(toggleLinkPlane(parameters({ navigate: true })));
        const id = child(store).planeID;
        store.dispatch(reportPlaneSize({ planeID: id, width: 400, height: 300 }));
        store.dispatch(navigatePlane(child(store), { animate: false }));
        store.dispatch(actions.setSpaceField({ field: 'activePlaneID', value: '' }));
        const commitsBefore = store.cameraCommits().length;

        store.dispatch(closePlane(id));
        expect(store.cameraCommits().length).toBe(commitsBefore + 1);
        expect(store.space().activePlaneID).toBe('a');
    });

    it('`navigate: "stay"`, the `space.navigation.onClose` policy, and roots never move the camera', () => {
        const store = makeStore();
        store.dispatch(toggleLinkPlane(parameters({ navigate: true })));
        const id = child(store).planeID;
        store.dispatch(actions.setSpaceField({ field: 'activePlaneID', value: id }));
        let commits = store.cameraCommits().length;

        store.dispatch(closePlane(id, { navigate: 'stay' }));
        expect(store.cameraCommits().length).toBe(commits);
        expect(child(store).show).toBe(false);

        const staying = makeStore({
            ...defaultConfiguration,
            space: { ...defaultConfiguration.space, navigation: { ...defaultConfiguration.space.navigation, onClose: 'stay' } },
        });
        staying.dispatch(toggleLinkPlane(parameters({ navigate: true })));
        const stayingID = child(staying).planeID;
        staying.dispatch(actions.setSpaceField({ field: 'activePlaneID', value: stayingID }));
        commits = staying.cameraCommits().length;
        staying.dispatch(closePlane(stayingID));
        expect(staying.cameraCommits().length).toBe(commits);

        // a root has no parent to return to
        store.dispatch(actions.setSpaceField({ field: 'activePlaneID', value: 'a' }));
        commits = store.cameraCommits().length;
        store.dispatch(closePlane('a'));
        expect(store.tree()[0].show).toBe(false);
        expect(store.cameraCommits().length).toBe(commits);
    });

    it('a child that is neither active nor in view closes in place', () => {
        const store = makeStore();
        store.dispatch(toggleLinkPlane(parameters({ navigate: false })));
        const id = child(store).planeID;
        // the camera sits on the parent: the child (spawned to the right) is not under the view center
        store.dispatch(navigatePlane(store.tree()[0], { animate: false }));
        store.dispatch(actions.setSpaceField({ field: 'activePlaneID', value: '' }));
        const commits = store.cameraCommits().length;

        store.dispatch(closePlane(id));
        expect(child(store).show).toBe(false);
        expect(store.cameraCommits().length).toBe(commits);
    });
});


describe('navigateToParent() / openLastClosed()', () => {
    it('navigateToParent frames the parent and is a no-op for roots', () => {
        const store = makeStore();
        store.dispatch(toggleLinkPlane(parameters({ navigate: false })));
        const commits = store.cameraCommits().length;

        store.dispatch(navigateToParent(child(store).planeID));
        expect(store.cameraCommits().length).toBe(commits + 1);
        expect(store.space().activePlaneID).toBe('a');

        store.dispatch(navigateToParent('a'));
        expect(store.cameraCommits().length).toBe(commits + 1);
    });

    it('openLastClosed brings the plane back into view, re-framed on its first measurement', () => {
        const store = makeStore();
        store.dispatch(toggleLinkPlane(parameters({ navigate: false })));
        const id = child(store).planeID;
        store.dispatch(closePlane(id, { navigate: 'stay' }));
        const commits = store.cameraCommits().length;

        store.dispatch(openLastClosed());
        expect(child(store).show).toBe(true);
        expect(store.cameraCommits().length).toBe(commits + 1);
        expect(store.extra.pendingFrame?.planeID).toBe(id);

        store.dispatch(closePlane(id, { navigate: 'stay' }));
        store.dispatch(openLastClosed({ navigate: false }));
        expect(store.cameraCommits().length).toBe(commits + 1);
    });
});


describe('the page presentation: docking controls on the link path', () => {
    it('a link click swings to the child and records it as the destination (the chrome stays hidden)', () => {
        const store = makeStore(pageConfiguration());
        const tweens = motionSpy(store);
        store.dispatch(toggleLinkPlane(parameters({ navigate: true })));
        expect(tweens).toHaveLength(1);
        expect(tweens[0].target.scale).toBe(1);
        expect(store.cameraCommits()).toHaveLength(0);
        const destinations = store.dispatched.filter((action) => action.type === actions.setDockingPlaneID.type).map((action) => action.payload);
        expect(destinations).toEqual([child(store).planeID]);
    });

    it('on a page a link is a link: clicking an OPEN link navigates to it instead of closing it', () => {
        const store = makeStore(pageConfiguration());
        const tweens = motionSpy(store);
        store.dispatch(toggleLinkPlane(parameters({ navigate: true })));
        expect(child(store).show).toBe(true);
        store.dispatch(toggleLinkPlane(parameters({ navigate: true })));
        expect(child(store).show).toBe(true);
        expect(store.space().lastClosedPlane).toBe('');
        expect(tweens).toHaveLength(2);
        expect(tweens[1].target.scale).toBe(1);
        // the space presentation keeps the toggle
        const space = makeStore(defaultConfiguration);
        space.dispatch(toggleLinkPlane(parameters({ navigate: true })));
        space.dispatch(toggleLinkPlane(parameters({ navigate: true })));
        expect(child(space).show).toBe(false);
    });

    it('docking.motion instant: the link click lands on the child in one jump', () => {
        const store = makeStore(pageConfiguration({ space: { docking: { motion: 'instant' } } }));
        const tweens = motionSpy(store);
        store.dispatch(toggleLinkPlane(parameters({ navigate: true })));
        expect(tweens).toHaveLength(0);
        expect(store.cameraCommits()).toHaveLength(1);
        expect(store.space().camera.scale).toBe(1);
        expect(Math.abs(store.space().camera.yaw)).toBeCloseTo(90, 6);
    });
});
// #endregion module
