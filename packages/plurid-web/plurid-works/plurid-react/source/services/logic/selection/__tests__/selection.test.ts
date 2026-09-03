// #region imports
    // #region libraries
    import {
        interaction,
    } from '@plurid/plurid-engine';

    import {
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        planesInScreenRect,
        nearestInDirection,
        projectedPlaneCenters,
        dragWorldDelta,
        cameraForward,
        cameraDepthOf,
    } from '../index';
    // #endregion external
// #endregion imports



// #region module
const {
    camera: cameraEngine,
} = interaction;

const view = { width: 1000, height: 600 };
const fallback = { width: 400, height: 300 };

const plane = (
    planeID: string,
    translateX: number,
    translateY = 0,
    extra: Partial<TreePlane> = {},
): TreePlane => ({
    sourceID: planeID,
    planeID,
    route: '/' + planeID,
    routeDivisions: {} as any,
    width: 200,
    height: 150,
    location: {
        translateX,
        translateY,
        translateZ: 0,
        rotateX: 0,
        rotateY: 0,
    },
    show: true,
    ...extra,
});


describe('planesInScreenRect()', () => {
    it('selects the planes whose projected rect intersects the marquee, shown only', () => {
        const camera = cameraEngine.identityCamera(view);
        const tree = [
            plane('a', 0, 0),
            plane('b', 300, 0),
            plane('c', 700, 0, { show: false }),
            plane('d', 300, 400),
        ];
        expect(planesInScreenRect(tree, camera, view, { left: 150, top: 10, right: 320, bottom: 100 }, fallback)).toEqual(['a', 'b']);
        // a reversed rect works too
        expect(planesInScreenRect(tree, camera, view, { left: 320, top: 100, right: 150, bottom: 10 }, fallback)).toEqual(['a', 'b']);
        expect(planesInScreenRect(tree, camera, view, { left: 700, top: 0, right: 800, bottom: 100 }, fallback)).toEqual([]);
    });
});


describe('nearestInDirection()', () => {
    const candidates = [
        { id: 'origin', x: 500, y: 300 },
        { id: 'right', x: 800, y: 320 },
        { id: 'farRight', x: 950, y: 300 },
        { id: 'below', x: 520, y: 500 },
        { id: 'upLeft', x: 200, y: 100 },
    ];

    it('picks the nearest candidate inside the cone, straight ahead preferred', () => {
        expect(nearestInDirection(candidates, { x: 500, y: 300 }, 'right')).toBe('right');
        expect(nearestInDirection(candidates, { x: 500, y: 300 }, 'down')).toBe('below');
        expect(nearestInDirection(candidates, { x: 500, y: 300 }, 'left')).toBe('upLeft');
        expect(nearestInDirection(candidates, { x: 500, y: 300 }, 'up')).toBe('upLeft');
    });

    it('returns undefined when nothing lies that way', () => {
        expect(nearestInDirection(candidates, { x: 950, y: 300 }, 'right')).toBeUndefined();
    });

    it('projected centers feed it', () => {
        const camera = cameraEngine.identityCamera(view);
        const centers = projectedPlaneCenters([plane('a', 0, 0), plane('b', 400, 0)], camera, view, fallback);
        expect(centers[0]).toEqual({ id: 'a', x: 100, y: 75 });
        expect(nearestInDirection(centers, { x: 100, y: 75 }, 'right')).toBe('b');
    });
});


describe('dragWorldDelta()', () => {
    it('round-trips: moving a world point by the delta moves its projection by the screen delta', () => {
        let camera = cameraEngine.identityCamera(view);
        camera = cameraEngine.applyCameraDelta(camera, { yaw: 35, pitch: -20, zoom: { factor: 1.4 } }, view);
        const world = { x: 320, y: 140, z: 0 };
        const start = cameraEngine.project(camera, view, world);
        const delta = dragWorldDelta(camera, view, { x: start.x, y: start.y }, { x: start.x + 60, y: start.y - 25 }, start.cameraZ);
        const moved = cameraEngine.project(camera, view, { x: world.x + delta.x, y: world.y + delta.y, z: world.z + delta.z });
        expect(moved.x - start.x).toBeCloseTo(60, 6);
        expect(moved.y - start.y).toBeCloseTo(-25, 6);
        expect(cameraDepthOf(camera, view, world)).toBeCloseTo(start.cameraZ, 9);
    });

    it('the camera forward is unit length and points away from the eye', () => {
        const camera = cameraEngine.applyCameraDelta(cameraEngine.identityCamera(view), { yaw: 90 }, view);
        const forward = cameraForward(camera, view);
        expect(Math.hypot(forward.x, forward.y, forward.z)).toBeCloseTo(1, 9);
        // at yaw 90 the camera looks along world -X (the scene turned so +X faces the viewer)
        expect(Math.abs(forward.x)).toBeCloseTo(1, 6);
        expect(Math.abs(forward.z)).toBeCloseTo(0, 6);
    });
});
// #endregion module
