// #region imports
    // #region external
    import {
        identityCamera,
        applyCameraDelta,
        cameraRotation,
        transformDirection,
        project,
        placementForRect,
        projectedBounds,
        facesCameraExactly,
        levelCamera,
        stackLocations,
        defaultStackStep,
        clampCamera,
    } from '../';
    import type {
        CameraState,
    } from '../types';
    // #endregion external
// #endregion imports



// #region module
type Rect = { left: number; top: number; width: number; height: number };

/** The corners of a plane placed at `location`, sized `width` × `height`, as `camera` draws them. */
const drawn = (
    camera: CameraState,
    view: { width: number; height: number },
    location: { translateX: number; translateY: number; translateZ: number; rotateX: number; rotateY: number },
    width: number,
    height: number,
) => [
    [0, 0], [width, 0], [width, height], [0, height],
].map(([x, y]) => {
    const along = transformDirection(cameraRotation(location.rotateX, location.rotateY), { x, y, z: 0 });
    const point = project(camera, view, {
        x: location.translateX + along.x,
        y: location.translateY + along.y,
        z: location.translateZ + along.z,
    });
    return [point.x, point.y];
});

const expectOnRect = (
    corners: number[][],
    rect: Rect,
    within = 1,
) => {
    const expected = [
        [rect.left, rect.top],
        [rect.left + rect.width, rect.top],
        [rect.left + rect.width, rect.top + rect.height],
        [rect.left, rect.top + rect.height],
    ];
    corners.forEach(([x, y], index) => {
        expect(Math.abs(x - expected[index][0])).toBeLessThan(within);
        expect(Math.abs(y - expected[index][1])).toBeLessThan(within);
    });
};

const views = [
    { width: 1280, height: 800 },
    { width: 1920, height: 1080 },
    { width: 820, height: 1180 },
    { width: 390, height: 844 },
];

/** Cameras a reader leaves the space in: zoomed, panned, dollied, re-pivoted, turned one way. */
const cameras = (
    view: { width: number; height: number },
): CameraState[] => {
    const base = identityCamera(view);
    return [
        base,
        applyCameraDelta(base, { zoom: { factor: 0.55, anchor: { x: 300, y: 200 } } }, view),
        applyCameraDelta(base, { zoom: { factor: 1.8, anchor: { x: 600, y: 400 } }, pan: { x: -140, y: 60 } }, view),
        applyCameraDelta(base, { yaw: 37, pan: { x: 40, y: -30 } }, view),
        applyCameraDelta(base, { pitch: -24, zoom: { factor: 0.8, anchor: { x: 100, y: 100 } } }, view),
        clampCamera({ ...applyCameraDelta(base, { yaw: -128 }, view), pivot: { x: 900, y: -300, z: 450 }, offset: { x: 30, y: -12, z: -380 } }),
        { ...base, perspective: 1200 },
    ];
};


describe('placing a plane where a screen rect is', () => {
    it('A PLACED PLANE IS DRAWN ON ITS RECT, within a px, across view sizes and every level camera', () => {
        for (const view of views) {
            for (const camera of cameras(view)) {
                expect(facesCameraExactly(camera)).toBe(true);
                const rect = { left: view.width * 0.55, top: 48, width: Math.min(420, view.width * 0.4), height: view.height * 0.6 };
                const placed = placementForRect(camera, view, rect);
                expect(placed.exact).toBe(true);
                expectOnRect(drawn(camera, view, placed.location, rect.width, rect.height), rect);
            }
        }
    });

    it('a camera turned both ways has no face-on plane; the level camera has, and keeps the yaw, the zoom and the pivot', () => {
        const view = views[0];
        const turned = applyCameraDelta(identityCamera(view), { yaw: 30, pitch: -20, zoom: { factor: 0.9, anchor: { x: 400, y: 300 } } }, view);
        expect(facesCameraExactly(turned)).toBe(false);
        const rect = { left: 800, top: 60, width: 400, height: 500 };
        expect(placementForRect(turned, view, rect).exact).toBe(false);

        const level = levelCamera(turned);
        expect(level).toMatchObject({ pitch: 0, roll: 0, yaw: turned.yaw, scale: turned.scale, pivot: turned.pivot, offset: turned.offset });
        const placed = placementForRect(level, view, rect);
        expect(placed.exact).toBe(true);
        expectOnRect(drawn(level, view, placed.location, rect.width, rect.height), rect);

        // a tilted horizon is no face-on camera either
        expect(facesCameraExactly({ ...identityCamera(view), roll: 4 })).toBe(false);
    });

    it('reads back where a plane is drawn: its projected bounds, none for a plane behind the eye', () => {
        const view = views[0];
        const camera = identityCamera(view);
        const plane = { location: { translateX: 100, translateY: 50, translateZ: 0, rotateX: 0, rotateY: 0 }, width: 300, height: 200 };
        expect(projectedBounds(camera, view, plane)).toEqual({ left: 100, top: 50, width: 300, height: 200 });
        const rect = { left: 700, top: 90, width: 360, height: 420 };
        const zoomed = applyCameraDelta(camera, { zoom: { factor: 0.6, anchor: { x: 0, y: 0 } } }, view);
        const placed = placementForRect(zoomed, view, rect);
        const bounds = projectedBounds(zoomed, view, { location: placed.location, width: rect.width, height: rect.height })!;
        expect(bounds.left).toBeCloseTo(rect.left, 6);
        expect(bounds.width).toBeCloseTo(rect.width, 6);
        expect(projectedBounds(camera, view, { ...plane, location: { ...plane.location, translateZ: 2500 } })).toBeUndefined();
    });
});


