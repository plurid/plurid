// #region imports
    // #region external
    import {
        identityCamera,
        applyCameraDelta,
        cameraMatrix,
        transformPoint,
        viewCenter,
        planeCorners,
        occludedShare,
        occludingPlanes,
        clipByConvex,
        polygonArea,
        OCCLUSION_THRESHOLD,
    } from '../';
    import type {
        CameraState,
        PlaneGeometry,
    } from '../types';
    // #endregion external
// #endregion imports



// #region module
const view = { width: 1280, height: 800 };

const plane = (
    translateX: number,
    translateY: number,
    translateZ: number,
    width = 400,
    height = 300,
    rotateX = 0,
    rotateY = 0,
): PlaneGeometry => ({
    location: { translateX, translateY, translateZ, rotateX, rotateY },
    width,
    height,
});

/**
 * THE SHARE BY RAYS, independently: a grid of rays through the target's drawn box; of those that
 * hit the target, the share that hits `other` nearer the eye.
 */
const sampledShare = (
    camera: CameraState,
    target: PlaneGeometry,
    other: PlaneGeometry,
    steps = 120,
): number => {
    const matrix = cameraMatrix(camera, view);
    const center = viewCenter(view);
    const d = camera.perspective;
    const eye = { x: center.x, y: center.y, z: d };
    const quad = (geometry: PlaneGeometry) => planeCorners(geometry).map((corner) => transformPoint(matrix, corner));
    const hit = (corners: { x: number; y: number; z: number }[], ray: { x: number; y: number; z: number }) => {
        const [p0, p1, , p3] = corners;
        const u = { x: p1.x - p0.x, y: p1.y - p0.y, z: p1.z - p0.z };
        const v = { x: p3.x - p0.x, y: p3.y - p0.y, z: p3.z - p0.z };
        const n = { x: u.y * v.z - u.z * v.y, y: u.z * v.x - u.x * v.z, z: u.x * v.y - u.y * v.x };
        const denominator = n.x * ray.x + n.y * ray.y + n.z * ray.z;
        if (Math.abs(denominator) < 1e-12) {
            return undefined;
        }
        const t = (n.x * (p0.x - eye.x) + n.y * (p0.y - eye.y) + n.z * (p0.z - eye.z)) / denominator;
        if (t <= 0) {
            return undefined;
        }
        const point = { x: eye.x + ray.x * t - p0.x, y: eye.y + ray.y * t - p0.y, z: eye.z + ray.z * t - p0.z };
        const uu = u.x * u.x + u.y * u.y + u.z * u.z;
        const vv = v.x * v.x + v.y * v.y + v.z * v.z;
        const a = (point.x * u.x + point.y * u.y + point.z * u.z) / uu;
        const b = (point.x * v.x + point.y * v.y + point.z * v.z) / vv;
        return a >= 0 && a <= 1 && b >= 0 && b <= 1 ? t : undefined;
    };
    const targetQuad = quad(target);
    const otherQuad = quad(other);
    let onTarget = 0;
    let covered = 0;
    for (let i = 0; i <= steps; i += 1) {
        for (let j = 0; j <= steps; j += 1) {
            const s = { x: (view.width * 2 * i) / steps - view.width / 2, y: (view.height * 2 * j) / steps - view.height / 2 };
            const ray = { x: s.x - center.x, y: s.y - center.y, z: -d };
            const tTarget = hit(targetQuad, ray);
            if (tTarget === undefined) {
                continue;
            }
            onTarget += 1;
            const tOther = hit(otherQuad, ray);
            if (tOther !== undefined && tOther < tTarget) {
                covered += 1;
            }
        }
    }
    return onTarget === 0 ? 0 : covered / onTarget;
};

const camera = identityCamera(view);
const target = plane(440, 250, 0);


