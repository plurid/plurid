// #region imports
    // #region external
    import {
        rotationZMatrix,
        cameraRotation,
        cameraMatrix,
        transformPoint,
        identityCamera,
        createCamera,
        clampCamera,
        resolveCameraLimits,
        sameCamera,
        applyCameraDelta,
        rollBy,
        setPivot,
        interpolateCamera,
        dockPose,
        revealPose,
        isDocked,
        frameBounds,
        toLegacy,
        fromLegacy,
        DEFAULT_CAMERA_LIMITS,
    } from '../';

    import {
        multiplyMatrices,
    } from '../../mathematics/matrix';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE HORIZON'S TILT. `roll` is the camera's third angle, applied FIRST in camera space
 * (`Rz · Rx · Ry`), so it turns the picture rather than the world. It is 0 in every framing the
 * engine computes — which is what keeps the ordinary space a turntable — and only first person or a
 * host's own delta moves it.
 */
const view = { width: 1000, height: 600 };

const page = (
    rotateX = 0,
    rotateY = 0,
) => ({
    location: { translateX: 0, translateY: 0, translateZ: 0, rotateX, rotateY },
    width: view.width,
    height: view.height,
});


describe('the camera roll', () => {
    it('is a rotation about the view axis, composed before the turntable', () => {
        const rolled = cameraRotation(0, 0, 90);
        const point = transformPoint(rolled, { x: 10, y: 0, z: 0 });
        // 90° about the view axis takes +x to +y (CSS `rotateZ`)
        expect(point.x).toBeCloseTo(0, 9);
        expect(point.y).toBeCloseTo(10, 9);

        // and the composition is exactly Rz · (Rx · Ry)
        expect(cameraRotation(20, 30, 15)).toEqual(
            multiplyMatrices(rotationZMatrix(15), cameraRotation(20, 30)),
        );
        // a caller with no roll gets the turntable it always got
        expect(cameraRotation(20, 30, 0)).toEqual(cameraRotation(20, 30));
    });

    it('turns the picture and not the world: the pivot stays under the view center', () => {
        const camera = identityCamera(view);
        const rolled = { ...camera, roll: 30 };

        const at = (
            state: typeof camera,
        ) => transformPoint(cameraMatrix(state, view), state.pivot);

        const before = at(camera);
        const after = at(rolled);
        expect(after.x).toBeCloseTo(before.x, 9);
        expect(after.y).toBeCloseTo(before.y, 9);
    });

    it('a fresh camera is level, and every comparison knows the angle', () => {
        expect(createCamera().roll).toBe(0);
        expect(identityCamera(view).roll).toBe(0);

        const camera = identityCamera(view);
        expect(sameCamera(camera, { ...camera, roll: 5 })).toBe(false);
        expect(sameCamera(camera, { ...camera, roll: 0 })).toBe(true);
    });

    it('wraps like the yaw, and a rollLimit holds the horizon near level', () => {
        const camera = identityCamera(view);
        expect(clampCamera({ ...camera, roll: 190 }).roll).toBeCloseTo(-170, 9);
        expect(clampCamera({ ...camera, roll: -540 }).roll).toBeCloseTo(180, 9);

        const held = resolveCameraLimits({ rollLimit: 10 });
        expect(clampCamera({ ...camera, roll: 45 }, held).roll).toBe(10);
        expect(clampCamera({ ...camera, roll: -45 }, held).roll).toBe(-10);
        // a space that forbids the tilt outright
        const level = resolveCameraLimits({ rollLimit: 0 });
        expect(clampCamera({ ...camera, roll: 45 }, level).roll).toBe(0);
        // unclamped by default: the horizon may turn all the way round
        expect(DEFAULT_CAMERA_LIMITS.rollLimit).toBeUndefined();
    });

    it('a delta rolls: on its own, inside a look, and as an absolute write', () => {
        const camera = identityCamera(view);

        expect(rollBy(camera, 12).roll).toBe(12);
        expect(rollBy(camera, 0)).toBe(camera);

        expect(applyCameraDelta(camera, { roll: 12 }, view).roll).toBeCloseTo(12, 9);
        expect(applyCameraDelta(camera, { look: { yaw: 0, pitch: 0, roll: 20 } }, view).roll).toBeCloseTo(20, 9);
        expect(applyCameraDelta(camera, { absolute: { roll: -33 } }, view).roll).toBeCloseTo(-33, 9);
        // nothing else in a delta touches it
        expect(applyCameraDelta({ ...camera, roll: 7 }, { yaw: 40, pitch: 10 }, view).roll).toBeCloseTo(7, 9);
    });

    it('re-parameterizing about another pivot is lossless WITH a tilted horizon', () => {
        const camera = { ...identityCamera(view), roll: 35, yaw: 20, pitch: -10, scale: 1.4 };
        const moved = setPivot(camera, { x: 400, y: 120, z: -80 });

        const point = { x: 250, y: 90, z: 40 };
        const before = transformPoint(cameraMatrix(camera, view), point);
        const after = transformPoint(cameraMatrix(moved, view), point);
        expect(after.x).toBeCloseTo(before.x, 6);
        expect(after.y).toBeCloseTo(before.y, 6);
        expect(after.z).toBeCloseTo(before.z, 6);
    });

    it('a tween takes the SHORT way round the horizon', () => {
        const from = { ...identityCamera(view), roll: 170 };
        const to = { ...identityCamera(view), roll: -170 };

        const middle = interpolateCamera(from, to, 0.5, view);
        // 20° the short way, not 340° the long way
        expect(Math.abs(middle.roll)).toBeCloseTo(180, 6);
        expect(interpolateCamera(from, to, 1, view).roll).toBe(-170);
    });

    it('every framing lands level, and a tilted horizon is not a docked page', () => {
        const camera = { ...identityCamera(view), roll: 24 };

        expect(dockPose(camera, page(), view).roll).toBe(0);
        expect(revealPose(dockPose(camera, page(), view)).roll).toBe(0);
        expect(frameBounds(
            camera,
            { min: { x: 0, y: 0, z: 0 }, max: { x: 400, y: 300, z: 0 } },
            view,
        ).roll).toBe(0);

        const docked = dockPose(camera, page(), view);
        expect(isDocked(docked, page(), view)).toBe(true);
        expect(isDocked({ ...docked, roll: 5 }, page(), view)).toBe(false);
        expect(isDocked({ ...docked, roll: 1e-9 }, page(), view)).toBe(true);
    });

    it('the legacy six scalars have no horizon: the mirror is lossy, and reads back level', () => {
        const camera = { ...identityCamera(view), roll: 30, yaw: 15 };
        const legacy = toLegacy(camera, view);
        expect(legacy.rotationX).toBe(camera.pitch);
        expect(legacy.rotationY).toBe(camera.yaw);

        expect(fromLegacy(legacy, view).roll).toBe(0);
        // the round trip is exact for a LEVEL camera, which is every camera the engine frames
        const level = { ...identityCamera(view), yaw: 15, pitch: -20 };
        const back = fromLegacy(toLegacy(level, view), view);
        expect(back.roll).toBe(0);
        expect(back.yaw).toBeCloseTo(level.yaw, 9);
    });
});
// #endregion module
