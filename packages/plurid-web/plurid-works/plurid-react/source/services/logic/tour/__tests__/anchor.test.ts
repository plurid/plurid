// #region imports
    // #region libraries
    import {
        interaction,
    } from '@plurid/plurid-engine';

    import type {
        CameraState,
        TreePlane,
        PluridAnchorPose,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        actions,
    } from '~services/state/modules/space';
    import {
        cameraCommand,
        reportPlaneSizes,
        frameTargetForPlane,
        sameCamera,
    } from '~services/logic/camera';

    import {
        TEST_VIEW as view,
        treePlane,
        viewSizedSheet,
        configurationWith,
        pageConfiguration,
    } from '../../../../testing/fixtures';
    import {
        makeSpaceStore,
        motionStub,
    } from '../../../../testing/store';
    // #endregion external


    // #region internal
    import {
        anchorOf,
        resolveAnchor,
        sameAnchor,
    } from '../anchor';
    import {
        planesAtPath,
        anchorPath,
    } from '../path';
    // #endregion internal
// #endregion imports



// #region module
const {
    camera: cameraEngine,
} = interaction;

/** A plane's own points (its corners and two inside) as `camera` draws them. */
const picture = (
    camera: CameraState,
    plane: TreePlane,
) => [
    { x: 0, y: 0 },
    { x: plane.width, y: 0 },
    { x: plane.width, y: plane.height },
    { x: plane.width / 2, y: plane.height / 3 },
    { x: plane.width * 0.2, y: plane.height * 0.8 },
].map((local) => {
    const along = cameraEngine.transformDirection(cameraEngine.cameraRotation(plane.location.rotateX, plane.location.rotateY), { x: local.x, y: local.y, z: 0 });
    const drawn = cameraEngine.project(camera, view, {
        x: plane.location.translateX + along.x,
        y: plane.location.translateY + along.y,
        z: plane.location.translateZ + along.z,
    });
    return [drawn.x, drawn.y];
});

const expectSamePicture = (
    a: number[][],
    b: number[][],
) => {
    a.forEach(([x, y], index) => {
        expect(x).toBeCloseTo(b[index][0], 3);
        expect(y).toBeCloseTo(b[index][1], 3);
    });
};

const twoRoots = () => [
    treePlane('a'),
    treePlane('b', { location: { translateX: 600 } }),
];

const planeOf = (
    tree: TreePlane[],
    planeID: string,
): TreePlane => {
    const found = [...tree, ...tree.flatMap((plane) => plane.children ?? [])].find((plane) => plane.planeID === planeID);
    if (!found) {
        throw new Error('no plane ' + planeID);
    }
    return found;
};


