// #region imports
    // #region external
    import {
        identityCamera,
        applyCameraDelta,
        cameraRotation,
        dockPose,
        project,
        transformDirection,
        rotationAngles,
        poseOnPlane,
        cameraFromPose,
        samePose,
        pickPlanePoint,
        DEFAULT_CAMERA_LIMITS,
    } from '../';
    import type {
        PlaneGeometry,
    } from '../';
    import type {
        CameraState,
    } from '../types';
    // #endregion external
// #endregion imports



// #region module
const view = { width: 1280, height: 800 };

const sheet = (
    location: Partial<PlaneGeometry['location']> = {},
    width = 640,
    height = 480,
): PlaneGeometry => ({
    location: { translateX: 0, translateY: 0, translateZ: 0, rotateX: 0, rotateY: 0, ...location },
    width,
    height,
});

/** The plane's own points (its corners, its centre, a point off its middle) as `camera` draws them. */
const picture = (
    camera: CameraState,
    plane: PlaneGeometry,
) => [
    { x: 0, y: 0 },
    { x: plane.width, y: 0 },
    { x: plane.width, y: plane.height },
    { x: 0, y: plane.height },
    { x: plane.width / 2, y: plane.height / 2 },
    { x: plane.width * 0.3, y: plane.height * 0.7 },
].map((local) => {
    const along = transformDirection(cameraRotation(plane.location.rotateX, plane.location.rotateY), { x: local.x, y: local.y, z: 0 });
    const projected = project(camera, view, {
        x: plane.location.translateX + along.x,
        y: plane.location.translateY + along.y,
        z: plane.location.translateZ + along.z,
    });
    return { x: projected.x, y: projected.y };
});

const expectSamePicture = (
    a: { x: number; y: number }[],
    b: { x: number; y: number }[],
    tolerance = 1e-6,
) => {
    expect(a).toHaveLength(b.length);
    a.forEach((point, index) => {
        expect(Math.abs(point.x - b[index].x)).toBeLessThan(tolerance);
        expect(Math.abs(point.y - b[index].y)).toBeLessThan(tolerance);
    });
};

/** A camera looking at `plane` from somewhere off its axis: turned, tilted, zoomed and panned. */
const lookingAt = (
    plane: PlaneGeometry,
): CameraState => applyCameraDelta(
    dockPose(identityCamera(view), plane, view),
    { yaw: 23, pitch: -14, zoom: { factor: 0.8, anchor: { x: 500, y: 330 } }, pan: { x: 60, y: -25 } },
    view,
);