describe('which planes stand between the camera and a plane', () => {
    it('a plane in front of it covers it, one behind it or beside it does not', () => {
        expect(occludedShare(camera, view, target, plane(440, 250, 200))).toBeCloseTo(1, 6);
        expect(occludedShare(camera, view, target, plane(440, 250, -200))).toBe(0);
        expect(occludedShare(camera, view, target, plane(1000, 250, 200))).toBe(0);
        // the same plane, side by side and overlapping, in the same place: no depth between them
        expect(occludedShare(camera, view, target, plane(640, 250, 0))).toBe(0);
    });

    it('A REAL DEPTH TEST OVER THE OVERLAP: the analytic share matches rays cast through it, turned planes included', () => {
        const turned = applyCameraDelta(camera, { yaw: 28, pitch: -16, zoom: { factor: 0.7, anchor: { x: 640, y: 400 } } }, view);
        const cases: [CameraState, PlaneGeometry, PlaneGeometry][] = [
            [camera, target, plane(540, 300, 150, 300, 200)],
            [camera, target, plane(300, 150, 300, 400, 300, 0, 50)],
            // a plane tilted THROUGH the target: only the half in front covers it
            [camera, target, plane(440, 250, -150, 400, 300, 0, -60)],
            [camera, target, plane(400, 200, 100, 500, 400, 35, 20)],
            [turned, target, plane(500, 300, 220, 300, 260, 0, 30)],
            [turned, target, plane(200, 100, -300, 400, 300)],
            [turned, plane(0, 0, 0, 600, 400, 10, 40), plane(150, 120, 180, 300, 300, -20, 10)],
        ];
        for (const [view3d, front, other] of cases) {
            const analytic = occludedShare(view3d, view, front, other);
            const sampled = sampledShare(view3d, front, other);
            expect(Math.abs(analytic - sampled)).toBeLessThan(0.03);
        }
        // and the tilted one really is partial
        const tilted = occludedShare(camera, view, target, plane(440, 250, -150, 400, 300, 0, -60));
        expect(tilted).toBeGreaterThan(0.1);
        expect(tilted).toBeLessThan(0.9);
    });

    it('a plane reaching behind the eye still occludes by the part in front of it', () => {
        const near = plane(240, 100, 1900, 800, 600);
        expect(occludedShare(camera, view, target, near)).toBeCloseTo(1, 6);
        expect(occludedShare(camera, view, target, plane(240, 100, 2400, 800, 600))).toBe(0);
        // tilted through the eye's plane: its top edge behind the eye, its middle in front of the
        // target; the part in front of the eye is clipped and measured, and the rays agree
        const matrix = cameraMatrix(camera, view);
        let straddling = 0;
        for (const tilt of [60, -60]) {
            const through = plane(240, -350, 2300, 800, 1900, tilt, 0);
            const depths = planeCorners(through).map((corner) => transformPoint(matrix, corner).z);
            if (Math.max(...depths) <= camera.perspective || Math.min(...depths) >= camera.perspective) {
                continue;
            }
            straddling += 1;
            const analytic = occludedShare(camera, view, target, through);
            expect(analytic).toBeGreaterThan(0);
            expect(Math.abs(analytic - sampledShare(camera, target, through))).toBeLessThan(0.03);
        }
        expect(straddling).toBeGreaterThan(0);
    });

    it('THE USER\'S CASE: a 2 × 2 grid of children in front of their parent, every child occluding it, the most covering first', () => {
        const parent = plane(340, 150, 0, 600, 500);
        const children = [
            { planeID: 'c1', ...plane(300, 100, 260, 340, 280) },
            { planeID: 'c2', ...plane(660, 100, 260, 340, 280) },
            { planeID: 'c3', ...plane(300, 400, 260, 340, 280) },
            { planeID: 'c4', ...plane(660, 400, 260, 340, 280) },
            { planeID: 'behind', ...plane(340, 150, -400, 600, 500) },
            { planeID: 'aside', ...plane(1400, 150, 300, 300, 300) },
            { planeID: 'parent', ...parent },
        ];
        const found = occludingPlanes(camera, view, parent, children, OCCLUSION_THRESHOLD, 'parent');
        expect(found.map((entry) => entry.planeID).sort()).toEqual(['c1', 'c2', 'c3', 'c4']);
        for (let index = 1; index < found.length; index += 1) {
            expect(found[index].covered).toBeLessThanOrEqual(found[index - 1].covered);
        }
    });

    it('covers less than the threshold: not an occluder', () => {
        const sliver = { planeID: 'sliver', ...plane(440 + 400 - 20, 250, 100, 300, 300) };
        const share = occludedShare(camera, view, target, sliver);
        expect(share).toBeGreaterThan(0);
        expect(share).toBeLessThan(OCCLUSION_THRESHOLD);
        expect(occludingPlanes(camera, view, target, [sliver])).toEqual([]);
        expect(occludingPlanes(camera, view, target, [sliver], 0.01).map((entry) => entry.planeID)).toEqual(['sliver']);
    });

    it('clips convex polygons and measures them', () => {
        const square = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
        const shifted = square.map((point) => ({ x: point.x + 5, y: point.y + 5 }));
        expect(polygonArea(clipByConvex(shifted, square))).toBeCloseTo(25, 9);
        expect(polygonArea(clipByConvex(shifted, [...square].reverse()))).toBeCloseTo(25, 9);
        expect(clipByConvex(square.map((point) => ({ x: point.x + 20, y: point.y })), square)).toEqual([]);
    });
});
// #endregion module
