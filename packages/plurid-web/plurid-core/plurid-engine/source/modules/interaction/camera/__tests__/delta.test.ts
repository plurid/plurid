// #region imports
    // #region external
    import {
        cameraMatrix,
        createCamera,
        setPivot,
        zoomAt,
        panBy,
        lookBy,
        flyBy,
        applyCameraDelta,
        project,
        unprojectAtCameraZ,
        eyeWorld,
        normalizeYaw,
        clampCamera,
        DEFAULT_CAMERA_LIMITS,
    } from '../';
    // #endregion external
// #endregion imports



// #region module
const view = { width: 1200, height: 800 };

const oblique = () => createCamera(2000, {
    yaw: 37,
    pitch: -25,
    scale: 1.3,
    pivot: { x: 220, y: 140, z: -60 },
    offset: { x: 35, y: -20, z: 300 },
});


describe('camera deltas', () => {
    it('setPivot() leaves the rendered matrix unchanged', () => {
        const camera = oblique();
        const before = cameraMatrix(camera, view);
        const after = cameraMatrix(setPivot(camera, { x: -300, y: 900, z: 120 }), view);
        before.forEach((value, index) => {
            expect(after[index]).toBeCloseTo(value, 8);
        });
    });

    it('setPivot() keeps the pivot fixed on screen across an orbit', () => {
        const camera = setPivot(oblique(), { x: 10, y: 20, z: 30 });
        const before = project(camera, view, camera.pivot);
        const orbited = applyCameraDelta(camera, { yaw: 50, pitch: 20 }, view);
        const after = project(orbited, view, orbited.pivot);
        expect(after.x).toBeCloseTo(before.x, 8);
        expect(after.y).toBeCloseTo(before.y, 8);
    });

    it('zoomAt() keeps the world point under the anchor fixed at any orientation', () => {
        const camera = oblique();
        const anchor = { x: 900, y: 150 };
        const world = unprojectAtCameraZ(camera, view, anchor, camera.offset.z);

        for (const factor of [1.5, 0.4, 1.01]) {
            const zoomed = zoomAt(camera, anchor, factor, view);
            expect(zoomed.scale).toBeCloseTo(camera.scale * factor, 9);
            const projected = project(zoomed, view, world);
            expect(projected.x).toBeCloseTo(anchor.x, 6);
            expect(projected.y).toBeCloseTo(anchor.y, 6);
        }
    });

    it('zoomAt() clamps to the zoom limits and re-anchors for the applied factor', () => {
        const camera = createCamera(2000, { scale: 3.9 });
        const anchor = { x: 100, y: 100 };
        const world = unprojectAtCameraZ(camera, view, anchor, 0);
        const zoomed = zoomAt(camera, anchor, 2, view);
        expect(zoomed.scale).toBe(DEFAULT_CAMERA_LIMITS.zoomMax);
        const projected = project(zoomed, view, world);
        expect(projected.x).toBeCloseTo(anchor.x, 6);
        expect(projected.y).toBeCloseTo(anchor.y, 6);
        expect(zoomAt(zoomed, anchor, 1.5, view)).toBe(zoomed);
    });

    it('panBy() moves the pivot-depth plane by exactly the screen delta at any orientation', () => {
        const camera = oblique();
        const point = unprojectAtCameraZ(camera, view, { x: 500, y: 300 }, camera.offset.z);
        const before = project(camera, view, point);
        const panned = panBy(camera, { x: 100, y: -40 });
        const after = project(panned, view, point);
        expect(after.x - before.x).toBeCloseTo(100, 6);
        expect(after.y - before.y).toBeCloseTo(-40, 6);
    });

    it('lookBy() rotates about the eye and restores the pivot', () => {
        const camera = oblique();
        const eye = eyeWorld(camera, view);
        const looked = lookBy(camera, 25, -10, view);
        const eyeAfter = eyeWorld(looked, view);
        expect(eyeAfter.x).toBeCloseTo(eye.x, 5);
        expect(eyeAfter.y).toBeCloseTo(eye.y, 5);
        expect(eyeAfter.z).toBeCloseTo(eye.z, 5);
        expect(looked.pivot).toEqual(camera.pivot);
        expect(looked.yaw).toBeCloseTo(camera.yaw + 25, 9);
        expect(looked.pitch).toBeCloseTo(camera.pitch - 10, 9);
    });

    it('flyBy() moves the eye along the camera axes, honoring pitch', () => {
        const camera = createCamera(2000, { pitch: -45 });
        const eye = eyeWorld(camera, view);
        const flown = flyBy(camera, 100, 0, 0);
        const eyeAfter = eyeWorld(flown, view);
        const dz = eyeAfter.z - eye.z;
        const dy = eyeAfter.y - eye.y;
        // moved 100 world px toward the view axis: the camera is pitched, so both y and z change
        expect(Math.hypot(dy, dz)).toBeCloseTo(100, 6);
        expect(Math.abs(dy)).toBeGreaterThan(1);
        expect(eyeAfter.x).toBeCloseTo(eye.x, 6);
    });

    it('applyCameraDelta() returns the same reference for an empty delta and clamps the result', () => {
        const camera = oblique();
        expect(applyCameraDelta(camera, {}, view)).toBe(camera);
        const flipped = applyCameraDelta(camera, { pitch: 500, yaw: 400 }, view);
        expect(flipped.pitch).toBe(DEFAULT_CAMERA_LIMITS.pitchLimit);
        expect(flipped.yaw).toBeCloseTo(normalizeYaw(37 + 400), 9);
    });

    it('normalizeYaw() wraps to (-180, 180]', () => {
        expect(normalizeYaw(181)).toBe(-179);
        expect(normalizeYaw(-181)).toBe(179);
        expect(normalizeYaw(180)).toBe(180);
        expect(normalizeYaw(-180)).toBe(180);
        expect(normalizeYaw(730)).toBeCloseTo(10, 9);
        expect(normalizeYaw(0)).toBe(0);
        expect(Object.is(normalizeYaw(-360), 0)).toBe(true);
    });

    it('clampCamera() returns the same reference when nothing changes', () => {
        const camera = oblique();
        expect(clampCamera(camera)).toBe(camera);
    });
});
// #endregion module