describe('stacking planes', () => {
    const view = views[0];
    const planes = [0, 1, 2, 3].map((index) => ({
        width: 400,
        height: 300,
        location: { translateX: index * 500, translateY: 0, translateZ: 0, rotateX: 0, rotateY: index * 10 },
    }));

    it('sets them one behind another facing the camera: each down-right of and nearer than the one behind, the middle on the view\'s centre', () => {
        for (const camera of cameras(view)) {
            const step = { x: 30, y: 70, z: 90 };
            const locations = stackLocations(camera, view, planes, step, 'camera');
            const pictures = locations.map((location) => drawn(camera, view, location, 400, 300));
            for (let index = 1; index < pictures.length; index += 1) {
                // the plane behind is up-left of the one in front: its top-left corner, its title, shows
                expect(pictures[index][0][0]).toBeLessThan(pictures[index - 1][0][0]);
                expect(pictures[index][0][1]).toBeLessThan(pictures[index - 1][0][1]);
                // and it is deeper, so drawn smaller
                const widthOf = (picture: number[][]) => picture[1][0] - picture[0][0];
                expect(widthOf(pictures[index])).toBeLessThan(widthOf(pictures[index - 1]) + 1e-9);
            }
            // the middle of the stack is at the view's centre
            const centres = pictures.map((picture) => [(picture[0][0] + picture[2][0]) / 2, (picture[0][1] + picture[2][1]) / 2]);
            const middle = [(centres[1][0] + centres[2][0]) / 2, (centres[1][1] + centres[2][1]) / 2];
            expect(Math.abs(middle[0] - view.width / 2)).toBeLessThan(camera.scale * 40);
            expect(Math.abs(middle[1] - view.height / 2)).toBeLessThan(camera.scale * 80);
        }
    });

    it('faces the camera, the world\'s front, or keeps each plane\'s turn', () => {
        const camera = applyCameraDelta(identityCamera(view), { yaw: 40 }, view);
        const step = defaultStackStep({ width: 400, height: 300 });
        expect(stackLocations(camera, view, planes, step, 'camera').map((location) => location.rotateY)).toEqual([-40, -40, -40, -40]);
        expect(stackLocations(camera, view, planes, step, 'front').map((location) => location.rotateY)).toEqual([0, 0, 0, 0]);
        expect(stackLocations(camera, view, planes, step, 'keep').map((location) => location.rotateY)).toEqual([0, 10, 20, 30]);
        expect(stackLocations(camera, view, [], step)).toEqual([]);
    });

    it('steps by default by the front plane\'s size, a title bar down at least', () => {
        expect(defaultStackStep({ width: 400, height: 300 })).toEqual({ x: 24, y: 56 + 9, z: 60 });
        expect(defaultStackStep({ width: 1000, height: 800 })).toEqual({ x: 50, y: 56 + 24, z: 150 });
    });
});
// #endregion module
