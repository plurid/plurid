// #region imports
    // #region external
    import {
        createCamera,
        identityCamera,
        project,
        unprojectAtCameraZ,
        planeBasis,
        planeCorners,
        planeCenter,
        pickPlanePoint,
        worldBounds,
    } from '../';
    // #endregion external
// #endregion imports



// #region module
const view = { width: 1000, height: 600 };


describe('camera projection', () => {
    it('the identity camera projects world px straight to view px', () => {
        const camera = identityCamera(view);
        const projected = project(camera, view, { x: 120, y: 80, z: 0 });
        expect(projected.x).toBeCloseTo(120, 9);
        expect(projected.y).toBeCloseTo(80, 9);
        expect(projected.visible).toBe(true);
    });

    it('a point nearer the eye projects further from the center (perspective)', () => {
        const camera = createCamera(2000);
        const flat = project(camera, view, { x: 700, y: 300, z: 0 });
        const near = project(camera, view, { x: 700, y: 300, z: 500 });
        expect(near.x - 500).toBeGreaterThan(flat.x - 500);
        expect(project(camera, view, { x: 0, y: 0, z: 2000 }).visible).toBe(false);
    });

    it('unprojectAtCameraZ() inverts project()', () => {
        const camera = createCamera(1800, {
            yaw: 40,
            pitch: -30,
            scale: 0.8,
            pivot: { x: 100, y: 50, z: 20 },
            offset: { x: 15, y: -25, z: 200 },
        });
        for (const screen of [{ x: 10, y: 10 }, { x: 500, y: 300 }, { x: 980, y: 590 }]) {
            for (const depth of [-300, 0, 250]) {
                const world = unprojectAtCameraZ(camera, view, screen, depth);
                const back = project(camera, view, world);
                expect(back.x).toBeCloseTo(screen.x, 6);
                expect(back.y).toBeCloseTo(screen.y, 6);
                expect(back.cameraZ).toBeCloseTo(depth, 6);
            }
        }
    });

    it('planeBasis() rotates the axes with the plane', () => {
        const basis = planeBasis({ translateX: 10, translateY: 20, translateZ: 30, rotateX: 0, rotateY: 90 });
        expect(basis.origin).toEqual({ x: 10, y: 20, z: 30 });
        expect(basis.u.x).toBeCloseTo(0, 9);
        expect(basis.u.z).toBeCloseTo(-1, 9);
        expect(basis.v).toEqual({ x: 0, y: 1, z: 0 });
        expect(basis.normal.x).toBeCloseTo(1, 9);
    });

    it('planeCorners() and planeCenter() follow the rotated width/height', () => {
        const plane = {
            location: { translateX: 0, translateY: 0, translateZ: 0, rotateX: 0, rotateY: 90 },
            width: 200,
            height: 100,
        };
        const corners = planeCorners(plane);
        expect(corners[1].z).toBeCloseTo(-200, 9);
        expect(corners[2].y).toBeCloseTo(100, 9);
        const center = planeCenter(plane);
        expect(center.z).toBeCloseTo(-100, 9);
        expect(center.y).toBeCloseTo(50, 9);
    });

    it('pickPlanePoint() finds the plane point under a screen position', () => {
        const camera = createCamera(2000, { yaw: 25, pitch: -15, scale: 1.2, pivot: { x: 300, y: 200, z: 0 } });
        const plane = {
            location: { translateX: 100, translateY: 50, translateZ: 0, rotateX: 0, rotateY: 30 },
            width: 400,
            height: 300,
        };
        const target = planeCenter(plane);
        const screen = project(camera, view, target);
        const pick = pickPlanePoint(camera, view, plane, { x: screen.x, y: screen.y });
        expect(pick).not.toBeNull();
        expect(pick!.inside).toBe(true);
        expect(pick!.local.x).toBeCloseTo(200, 4);
        expect(pick!.local.y).toBeCloseTo(150, 4);
        expect(pick!.world.x).toBeCloseTo(target.x, 4);
        const projectedBack = project(camera, view, pick!.world);
        expect(projectedBack.x).toBeCloseTo(screen.x, 4);
        expect(projectedBack.y).toBeCloseTo(screen.y, 4);
    });

    it('pickPlanePoint() reports misses outside the rectangle and parallel rays', () => {
        const camera = createCamera();
        const plane = {
            location: { translateX: 100, translateY: 100, translateZ: 0, rotateX: 0, rotateY: 0 },
            width: 50,
            height: 50,
        };
        const outside = pickPlanePoint(camera, view, plane, { x: 900, y: 500 });
        expect(outside!.inside).toBe(false);
        const edgeOn = {
            ...plane,
            location: { ...plane.location, translateX: 500, rotateY: 90 },
        };
        expect(pickPlanePoint(camera, view, edgeOn, { x: 500, y: 300 })).toBeNull();
    });

    it('worldBounds() spans visible planes and their children, with a fallback size', () => {
        const tree = [
            {
                location: { translateX: 0, translateY: 0, translateZ: 0, rotateX: 0, rotateY: 0 },
                width: 100,
                height: 50,
                children: [
                    {
                        location: { translateX: 300, translateY: 0, translateZ: -100, rotateX: 0, rotateY: 90 },
                        width: 0,
                        height: 0,
                    },
                ],
            },
            {
                location: { translateX: -500, translateY: 0, translateZ: 0, rotateX: 0, rotateY: 0 },
                width: 100,
                height: 50,
                show: false,
            },
        ];
        const box = worldBounds(tree, { fallbackWidth: 200, fallbackHeight: 80 });
        expect(box!.min.x).toBeCloseTo(0, 9);
        expect(box!.max.x).toBeCloseTo(300, 9);
        expect(box!.min.z).toBeCloseTo(-300, 9);
        expect(box!.max.y).toBeCloseTo(80, 9);
        expect(worldBounds([])).toBeNull();
    });
});
// #endregion module