describe('anchors: a camera named by a plane', () => {
    it('names a docked page `dock`, a framed plane `frame`, and any other camera by its pose on the plane', () => {
        const pages = makeSpaceStore(pageConfiguration(), [
            viewSizedSheet('p1'),
            viewSizedSheet('p2', { location: { translateX: view.width + 200 } }),
        ]);
        expect(anchorOf(pages.getState())).toEqual({ path: '/p1', pose: 'dock' });

        const space = makeSpaceStore(configurationWith({}), twoRoots());
        space.dispatch(cameraCommand({ kind: 'frame', planeID: 'b' }, { animate: false }) as any);
        expect(anchorOf(space.getState())).toEqual({ path: '/b', pose: 'frame' });

        space.dispatch(actions.applyCameraDelta({ yaw: 20, pitch: -10 }));
        const turned = anchorOf(space.getState());
        expect(turned?.path).toBe('/b');
        expect(typeof turned?.pose).toBe('object');
        // the pose is legible: six decimals, the pivot on the plane, no pan
        const pose = turned!.pose as PluridAnchorPose;
        expect(pose.pivot.z).toBe(0);
        expect(pose.offset).toEqual({ x: 0, y: 0, z: expect.any(Number) });
        expect(String(pose.yaw).split('.')[1]?.length ?? 0).toBeLessThanOrEqual(6);
    });

    it('THE ROUND TRIP: a stop recorded on a plane draws that plane the same after the plane moves and turns', () => {
        const store = makeSpaceStore(configurationWith({}), twoRoots());
        store.dispatch(cameraCommand({ kind: 'frame', planeID: 'b' }, { animate: false }) as any);
        store.dispatch(actions.applyCameraDelta({ yaw: 25, pitch: -12, zoom: { factor: 1.3, anchor: { x: 620, y: 260 } }, pan: { x: -40, y: 18 } }));
        const recorded = picture(store.space().camera, planeOf(store.tree(), 'b'));
        const anchor = anchorOf(store.getState())!;
        expect(typeof anchor.pose).toBe('object');

        // a relayout puts the plane somewhere else entirely, turned like a spawned child
        const moved = [
            treePlane('a'),
            treePlane('b', { location: { translateX: 1800, translateY: 400, translateZ: -250, rotateY: 90.1 } }),
        ];
        store.dispatch(actions.restoreArrangement({ tree: moved, links: [] }));
        const resolution = resolveAnchor(store.getState(), anchor);
        expect(resolution.ok).toBe(true);
        if (!resolution.ok) {
            return;
        }
        expect(resolution.planeID).toBe('b');
        expectSamePicture(picture(resolution.camera, planeOf(store.tree(), 'b')), recorded);
        // the camera itself had to move: the world picture is not what was recorded
        expect(Math.abs(resolution.camera.yaw - store.space().camera.yaw)).toBeGreaterThan(45);
    });

    it('tells two planes at one path apart by their occurrence, in tree order', () => {
        const tree = [
            treePlane('first', { route: '/doc' }),
            treePlane('second', { route: '/doc', location: { translateX: 600 } }),
        ];
        const store = makeSpaceStore(configurationWith({}), tree);
        expect(planesAtPath(store.tree(), '/doc').map((entry) => entry.plane.planeID)).toEqual(['first', 'second']);
        expect(anchorOf(store.getState(), { planeID: 'second' })).toMatchObject({ path: '/doc', occurrence: 1 });
        expect(anchorOf(store.getState(), { planeID: 'first' })).not.toHaveProperty('occurrence');

        const second = resolveAnchor(store.getState(), { path: '/doc', occurrence: 1 });
        expect(second.ok && second.planeID).toBe('second');
        expect(resolveAnchor(store.getState(), { path: '/doc', occurrence: 2 })).toEqual({ ok: false, reason: 'absent' });
    });

    it('answers absent, and hidden for a closed plane and for a plane hanging from one', () => {
        const child = treePlane('child', { route: '/child', parentPlaneID: 'parent', location: { translateX: 400, rotateY: 90.1 } });
        const store = makeSpaceStore(configurationWith({}), [
            treePlane('parent', { route: '/parent', show: false, children: [child] }),
            treePlane('open', { route: '/open', location: { translateX: 900 } }),
        ]);
        expect(resolveAnchor(store.getState(), { path: '/nowhere' })).toEqual({ ok: false, reason: 'absent' });
        expect(resolveAnchor(store.getState(), { path: '/parent' })).toEqual({ ok: false, reason: 'hidden', planeID: 'parent' });
        expect(resolveAnchor(store.getState(), { path: '/child' })).toEqual({ ok: false, reason: 'hidden', planeID: 'child' });
        expect(resolveAnchor(store.getState(), { path: '/open' }).ok).toBe(true);
        expect(resolveAnchor(store.getState(), {} as any)).toEqual({ ok: false, reason: 'absent' });
    });

    it('reads a full plane address as its path; a malformed pose frames the plane, with one warning', () => {
        expect(anchorPath('plurid://localhost:5273/files/report?page=2')).toBe('/files/report?page=2');
        const store = makeSpaceStore(configurationWith({}), twoRoots());
        expect(resolveAnchor(store.getState(), { path: 'plurid://localhost/b' }).ok).toBe(true);

        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const framed = resolveAnchor(store.getState(), { path: '/b', pose: { yaw: 'left' } as any });
        const frame = resolveAnchor(store.getState(), { path: '/b', pose: 'frame' });
        expect(framed).toEqual(frame);
        expect(warn).toHaveBeenCalledTimes(1);
        warn.mockRestore();
    });

    it('a dock pose and a frame follow a resize: they are the framing of the plane at its new size', () => {
        const store = makeSpaceStore(configurationWith({}), twoRoots());
        const before = resolveAnchor(store.getState(), { path: '/b', pose: 'frame' });
        store.dispatch(actions.setPlaneSizes([{ planeID: 'b', width: 1600, height: 1200 }]));
        const resized = planeOf(store.tree(), 'b');
        const frame = resolveAnchor(store.getState(), { path: '/b', pose: 'frame' });
        const dock = resolveAnchor(store.getState(), { path: '/b', pose: 'dock' });
        expect(before.ok && frame.ok && dock.ok).toBe(true);
        if (!before.ok || !frame.ok || !dock.ok) {
            return;
        }
        // exactly the engine's own framing of the plane as it is now, not of the plane as it was
        expect(sameCamera(frame.camera, frameTargetForPlane(store.space(), store.getState().configuration, resized))).toBe(true);
        expect(sameCamera(frame.camera, before.camera)).toBe(false);
        expect(dock.camera.scale).toBeCloseTo(Math.min(view.width / 1600, view.height / 1200), 9);
        // and it frames the whole plane: every corner inside the view
        for (const [x, y] of picture(frame.camera, resized).slice(0, 3)) {
            expect(x).toBeGreaterThanOrEqual(-0.5);
            expect(x).toBeLessThanOrEqual(view.width + 0.5);
            expect(y).toBeGreaterThanOrEqual(-0.5);
            expect(y).toBeLessThanOrEqual(view.height + 0.5);
        }
    });

    it('AN EXPLICIT POSE IS ABSOLUTE: after a resize it shows the same point of the plane at the same zoom', () => {
        const store = makeSpaceStore(configurationWith({}), twoRoots());
        const pose = { yaw: 12, pitch: -6, scale: 1.4, pivot: { x: 120, y: 90, z: 0 } };
        const before = resolveAnchor(store.getState(), { path: '/b', pose });
        store.dispatch(actions.setPlaneSizes([{ planeID: 'b', width: 1600, height: 1200 }]));
        const after = resolveAnchor(store.getState(), { path: '/b', pose });
        expect(before.ok && after.ok).toBe(true);
        if (before.ok && after.ok) {
            // the plane grew from its top-left corner: the pose's point and zoom are where they were
            expect(sameCamera(after.camera, before.camera)).toBe(true);
            expect(after.camera.scale).toBe(1.4);
        }
    });

    it('A PIVOT WRITTEN WITHOUT Z LIES ON THE PLANE, as a tour file reads it', () => {
        const store = makeSpaceStore(configurationWith({}), twoRoots());
        const pose = { yaw: 10, pitch: -5, scale: 1.2, pivot: { x: 100, y: 50, z: 0 } };
        const withZ = resolveAnchor(store.getState(), { path: '/b', pose });
        const withoutZ = resolveAnchor(store.getState(), { path: '/b', pose: { ...pose, pivot: { x: 100, y: 50 } } as any });
        expect(withZ.ok && withoutZ.ok).toBe(true);
        if (withZ.ok && withoutZ.ok) {
            expect(withoutZ.camera.pivot).toEqual(withZ.camera.pivot);
            expect(withoutZ.camera.pivot.x).toBeCloseTo(600 + 100 * Math.cos(0), 6);
        }
        // a z that is not a number is no pose: the plane is framed
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const broken = resolveAnchor(store.getState(), { path: '/b', pose: { ...pose, pivot: { x: 100, y: 50, z: 'deep' } } as any });
        expect(broken).toEqual(resolveAnchor(store.getState(), { path: '/b', pose: 'frame' }));
        warn.mockRestore();
    });

    it('an occurrence counts closed planes too: a closed first plane answers hidden though a later one is shown', () => {
        const store = makeSpaceStore(configurationWith({}), [
            treePlane('closed', { route: '/doc', show: false }),
            treePlane('open', { route: '/doc', location: { translateX: 600 } }),
        ]);
        expect(resolveAnchor(store.getState(), { path: '/doc' })).toEqual({ ok: false, reason: 'hidden', planeID: 'closed' });
        const second = resolveAnchor(store.getState(), { path: '/doc', occurrence: 1 });
        expect(second.ok && second.planeID).toBe('open');
        // depth first: a root, what hangs from it, then the next root
        const nested = makeSpaceStore(configurationWith({}), [
            treePlane('root-1', { route: '/r1', children: [treePlane('child', { route: '/doc', parentPlaneID: 'root-1' })] }),
            treePlane('root-2', { route: '/doc', location: { translateX: 600 } }),
        ]);
        expect(planesAtPath(nested.tree(), '/doc').map((entry) => entry.plane.planeID)).toEqual(['child', 'root-2']);
    });

    it('compares two anchors by the picture: one plane, poses that draw it alike', () => {
        const pose = { yaw: 10, pitch: 0, scale: 1, pivot: { x: 1, y: 2, z: 0 } };
        expect(sameAnchor({ path: '/a', pose }, { path: '/a', pose: { ...pose, yaw: 10.0001 } })).toBe(true);
        expect(sameAnchor({ path: '/a', pose }, { path: '/a', occurrence: 1, pose })).toBe(false);
        expect(sameAnchor({ path: '/a' }, { path: '/a', pose: 'frame' })).toBe(true);
        expect(sameAnchor({ path: '/a', pose: 'dock' }, { path: '/a', pose })).toBe(false);
    });
});


