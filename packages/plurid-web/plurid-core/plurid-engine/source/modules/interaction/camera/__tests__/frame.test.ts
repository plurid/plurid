// #region imports
    // #region external
    import {
        createCamera,
        project,
        planeCorners,
        framePlane,
        fitAll,
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
// #endregion module
