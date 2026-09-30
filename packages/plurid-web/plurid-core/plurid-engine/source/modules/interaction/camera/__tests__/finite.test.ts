// #region imports
    // #region external
    import {
        applyCameraDelta,
        cameraMatrix3d,
        clampCamera,
        createCamera,
        identityCamera,
        interpolateCamera,
        resolveCameraLimits,
        DEFAULT_CAMERA_LIMITS,
        DEFAULT_PERSPECTIVE,
    } from '../';

    import compute from '../../../state/compute';
    // #endregion external
// #endregion imports



// #region module
/**
 * A NaN NEVER ENTERS THE CAMERA (audit 2026-09-29 #4). One bad delta or configuration value made the
 * matrix `matrix3d(NaN…)`, which the browser ignores: the picture froze while culling, docking and
 * hit-tests computed with NaN, and every later valid delta kept it NaN until a fit.
 */
const view = { width: 1200, height: 800 };

const finiteCamera = (
    camera: ReturnType<typeof createCamera>,
): boolean => [
    camera.yaw, camera.pitch, camera.roll, camera.scale, camera.perspective,
    camera.pivot.x, camera.pivot.y, camera.pivot.z,
    camera.offset.x, camera.offset.y, camera.offset.z,
].every((value) => Number.isFinite(value)) && camera.perspective > 0;

const finiteMatrix = (
    matrix: string,
): boolean => !/NaN|Infinity/.test(matrix);


describe('a finite camera', () => {
    it('every delta the audit found keeps the matrix finite', () => {
        const camera = identityCamera(view);
        const deltas: any[] = [
            { pan: { y: 100 } },
            { pivot: { x: 10, y: 10 } },
            { zoom: { factor: 1.5, anchor: { x: 100 } } },
            { absolute: { scale: NaN } },
            { pan: { x: Infinity, y: 0 } },
            { absolute: { offset: { x: Infinity, y: 0, z: 0 } } },
            { absolute: { perspective: -10, yaw: Infinity, pitch: '3' } },
            { yaw: NaN, pitch: Infinity, roll: -Infinity, dolly: NaN },
            { look: { yaw: Infinity, pitch: NaN } },
            { fly: { forward: Infinity, strafe: NaN } },
            { zoom: { factor: NaN } },
        ];
        for (const delta of deltas) {
            const next = applyCameraDelta(camera, delta, view);
            expect(finiteCamera(next)).toBe(true);
            expect(finiteMatrix(cameraMatrix3d(next, view))).toBe(true);
        }
    });

    it('a missing vector part is 0; an anchor\'s is the view center\'s; an absolute part is written alone', () => {
        const camera = identityCamera(view);
        const panned = applyCameraDelta(camera, { pan: { y: 120 } as any }, view);
        expect(panned.offset).toEqual({ x: 0, y: 120, z: 0 });
        const pivoted = applyCameraDelta(camera, { pivot: { x: 10, y: 10 } as any }, view);
        expect(pivoted.pivot).toEqual({ x: 10, y: 10, z: 0 });
        // anchored at x 100 and the view center's y: a zoom about (100, 400)
        const zoomed = applyCameraDelta(camera, { zoom: { factor: 2, anchor: { x: 100 } as any } }, view);
        const centered = applyCameraDelta(camera, { zoom: { factor: 2, anchor: { x: 100, y: 400 } } }, view);
        expect(zoomed).toEqual(centered);
        const written = applyCameraDelta(camera, { absolute: { offset: { x: 5 } as any, scale: NaN } }, view);
        expect(written.offset).toEqual({ x: 5, y: 0, z: 0 });
        expect(written.scale).toBe(1);
        expect(applyCameraDelta(camera, null as any, view)).toBe(camera);
    });

    it('once a camera is NaN, the next delta brings it back to finite values', () => {
        const broken = { ...identityCamera(view), yaw: NaN, scale: NaN, offset: { x: NaN, y: 1, z: 2 } };
        const next = applyCameraDelta(broken, { pan: { x: 10, y: 0 } }, view);
        expect(finiteCamera(next)).toBe(true);
        expect(next.offset.y).toBe(1);
    });

    it('clampCamera: a non-finite field takes the previous camera\'s, else the identity\'s; the perspective is above 0', () => {
        const previous = createCamera(1500, { yaw: 30, scale: 2, pivot: { x: 1, y: 2, z: 3 } });
        const clamped = clampCamera({ ...previous, yaw: NaN, scale: Infinity, perspective: -5, pivot: { x: NaN, y: 9, z: 3 } }, DEFAULT_CAMERA_LIMITS, previous);
        expect(clamped).toMatchObject({ yaw: 30, scale: 2, perspective: 1500, pivot: { x: 1, y: 9, z: 3 } });
        const alone = clampCamera({ ...previous, pitch: NaN, perspective: '2000px' as any, offset: undefined as any });
        expect(alone).toMatchObject({ pitch: 0, perspective: DEFAULT_PERSPECTIVE, offset: { x: 0, y: 0, z: 0 } });
        // a valid camera is the same reference
        expect(clampCamera(previous)).toBe(previous);
        // limits of garbage are the defaults
        expect(finiteCamera(clampCamera(previous, { pitchLimit: NaN, zoomMin: 'x', zoomMax: -1, dollyLimitFraction: NaN } as any))).toBe(true);
    });

    it('interpolateCamera: a NaN t is the start', () => {
        const from = identityCamera(view);
        const to = { ...from, yaw: 30, scale: 2 };
        expect(interpolateCamera(from, to, NaN)).toBe(from);
        expect(interpolateCamera(from, to, -1)).toBe(from);
        expect(interpolateCamera(from, to, 2)).toBe(to);
    });

    it('limits are valid: finite, zoomMin above 0, zoomMax not below zoomMin', () => {
        expect(resolveCameraLimits({ pitchLimit: 'x' as any, zoomMin: 0, zoomMax: NaN, dollyLimitFraction: -1 })).toEqual(DEFAULT_CAMERA_LIMITS);
        expect(resolveCameraLimits({ zoomMin: 5 })).toMatchObject({ zoomMin: 5, zoomMax: 5 });
        expect(resolveCameraLimits({ zoomMin: 0.5, zoomMax: 8, rollLimit: 10 })).toMatchObject({ zoomMin: 0.5, zoomMax: 8, rollLimit: 10 });
        expect(resolveCameraLimits({ rollLimit: -1 }).rollLimit).toBeUndefined();
        expect(resolveCameraLimits(null)).toEqual(DEFAULT_CAMERA_LIMITS);
    });

    it('the store boots a finite camera from a string or negative perspective and garbage limits', () => {
        for (const space of [
            { perspective: '2000px' },
            { perspective: -5 },
            { navigation: { pitchLimit: 'x' } },
            { navigation: { zoomMin: 0, zoomMax: -3 } },
        ]) {
            const state = compute([], { space } as any, undefined, undefined, undefined, undefined, undefined);
            expect(finiteCamera(state.space.camera)).toBe(true);
            expect(finiteMatrix(state.space.transform)).toBe(true);
        }
    });
});
// #endregion module
