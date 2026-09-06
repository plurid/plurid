// #region imports
    // #region libraries
    import {
        interaction,
    } from '@plurid/plurid-engine';

    import {
        TreePlane,
        defaultConfiguration,
        PluridConfiguration,
        PluridPartialConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        actions,
    } from '~services/state/modules/space';

    import {
        encodeCameraViewpoint,
    } from '~services/logic/viewpoint';

    import {
        TEST_VIEW as view,
        treePlane,
        viewSizedSheet,
        configurationWith,
        pageConfiguration,
    } from '../../../../testing/fixtures';
    import {
        makeSpaceStore,
        motionSpy,
    } from '../../../../testing/store';
    // #endregion external


    // #region internal
    import {
        cameraCommand,
        resolveCameraTarget,
        homeTarget,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
const {
    camera: cameraEngine,
} = interaction;

/** Two roots side by side, as a layout places them. */
const plane = (
    planeID: string,
    translateX = 100,
): TreePlane => treePlane(planeID, { location: { translateX, translateY: 50 } });

/** The command tests' store: two roots, a spy for the motion controller. */
const makeStore = (
    configuration: PluridConfiguration = defaultConfiguration,
    tree: TreePlane[] = [plane('a'), plane('b', 700)],
) => {
    const store = makeSpaceStore(configuration, tree);
    const tweens = motionSpy(store);
    return { ...store, tweens };
};

const withNavigation = (
    navigation: NonNullable<PluridPartialConfiguration['space']>['navigation'],
): PluridConfiguration => configurationWith({ space: { navigation } });


describe('cameraCommand()', () => {
    it('tweens through the motion controller when animated, jumps otherwise', () => {
        const store = makeStore();
        store.dispatch(cameraCommand({ kind: 'frame', planeID: 'a' }, { animate: true }));
        expect(store.tweens).toHaveLength(1);
        expect(store.cameraCommits()).toHaveLength(0);
        // the framed plane's center is the pivot
        expect(store.tweens[0].target.pivot.x).toBeCloseTo(300, 6);
        expect(store.tweens[0].target.pivot.y).toBeCloseTo(200, 6);

        store.dispatch(cameraCommand({ kind: 'frame', planeID: 'a' }, { animate: false }));
        expect(store.cameraCommits()).toHaveLength(1);
        expect(store.space().camera.pivot.x).toBeCloseTo(300, 6);
    });

    it('jumps when no motion controller is registered (no View mounted)', () => {
        const store = makeSpaceStore(defaultConfiguration, [plane('a'), plane('b', 700)]);
        store.dispatch(cameraCommand({ kind: 'reset' }, { animate: true }));
        expect(store.cameraCommits()).toHaveLength(1);
    });

    it('home is the identity camera by default, the configured viewpoint otherwise, the runtime home first', () => {
        const store = makeStore();
        const state = store.getState();
        expect(homeTarget(state.space, state.configuration)).toEqual(cameraEngine.identityCamera(view, state.space.camera.perspective));

        const configured = makeStore(withNavigation({ home: '30,45,0,0,0,1' }));
        const target = resolveCameraTarget({ kind: 'home' }, configured.getState());
        expect(target!.pitch).toBeCloseTo(30, 6);
        expect(target!.yaw).toBeCloseTo(45, 6);

        // `setHome` without a viewpoint captures the current camera
        configured.dispatch(actions.applyCameraDelta({ yaw: 10 }));
        configured.dispatch(cameraCommand({ kind: 'delta', delta: { pitch: 5 } }, { animate: false }));
        configured.dispatch(actions.setHome(encodeCameraViewpoint(configured.space().camera, view, 2)));
        const runtime = resolveCameraTarget({ kind: 'home' }, configured.getState());
        expect(runtime!.yaw).toBeCloseTo(10, 6);
        expect(runtime!.pitch).toBeCloseTo(5, 6);
    });

    it('presets resolve from the configuration; unknown names do nothing', () => {
        const store = makeStore(withNavigation({ presets: { side: '0,90,0,0,0,1' } }));
        store.dispatch(cameraCommand({ kind: 'preset', name: 'side' }, { animate: true }));
        expect(store.tweens).toHaveLength(1);
        expect(store.tweens[0].target.yaw).toBeCloseTo(90, 6);
        store.dispatch(cameraCommand({ kind: 'preset', name: 'nope' }, { animate: true }));
        expect(store.tweens).toHaveLength(1);
    });

    it('bookmarks: save captures the camera (v2), go tweens to it, remove deletes it', () => {
        const store = makeStore();
        store.dispatch(actions.applyCameraDelta({ yaw: 33, pitch: -12, zoom: { factor: 1.5 } }));
        store.dispatch(cameraCommand({ kind: 'bookmark', name: 'desk', action: 'save' }));
        expect(store.space().bookmarks.desk).toMatch(/^v2\|/);

        store.dispatch(actions.setCamera(cameraEngine.identityCamera(view, store.space().camera.perspective)));
        store.dispatch(cameraCommand({ kind: 'bookmark', name: 'desk' }, { animate: true }));
        expect(store.tweens).toHaveLength(1);
        expect(store.tweens[0].target.yaw).toBeCloseTo(33, 2);
        expect(store.tweens[0].target.pitch).toBeCloseTo(-12, 2);
        expect(store.tweens[0].target.scale).toBeCloseTo(1.5, 2);

        store.dispatch(cameraCommand({ kind: 'bookmark', name: 'desk', action: 'remove' }));
        expect(store.space().bookmarks.desk).toBeUndefined();
        store.dispatch(cameraCommand({ kind: 'bookmark', name: 'desk' }, { animate: true }));
        expect(store.tweens).toHaveLength(1);
    });

    it('a delta resolves to the camera the reducer would produce', () => {
        const store = makeStore();
        const target = resolveCameraTarget({ kind: 'delta', delta: { yaw: 20, pan: { x: 30, y: 0 } } }, store.getState());
        store.dispatch(actions.applyCameraDelta({ yaw: 20, pan: { x: 30, y: 0 } }));
        expect(target).toEqual(store.space().camera);
    });

    it('fit frames every plane inside the view', () => {
        const store = makeStore();
        const target = resolveCameraTarget({ kind: 'fit' }, store.getState())!;
        const matrix = cameraEngine.cameraMatrix(target, view);
        const corners = cameraEngine.worldBounds(store.space().tree, { fallbackWidth: 400, fallbackHeight: 300 })!;
        for (const corner of cameraEngine.boxCorners(corners)) {
            const projected = cameraEngine.projectWithMatrix(matrix, target.perspective, view, corner);
            expect(projected.x).toBeGreaterThanOrEqual(-1);
            expect(projected.x).toBeLessThanOrEqual(view.width + 1);
            expect(projected.y).toBeGreaterThanOrEqual(-1);
            expect(projected.y).toBeLessThanOrEqual(view.height + 1);
        }
    });
});


describe('the page presentation: framing docks', () => {
    /** Two pages down the column. */
    const pages = () => [
        viewSizedSheet('p1'),
        viewSizedSheet('p2', { location: { translateY: view.height + 50 } }),
    ];
    const makePageStore = (
        configuration = pageConfiguration(),
    ) => makeStore(configuration, pages());

    it('frame resolves to the dock pose (scale 1, the sheet exactly on the view), not a fitted frame', () => {
        const store = makePageStore();
        const docked = resolveCameraTarget({ kind: 'frame', planeID: 'p1' }, store.getState())!;
        expect(docked.scale).toBe(1);
        expect(docked.yaw).toBe(0);
        expect(docked.pitch).toBe(0);
        expect(docked.pivot).toEqual({ x: view.width / 2, y: view.height / 2, z: 0 });
        // the same sheet in the space presentation is fitted with a margin
        const fitted = resolveCameraTarget({ kind: 'frame', planeID: 'p1' }, { ...store.getState(), configuration: defaultConfiguration })!;
        expect(fitted.scale).toBeLessThan(1);
    });

    it('dock without a plane docks the candidate; reveal is the reveal pose of the docked page', () => {
        const store = makePageStore();
        const identity = cameraEngine.identityCamera(view);
        const dock = resolveCameraTarget({ kind: 'dock' }, store.getState())!;
        expect(dock.scale).toBe(1);
        expect(dock.pivot).toEqual(identity.pivot);
        const reveal = resolveCameraTarget({ kind: 'reveal' }, store.getState())!;
        expect(reveal.scale).toBeCloseTo(cameraEngine.REVEAL.scale, 9);
        expect(reveal.pitch).toBeCloseTo(cameraEngine.REVEAL.pitch, 9);
        expect(reveal.yaw).toBeCloseTo(cameraEngine.REVEAL.yaw, 9);
        // a docked second page: dock (no plane) keeps it, reveal reveals it
        store.dispatch(actions.setCamera(resolveCameraTarget({ kind: 'frame', planeID: 'p2' }, store.getState())!));
        expect(resolveCameraTarget({ kind: 'dock' }, store.getState())!.pivot.y).toBeCloseTo(view.height + 50 + view.height / 2, 6);
    });

    it('the reveal pose is the configured one', () => {
        const store = makePageStore(pageConfiguration({ space: { docking: { reveal: { scale: 0.5, pitch: 20, yaw: 15 } } } }));
        const reveal = resolveCameraTarget({ kind: 'reveal' }, store.getState())!;
        expect(reveal.scale).toBeCloseTo(0.5, 9);
        expect(reveal.pitch).toBeCloseTo(20, 9);
        expect(reveal.yaw).toBeCloseTo(15, 9);
    });

    it('a swing that lands docked records its destination; a reveal records none', () => {
        const store = makePageStore();
        store.dispatch(cameraCommand({ kind: 'frame', planeID: 'p2' }));
        store.dispatch(cameraCommand({ kind: 'reveal' }));
        expect(store.tweens).toHaveLength(2);
        expect(store.dispatched.filter((action) => action.type === actions.setDockingPlaneID.type).map((action) => action.payload)).toEqual(['p2', '']);
    });

    it('docking.chrome shown: the destination is still recorded at the commit (the selector is what ignores it)', () => {
        const store = makePageStore(pageConfiguration({ space: { docking: { chrome: 'shown' } } }));
        store.dispatch(cameraCommand({ kind: 'frame', planeID: 'p2' }));
        expect(store.tweens).toHaveLength(1);
        expect(store.dispatched.filter((action) => action.type === actions.setDockingPlaneID.type).map((action) => action.payload)).toEqual(['p2']);
    });

    it('docking.motion instant: a move that lands docked jumps, the reveal still swings', () => {
        const store = makePageStore(pageConfiguration({ space: { docking: { motion: 'instant' } } }));
        store.dispatch(cameraCommand({ kind: 'frame', planeID: 'p2' }));
        expect(store.tweens).toHaveLength(0);
        expect(store.space().camera.scale).toBe(1);
        expect(store.space().camera.pivot.y).toBeCloseTo(view.height + 50 + view.height / 2, 6);
        store.dispatch(cameraCommand({ kind: 'dock', planeID: 'p1' }));
        expect(store.tweens).toHaveLength(0);
        store.dispatch(cameraCommand({ kind: 'reveal' }));
        expect(store.tweens).toHaveLength(1);
    });

    it('a jump cancels a running motion before it commits (a tween frame never overwrites it)', () => {
        const store = makePageStore(pageConfiguration({ space: { docking: { motion: 'instant' } } }));
        let cancelled = 0;
        store.extra.motion!.cancel = () => { cancelled += 1; };
        store.dispatch(cameraCommand({ kind: 'frame', planeID: 'p2' }));
        expect(cancelled).toBe(1);
        expect(store.cameraCommits()).toHaveLength(1);
    });
});
// #endregion module