describe('the camera in a plane\'s frame', () => {
    it('reads the angles of every rotation the camera composes', () => {
        for (const [pitch, yaw, roll] of [
            [0, 0, 0],
            [-30, 45, 0],
            [60, -170, 12],
            [-88, 179, -45],
            [12.5, -90.1, 179],
        ]) {
            const angles = rotationAngles(cameraRotation(pitch, yaw, roll));
            expect(angles.pitch).toBeCloseTo(pitch, 9);
            expect(angles.yaw).toBeCloseTo(yaw, 9);
            expect(angles.roll).toBeCloseTo(roll, 9);
        }
    });

    it('at a pitch of 90° gives the turn to the yaw, with a level horizon', () => {
        const angles = rotationAngles(cameraRotation(90, 30, 0));
        expect(angles.pitch).toBeCloseTo(90, 6);
        expect(angles.roll).toBe(0);
        // the same rotation, read back
        const again = cameraRotation(angles.pitch, angles.yaw, angles.roll);
        cameraRotation(90, 30, 0).forEach((entry, index) => expect(again[index]).toBeCloseTo(entry, 6));
    });

    it('a pose read back on the same plane draws the same picture', () => {
        const plane = sheet({ translateX: 120, translateY: -40 });
        const camera = lookingAt(plane);
        const pose = poseOnPlane(camera, plane, view);
        expectSamePicture(picture(cameraFromPose(pose, plane, camera), plane), picture(camera, plane));
    });

    it('THE STOP FOLLOWS ITS PLANE: moved, turned and tilted, the plane is drawn exactly as before', () => {
        const before = sheet({ translateX: 120, translateY: -40 });
        const camera = lookingAt(before);
        const pose = poseOnPlane(camera, before, view);

        for (const after of [
            sheet({ translateX: 2200, translateY: 640, translateZ: -300 }),
            sheet({ translateX: 800, rotateY: 90.1 }),
            sheet({ translateX: -500, translateY: 200, rotateY: -135 }),
            sheet({ translateY: 900, rotateX: 30, rotateY: 45 }),
        ]) {
            expectSamePicture(picture(cameraFromPose(pose, after, camera), after), picture(camera, before));
        }
    });

    it('pivots on the point under the view centre: the pose reads as a point of the plane, its pan nothing', () => {
        const plane = sheet({ translateX: 40, translateY: 20, rotateY: 30 });
        const camera = lookingAt(plane);
        const pose = poseOnPlane(camera, plane, view);
        const pick = pickPlanePoint(camera, view, plane, { x: view.width / 2, y: view.height / 2 })!;

        expect(pose.pivot.x).toBeCloseTo(pick.local.x, 6);
        expect(pose.pivot.y).toBeCloseTo(pick.local.y, 6);
        expect(pose.pivot.z).toBe(0);
        expect(pose.offset).toEqual({ x: 0, y: 0, z: expect.any(Number) });
        expect(Object.is(pose.offset!.x, -0)).toBe(false);
    });

    it('the dock pose of a turned page is the face-on pose, centred, at its fill scale', () => {
        const plane = sheet({ translateX: 300, rotateY: 90.1 }, view.width, view.height);
        const docked = dockPose(identityCamera(view), plane, view);
        const pose = poseOnPlane(docked, plane, view);

        expect(pose.yaw).toBeCloseTo(0, 9);
        expect(pose.pitch).toBeCloseTo(0, 9);
        expect(pose.roll).toBeCloseTo(0, 9);
        expect(pose.scale).toBe(1);
        expect(pose.pivot.x).toBeCloseTo(view.width / 2, 6);
        expect(pose.pivot.y).toBeCloseTo(view.height / 2, 6);
        expect(pose.offset!.z).toBeCloseTo(0, 6);
    });

    it('a plane seen edge-on has no point under the centre: the camera\'s own pivot is taken in, exactly', () => {
        const plane = sheet({ rotateY: 90 });
        const camera = identityCamera(view);
        expect(pickPlanePoint(camera, view, plane, { x: view.width / 2, y: view.height / 2 })).toBeNull();

        const pose = poseOnPlane(camera, plane, view);
        const moved = sheet({ translateX: 400, rotateY: 90 });
        // the plane is a line in this picture; the camera itself is what must come back
        const back = cameraFromPose(pose, plane, camera);
        expect(back.yaw).toBeCloseTo(camera.yaw, 9);
        expect(back.scale).toBe(camera.scale);
        expect(back.pivot.x).toBeCloseTo(camera.pivot.x, 6);
        expect(back.pivot.y).toBeCloseTo(camera.pivot.y, 6);
        // moved along x, the pivot moves with it, and the camera faces it as before
        const followed = cameraFromPose(pose, moved, camera);
        expect(followed.pivot.x).toBeCloseTo(camera.pivot.x + 400, 6);
        expect(followed.yaw).toBeCloseTo(camera.yaw, 9);
    });

    it('reaches a pose on a page tilted past the orbit\'s limit face-on, as a dock does', () => {
        const plane = sheet({ rotateX: -90 });
        const camera = cameraFromPose({ yaw: 0, pitch: 0, scale: 1, pivot: { x: 320, y: 240, z: 0 } }, plane, identityCamera(view), DEFAULT_CAMERA_LIMITS);
        expect(camera.pitch).toBeCloseTo(90, 6);
        expect(DEFAULT_CAMERA_LIMITS.pitchLimit).toBeLessThan(90);
    });

    it('keeps the perspective and gates what is not finite', () => {
        const camera = { ...identityCamera(view), perspective: 1600 };
        const pose = poseOnPlane(camera, sheet(), view);
        expect(cameraFromPose(pose, sheet({ translateX: 10 }), camera).perspective).toBe(1600);
        const broken = cameraFromPose({ ...pose, scale: Number.NaN }, sheet(), camera);
        expect(broken.scale).toBe(camera.scale);
    });

    it('two poses of one picture are the same pose; a nudge is not', () => {
        const plane = sheet();
        const camera = lookingAt(plane);
        const pose = poseOnPlane(camera, plane, view);
        expect(samePose(pose, poseOnPlane(camera, plane, view))).toBe(true);
        expect(samePose(pose, { ...pose, yaw: pose.yaw + 0.5 })).toBe(false);
        expect(samePose(pose, { ...pose, pivot: { ...pose.pivot, x: pose.pivot.x + 4 } })).toBe(false);
        // what a pose leaves out is its default
        const level = { yaw: 10, pitch: 0, scale: 1, pivot: { x: 1, y: 2, z: 0 } };
        expect(samePose(level, { ...level, roll: 0, offset: { x: 0, y: 0, z: 0 } })).toBe(true);
        expect(samePose(level, { ...level, offset: { x: 0, y: 0, z: 30 } })).toBe(false);
    });
});
// #endregion module
