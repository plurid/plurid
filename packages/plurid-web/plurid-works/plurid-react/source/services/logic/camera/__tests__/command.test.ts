// #region imports
    // #region libraries
    import {
        interaction,
    } from '@plurid/plurid-engine';

    import {
        TreePlane,
        defaultConfiguration,
        PluridConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        reducer,
        actions,
    } from '~services/state/modules/space';

    import {
        cameraCommand,
        resolveCameraTarget,
        homeTarget,
    } from '../index';

    import {
        encodeCameraViewpoint,
    } from '~services/logic/viewpoint';
    // #endregion external
// #endregion imports



// #region module
const {
    camera: cameraEngine,
} = interaction;

const view = { width: 1000, height: 600 };

const plane = (
    planeID: string,
    translateX = 100,
): TreePlane => ({
    sourceID: planeID,
    planeID,
    route: '/' + planeID,
    routeDivisions: {} as any,
    width: 400,
    height: 300,
    location: {
        translateX,
        translateY: 50,
        translateZ: 0,
        rotateX: 0,
        rotateY: 0,
    },
    show: true,
});


const makeStore = (
    configuration: PluridConfiguration = defaultConfiguration,
) => {
    let space = reducer(reducer(undefined, { type: '@@init' }), actions.setViewSize(view));
    space = reducer(space, actions.restoreArrangement({ tree: [plane('a'), plane('b', 700)], links: [] }));
    const getState = () => ({ space, configuration } as any);
    const dispatched: any[] = [];
    const dispatch: any = (action: any) => {
        if (typeof action === 'function') {
            return action(dispatch, getState, extra);
        }
        dispatched.push(action);
        space = reducer(space, action);
        return action;
    };
    const tweens: any[] = [];
    const extra = {
        motion: {
            tweenTo: (target: any, options: any) => { tweens.push({ target, options }); },
            cancel: () => {},
            fling: () => {},
            isActive: () => false,
            reducedMotion: () => false,
        },
    };
    return { dispatch, getState, dispatched, tweens, extra, space: () => space };
};

const withNavigation = (navigation: Record<string, unknown>): PluridConfiguration => ({
    ...defaultConfiguration,
    space: {
        ...defaultConfiguration.space,
        navigation: {
            ...defaultConfiguration.space.navigation,
            ...navigation,
        } as any,
    },
});


