// #region imports
    // #region external
    import {
        createCamera,
        project,
        planeCorners,
        framePlane,
        fitAll,
        bestYaw,
        framePlanes,
        framePair,
        frameBounds,
        worldBounds,
        viewCenter,
        DEFAULT_CAMERA_LIMITS,
    } from '../';
    // #endregion external
// #endregion imports



// #region module
const view = { width: 1000, height: 600 };

const insideMargin = (
    camera: ReturnType<typeof createCamera>,
    points: { x: number; y: number; z: number }[],
    margin: number,
) => {
    const center = viewCenter(view);
    for (const point of points) {
        const projected = project(camera, view, point);
        expect(projected.visible).toBe(true);
        expect(Math.abs(projected.x - center.x)).toBeLessThanOrEqual((view.width / 2) * margin + 1e-6);
        expect(Math.abs(projected.y - center.y)).toBeLessThanOrEqual((view.height / 2) * margin + 1e-6);
    }
};


describe('camera framing', () => {
    it('framePlane() centers a rotated plane face-on with every corner inside the view', () => {
        const camera = createCamera(2000, { yaw: 80, pitch: 40, scale: 3 });
        const plane = {
            location: { translateX: 500, translateY: 300, translateZ: -200, rotateX: 0, rotateY: 90 },
            width: 600,
            height: 400,
        };
        const framed = framePlane(camera, plane, view);
        expect(framed.yaw).toBeCloseTo(-90, 9);
        expect(framed.pitch).toBeCloseTo(0, 9);
        expect(framed.scale).toBeLessThanOrEqual(1);
        insideMargin(framed, planeCorners(plane), 0.85);
        const center = project(framed, view, framed.pivot);
        expect(center.x).toBeCloseTo(view.width / 2, 6);
        expect(center.y).toBeCloseTo(view.height / 2, 6);
    });

    it('framePlane() does not magnify a small plane past maxScale', () => {
        const camera = createCamera();
        const plane = {
            location: { translateX: 0, translateY: 0, translateZ: 0, rotateX: 0, rotateY: 0 },
            width: 100,
            height: 60,
        };
        expect(framePlane(camera, plane, view).scale).toBe(1);
        expect(framePlane(camera, plane, view, { maxScale: 4 }).scale).toBeGreaterThan(1);
    });

    it('fitAll() frames every visible plane and its children front-on', () => {
        const camera = createCamera(2000, { yaw: 20, pitch: 10 });
        const tree = [
            {
                location: { translateX: 0, translateY: 0, translateZ: 0, rotateX: 0, rotateY: 0 },
                width: 700,
                height: 500,
                children: [
                    {
                        location: { translateX: 900, translateY: 100, translateZ: -300, rotateX: 0, rotateY: 90 },
                        width: 700,
                        height: 500,
                    },
                ],
            },
            {
                location: { translateX: 800, translateY: 0, translateZ: 0, rotateX: 0, rotateY: 0 },
                width: 700,
                height: 500,
            },
        ];
        const fitted = fitAll(camera, tree, view);
        expect(fitted.yaw).toBe(0);
        expect(fitted.pitch).toBe(0);
        expect(fitted.scale).toBeLessThan(1);
        const points = tree.flatMap((plane) => [
            ...planeCorners(plane),
            ...(plane.children || []).flatMap((child) => planeCorners(child)),
        ]);
        insideMargin(fitted, points, 0.85);
    });

    it('fitAll() uses the fallback size for unmeasured planes instead of framing a point', () => {
        const camera = createCamera();
        const tree = [
            {
                location: { translateX: 0, translateY: 0, translateZ: 0, rotateX: 0, rotateY: 0 },
                width: 0,
                height: 0,
            },
        ];
        const fitted = fitAll(camera, tree, view, { fallbackWidth: 1000, fallbackHeight: 700 });
        expect(fitted.scale).toBeLessThan(1);
        expect(fitted.scale).toBeGreaterThan(DEFAULT_CAMERA_LIMITS.zoomMin);
        expect(fitAll(camera, [], view)).toBe(camera);
    });
});


