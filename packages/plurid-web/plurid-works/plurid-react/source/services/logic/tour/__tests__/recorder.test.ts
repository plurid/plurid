// #region imports
    // #region libraries
    import {
        interaction,
    } from '@plurid/plurid-engine';

    import type {
        CameraState,
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        actions,
    } from '~services/state/modules/space';
    import {
        cameraCommand,
    } from '~services/logic/camera';

    import {
        TEST_VIEW as view,
        treePlane,
        configurationWith,
    } from '../../../../testing/fixtures';
    import {
        makeSpaceStore,
    } from '../../../../testing/store';
    import type {
        HeadlessStore,
    } from '../../../../testing/store';
    // #endregion external


    // #region internal
    import {
        createTourPlayer,
        createTourRecorder,
    } from '../player';
    // #endregion internal
// #endregion imports



// #region module
const {
    camera: cameraEngine,
} = interaction;

const bootedStore = (): HeadlessStore => {
    const store = makeSpaceStore(configurationWith({}), [
        treePlane('a'),
        treePlane('b', { location: { translateX: 600 } }),
    ]);
    store.dispatch(actions.setSpaceField({ field: 'resolvedLayout', value: true } as any));
    store.dispatch(actions.setSpaceLoading(false));
    return store;
};

/** What `camera` draws of the plane's own corners and centre. */
const picture = (
    camera: CameraState,
    plane: TreePlane,
) => [
    { x: 0, y: 0 },
    { x: plane.width, y: plane.height },
    { x: plane.width / 2, y: plane.height / 2 },
].map((local) => {
    const along = cameraEngine.transformDirection(cameraEngine.cameraRotation(plane.location.rotateX, plane.location.rotateY), { x: local.x, y: local.y, z: 0 });
    const drawn = cameraEngine.project(camera, view, {
        x: plane.location.translateX + along.x,
        y: plane.location.translateY + along.y,
        z: plane.location.translateZ + along.z,
    });
    return [drawn.x, drawn.y];
});

const planeB = (
    store: HeadlessStore,
) => store.tree().find((plane) => plane.planeID === 'b')!;

/** Long enough for the rest's frames to pass (a frame is 16 ms without `requestAnimationFrame`). */
const rest = () => jest.advanceTimersByTimeAsync(16 * 6);


describe('the tour recorder', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });
    afterEach(() => {
        jest.useRealTimers();
    });

    it('captures a stop each time the camera comes to rest somewhere new, and nothing for a rest where the last one is', async () => {
        const store = bootedStore();
        const captured: string[] = [];
        const recorder = createTourRecorder(store, () => false, {
            dwell: 3000,
            onCapture: (step, steps) => captured.push(step.id + '/' + steps.length),
        });

        store.dispatch(cameraCommand({ kind: 'frame', planeID: 'b' }, { animate: false }) as any);
        await rest();
        expect(recorder.steps()).toEqual([{ id: 'stop-1', anchor: { path: '/b', pose: 'frame' }, dwell: 3000 }]);

        // a nudge there and back: the same stop
        store.dispatch(actions.applyCameraDelta({ yaw: 5 }));
        store.dispatch(actions.applyCameraDelta({ yaw: -5 }));
        await rest();
        expect(recorder.steps()).toHaveLength(1);

        store.dispatch(actions.applyCameraDelta({ yaw: 20, pitch: -6 }));
        await rest();
        expect(recorder.steps()).toHaveLength(2);
        expect(recorder.steps()[1].anchor.path).toBe('/b');
        expect(typeof recorder.steps()[1].anchor.pose).toBe('object');
        expect(captured).toEqual(['stop-1/1', 'stop-2/2']);
        recorder.stop();
    });

    it('waits for a moving camera to rest: a stream of moves is one stop', async () => {
        const store = bootedStore();
        const recorder = createTourRecorder(store, () => false);
        for (let frame = 0; frame < 15; frame += 1) {
            store.dispatch(actions.applyCameraDelta({ yaw: 2 }));
            await jest.advanceTimersByTimeAsync(16);
        }
        expect(recorder.steps()).toHaveLength(0);
        await rest();
        expect(recorder.steps()).toHaveLength(1);
        recorder.stop();
    });

    it('records nothing while a tour plays, takes a stop by hand, and gives the tour back when it stops', async () => {
        const store = bootedStore();
        let playing = true;
        const recorder = createTourRecorder(store, () => playing);
        store.dispatch(actions.applyCameraDelta({ yaw: 15 }));
        await rest();
        expect(recorder.steps()).toHaveLength(0);

        playing = false;
        const first = recorder.capture();
        expect(first?.id).toBe('stop-1');
        expect(recorder.capture()).toBeUndefined();

        const tour = recorder.stop();
        expect(tour).toEqual({ plurid: 'plurid/tour', version: 1, steps: [first] });
        store.dispatch(actions.applyCameraDelta({ yaw: 40 }));
        await rest();
        expect(recorder.steps()).toHaveLength(1);
        // a stopped recorder captures nothing more, by hand either
        expect(recorder.capture()).toBeUndefined();
        expect(recorder.steps()).toHaveLength(1);
        // a recorder with nothing to look at captures nothing
        const empty = makeSpaceStore(configurationWith({}), []);
        expect(createTourRecorder(empty, () => false).capture()).toBeUndefined();
    });

    it('disposing the player stops its recorders: the space they listened to is gone', async () => {
        const store = bootedStore();
        const player = createTourPlayer({ getState: store.getState, dispatch: store.dispatch, subscribe: store.subscribe, extra: store.extra });
        const recorder = player.record();
        store.dispatch(actions.applyCameraDelta({ yaw: 12 }));
        await rest();
        expect(recorder.steps()).toHaveLength(1);
        player.dispose();
        store.dispatch(actions.applyCameraDelta({ yaw: 30 }));
        await rest();
        expect(recorder.steps()).toHaveLength(1);
        expect(recorder.capture()).toBeUndefined();
        expect(recorder.stop().steps).toHaveLength(1);
    });

    it('THE ROUND TRIP: a recorded tour, played after a relayout, draws each stop\'s plane as it was recorded', async () => {
        const store = bootedStore();
        const recorder = createTourRecorder(store, () => false);
        store.dispatch(cameraCommand({ kind: 'frame', planeID: 'b' }, { animate: false }) as any);
        store.dispatch(actions.applyCameraDelta({ yaw: 18, pitch: -9, zoom: { factor: 1.25, anchor: { x: 540, y: 280 } } }));
        await rest();
        const recorded = picture(store.space().camera, planeB(store));
        const tour = recorder.stop();
        expect(tour.steps).toHaveLength(1);

        store.dispatch(actions.restoreArrangement({
            tree: [treePlane('a'), treePlane('b', { location: { translateX: 2400, translateY: -300, rotateY: -90.1 } })],
            links: [],
        }));
        store.dispatch(cameraCommand({ kind: 'reset' }, { animate: false }) as any);

        const player = createTourPlayer({ getState: store.getState, dispatch: store.dispatch, subscribe: store.subscribe, extra: store.extra });
        void player.play(tour);
        expect(player.state().status).toBe('dwelling');
        picture(store.space().camera, planeB(store)).forEach(([x, y], index) => {
            expect(x).toBeCloseTo(recorded[index][0], 3);
            expect(y).toBeCloseTo(recorded[index][1], 3);
        });
        player.stop();
    });
});
// #endregion module