describe('cameraCommand()', () => {
    it('tweens through the motion controller when animated, jumps otherwise', () => {
        const store = makeStore();
        cameraCommand({ kind: 'frame', planeID: 'a' }, { animate: true })(store.dispatch, store.getState, store.extra);
        expect(store.tweens).toHaveLength(1);
        expect(store.dispatched.some((action) => action.type === 'space/setCamera')).toBe(false);
        // the framed plane's center is the pivot
        expect(store.tweens[0].target.pivot.x).toBeCloseTo(300, 6);
        expect(store.tweens[0].target.pivot.y).toBeCloseTo(200, 6);

        cameraCommand({ kind: 'frame', planeID: 'a' }, { animate: false })(store.dispatch, store.getState, store.extra);
        expect(store.dispatched.some((action) => action.type === 'space/setCamera')).toBe(true);
        expect(store.space().camera.pivot.x).toBeCloseTo(300, 6);
    });

    it('jumps when no motion controller is registered (no View mounted)', () => {
        const store = makeStore();
        cameraCommand({ kind: 'reset' }, { animate: true })(store.dispatch, store.getState, { motion: undefined });
        expect(store.tweens).toHaveLength(0);
        expect(store.dispatched.some((action) => action.type === 'space/setCamera')).toBe(true);
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
        cameraCommand({ kind: 'delta', delta: { pitch: 5 } }, { animate: false })(configured.dispatch, configured.getState, configured.extra);
        configured.dispatch(actions.setHome(encodeCameraViewpoint(configured.space().camera, view, 2)));
        const runtime = resolveCameraTarget({ kind: 'home' }, configured.getState());
        expect(runtime!.yaw).toBeCloseTo(10, 6);
        expect(runtime!.pitch).toBeCloseTo(5, 6);
    });

    it('presets resolve from the configuration; unknown names do nothing', () => {
        const store = makeStore(withNavigation({ presets: { side: '0,90,0,0,0,1' } }));
        cameraCommand({ kind: 'preset', name: 'side' }, { animate: true })(store.dispatch, store.getState, store.extra);
        expect(store.tweens).toHaveLength(1);
        expect(store.tweens[0].target.yaw).toBeCloseTo(90, 6);
        cameraCommand({ kind: 'preset', name: 'nope' }, { animate: true })(store.dispatch, store.getState, store.extra);
        expect(store.tweens).toHaveLength(1);
    });

    it('bookmarks: save captures the camera (v2), go tweens to it, remove deletes it', () => {
        const store = makeStore();
        store.dispatch(actions.applyCameraDelta({ yaw: 33, pitch: -12, zoom: { factor: 1.5 } }));
        cameraCommand({ kind: 'bookmark', name: 'desk', action: 'save' })(store.dispatch, store.getState, store.extra);
        expect(store.space().bookmarks.desk).toMatch(/^v2\|/);

        store.dispatch(actions.setCamera(cameraEngine.identityCamera(view, store.space().camera.perspective)));
        cameraCommand({ kind: 'bookmark', name: 'desk' }, { animate: true })(store.dispatch, store.getState, store.extra);
        expect(store.tweens).toHaveLength(1);
        expect(store.tweens[0].target.yaw).toBeCloseTo(33, 2);
        expect(store.tweens[0].target.pitch).toBeCloseTo(-12, 2);
        expect(store.tweens[0].target.scale).toBeCloseTo(1.5, 2);

        cameraCommand({ kind: 'bookmark', name: 'desk', action: 'remove' })(store.dispatch, store.getState, store.extra);
        expect(store.space().bookmarks.desk).toBeUndefined();
        cameraCommand({ kind: 'bookmark', name: 'desk' }, { animate: true })(store.dispatch, store.getState, store.extra);
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

describe('the page presentation: framing docks', () => {
    const page: PluridConfiguration = {
        ...defaultConfiguration,
        space: { ...defaultConfiguration.space, presentation: 'page' },
    };
    const sheet = (planeID: string, translateY = 0): TreePlane => ({
        ...plane(planeID, 0),
        width: view.width,
        height: view.height,
        location: { translateX: 0, translateY, translateZ: 0, rotateX: 0, rotateY: 0 },
    });
    const makePageStore = () => {
        const store = makeStore(page);
        store.dispatch(actions.restoreArrangement({ tree: [sheet('p1'), sheet('p2', view.height + 50)], links: [] }));
        return store;
    };

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

    it('a swing that lands docked records its destination; a reveal records none', () => {
        const store = makePageStore();
        store.dispatch(cameraCommand({ kind: 'frame', planeID: 'p2' }));
        store.dispatch(cameraCommand({ kind: 'reveal' }));
        expect(store.tweens).toHaveLength(2);
        expect(store.dispatched.filter((action) => action.type === actions.setDockingPlaneID.type).map((action) => action.payload)).toEqual(['p2', '']);
    });

    it('docking.motion instant: a move that lands docked jumps, the reveal still swings', () => {
        const instant: PluridConfiguration = { ...page, space: { ...page.space, docking: { motion: 'instant', chrome: 'hidden' } } };
        const store = makeStore(instant);
        store.dispatch(actions.restoreArrangement({ tree: [sheet('p1'), sheet('p2', view.height + 50)], links: [] }));
        store.dispatch(cameraCommand({ kind: 'frame', planeID: 'p2' }));
        expect(store.tweens).toHaveLength(0);
        expect(store.space().camera.scale).toBe(1);
        expect(store.space().camera.pivot.y).toBeCloseTo(view.height + 50 + view.height / 2, 6);
        store.dispatch(cameraCommand({ kind: 'dock', planeID: 'p1' }));
        expect(store.tweens).toHaveLength(0);
        store.dispatch(cameraCommand({ kind: 'reveal' }));
        expect(store.tweens).toHaveLength(1);
    });
});

});
// #endregion module