/**
 * THE YAW AT WHICH EVERYTHING READS. A branch at 90.1° framed face-on leaves its parent edge-on
 * and framed front-on is itself a line; the yaw between them shows each at cos 45.05° of its
 * width. This is the camera's half of the 90.1 decision.
 */
const at = (rotateY: number, translateX = 0, translateZ = 0, width = 460) => ({
    location: { translateX, translateY: 0, translateZ, rotateX: 0, rotateY },
    width,
    height: 300,
});

describe('the yaw at which everything reads', () => {
    it('is the front for roots alone', () => {
        expect(bestYaw([at(0), at(0, 540)])).toBe(0);
        expect(bestYaw([])).toBe(0);
    });

    it('is the bisector for a root and its 90.1° branch: each reads at 0.706 of its width', () => {
        const yaw = bestYaw([at(0), at(90.1, 460, -100)]);
        expect(yaw).toBeCloseTo(-45.05, 6);
        const DEG = Math.PI / 180;
        expect(Math.abs(Math.cos((0 + yaw) * DEG))).toBeCloseTo(0.7064, 3);
        expect(Math.abs(Math.cos((90.1 + yaw) * DEG))).toBeCloseTo(0.7064, 3);
    });

    it('stays at the bisector for a chain that alternates: root, fin, grandchild at 0 again', () => {
        expect(bestYaw([at(0), at(90.1, 460, -100), at(0, 560, -560)])).toBeCloseTo(-45.05, 6);
    });

    it('prefers the yaw nearest the front on a tie', () => {
        // two fins turned opposite ways: ±45 tie; the bisector 0 shows both at 0.7
        expect(Math.abs(bestYaw([at(45), at(-45)]))).toBeLessThan(1e-9);
    });

    it('judges by projected WIDTH, so a narrow fin is the plane the yaw serves', () => {
        // a 2000px root and a 200px fin: from the bisector the fin shows 141px and the root 1413;
        // from the front the fin is 0.35px. The bisector is the answer, by the fin's width.
        const yaw = bestYaw([at(0, 0, 0, 2000), at(90.1, 2000, -100, 200)]);
        expect(yaw).toBeCloseTo(-45.05, 6);
    });
});


describe('framing by real corners', () => {
    it('framePair() lands level at the bisector with every corner of both inside the view', () => {
        const camera = createCamera(2000, { yaw: 70, pitch: 30, scale: 2 });
        const parent = at(0);
        const child = at(90.1, 460, -100);
        const framed = framePair(camera, parent, child, view);
        expect(framed.yaw).toBeCloseTo(-45.05, 6);
        expect(framed.pitch).toBe(0);
        expect(framed.roll).toBe(0);
        insideMargin(framed, [...planeCorners(parent), ...planeCorners(child)], 0.85);
    });

    it('a turned plane fits at a LARGER scale by its corners than by the box around it', () => {
        // the axis-aligned box around a plane turned 45° is half again as wide as the plane
        const camera = createCamera();
        const turned = at(45, 460, -100);
        const byCorners = framePlanes(camera, [turned], view, { yaw: -45, maxScale: 4 });
        const box = worldBounds([{ ...turned, show: true }])!;
        const byBox = frameBounds(camera, box, view, { yaw: -45, maxScale: 4 });
        expect(byCorners.scale).toBeGreaterThan(byBox.scale * 1.1);
    });

    it('fitAll() with yaw best turns to where the branch reads, and by default stays front-on', () => {
        const camera = createCamera();
        const tree = [{ ...at(0), show: true, children: [{ ...at(90.1, 460, -100), show: true }] }];
        expect(fitAll(camera, tree, view, { yaw: 'best' }).yaw).toBeCloseTo(-45.05, 6);
        expect(fitAll(camera, tree, view).yaw).toBe(0);
        expect(fitAll(camera, [], view)).toBe(camera);
    });
});
// #endregion module