describe('the `anchor` camera command', () => {
    it('travels as an EXCLUSIVE tween through the motion controller, and drops a re-frame still pending', () => {
        const store = makeSpaceStore(configurationWith({}), twoRoots());
        const stub = motionStub(store);
        store.extra.pendingFrame = { planeID: 'a', animate: true };
        const told: string[] = [];

        store.dispatch(cameraCommand(
            { kind: 'anchor', anchor: { path: '/b' } },
            { onSettle: () => told.push('arrived'), onInterrupt: () => told.push('interrupted'), duration: 90, easing: 'linear' },
        ) as any);
        expect(stub.tweens).toHaveLength(1);
        expect(stub.tweens[0].options).toMatchObject({ duration: 90, easing: 'linear' });
        expect(typeof stub.tweens[0].options?.onInterrupt).toBe('function');
        expect(store.extra.pendingFrame).toBeUndefined();

        // another caller's tween takes the camera: the anchor's caller is told so
        store.dispatch(cameraCommand({ kind: 'frame', planeID: 'a' }) as any);
        expect(told).toEqual(['interrupted']);
        expect(stub.land()).toBe(true);
        expect(told).toEqual(['interrupted']);
    });

    it('a missing anchor moves nothing and leaves a pending re-frame alone', () => {
        const store = makeSpaceStore(configurationWith({}), twoRoots());
        const stub = motionStub(store);
        store.extra.pendingFrame = { planeID: 'a', animate: true };
        store.dispatch(cameraCommand({ kind: 'anchor', anchor: { path: '/missing' } }) as any);
        expect(stub.tweens).toHaveLength(0);
        expect(store.extra.pendingFrame).toEqual({ planeID: 'a', animate: true });
    });

    it('a measured re-frame CONTINUES the framing it waited on: an exclusive tween keeps its callbacks', () => {
        const store = makeSpaceStore(configurationWith({}), twoRoots());
        const stub = motionStub(store);
        store.extra.pendingFrame = { planeID: 'b', animate: true };
        store.dispatch(reportPlaneSizes([{ planeID: 'b', width: 500, height: 320 }]) as any);
        expect(stub.tweens).toHaveLength(1);
        expect(stub.tweens[0].options?.continues).toBe(true);
    });
});
// #endregion module
