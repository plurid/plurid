// #region imports
    // #region internal
    import type {
        CameraState,
        ViewSize,
        Vec2,
        Vec3,
        Projected,
        PlaneBasis,
        PlaneGeometry,
        PlanePick,
        WorldBox,
        TreePlaneLocation,
    } from './types';

    import {
        cameraMatrix,
        cameraInverse,
        cameraRotation,
        viewCenter,
        transformPoint,
        transformDirection,
    } from './matrix';

    import {
        eyeWorld,
    } from './delta';
    // #endregion internal
// #endregion imports



// #region module
const EPSILON = 1e-9;


/** Project a world point onto the view (px), applying the CSS perspective divide. */
export const project = (
    camera: CameraState,
    view: ViewSize,
    world: Vec3,
): Projected => projectWithMatrix(cameraMatrix(camera, view), camera.perspective, view, world);


export const projectWithMatrix = (
    matrix: number[],
    perspective: number,
    view: ViewSize,
    world: Vec3,
): Projected => {
    const center = viewCenter(view);
    const q = transformPoint(matrix, world);
    const denominator = perspective - q.z;

    if (denominator <= EPSILON) {
        return {
            x: NaN,
            y: NaN,
            cameraZ: q.z,
            visible: false,
        };
    }

    const k = perspective / denominator;

    return {
        x: center.x + (q.x - center.x) * k,
        y: center.y + (q.y - center.y) * k,
        cameraZ: q.z,
        visible: true,
    };
};


/** The world point that projects to `screen` and lies at camera-space depth `cameraZ`. */
export const unprojectAtCameraZ = (
    camera: CameraState,
    view: ViewSize,
    screen: Vec2,
    cameraZ: number,
): Vec3 => {
    const center = viewCenter(view);
    const k = (camera.perspective - cameraZ) / camera.perspective;

    return transformPoint(cameraInverse(camera, view), {
        x: center.x + (screen.x - center.x) * k,
        y: center.y + (screen.y - center.y) * k,
        z: cameraZ,
    });
};


/**
 * A plane renders with `translate(location) rotateX(rotateX) rotateY(rotateY)` about its top-left
 * corner, so its world frame is the origin plus the rotated unit axes.
 */
export const planeBasis = (
    location: TreePlaneLocation,
): PlaneBasis => {
    const rotation = cameraRotation(location.rotateX, location.rotateY);

    return {
        origin: {
            x: location.translateX,
            y: location.translateY,
            z: location.translateZ,
        },
        u: transformDirection(rotation, { x: 1, y: 0, z: 0 }),
        v: transformDirection(rotation, { x: 0, y: 1, z: 0 }),
        normal: transformDirection(rotation, { x: 0, y: 0, z: 1 }),
    };
};


const add = (a: Vec3, b: Vec3, scale = 1): Vec3 => ({
    x: a.x + b.x * scale,
    y: a.y + b.y * scale,
    z: a.z + b.z * scale,
});

const subtract = (a: Vec3, b: Vec3): Vec3 => ({
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
});

const dot = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z;


/** The four world-space corners of a plane (top-left, top-right, bottom-right, bottom-left). */
export const planeCorners = (
    plane: PlaneGeometry,
): Vec3[] => {
    const basis = planeBasis(plane.location);
    const topLeft = basis.origin;
    const topRight = add(topLeft, basis.u, plane.width);
    const bottomRight = add(topRight, basis.v, plane.height);
    const bottomLeft = add(topLeft, basis.v, plane.height);

    return [
        topLeft,
        topRight,
        bottomRight,
        bottomLeft,
    ];
};


export const planeCenter = (
    plane: PlaneGeometry,
): Vec3 => {
    const basis = planeBasis(plane.location);

    return add(
        add(basis.origin, basis.u, plane.width / 2),
        basis.v,
        plane.height / 2,
    );
};


/**
 * Cast the ray from the eye through `screen` and intersect it with the plane. `null` when the ray
 * is parallel to the plane or the hit is behind the eye; `inside` tells whether the hit lies within
 * the plane rectangle.
 */
export const pickPlanePoint = (
    camera: CameraState,
    view: ViewSize,
    plane: PlaneGeometry,
    screen: Vec2,
): PlanePick | null => {
    const eye = eyeWorld(camera, view);
    const through = unprojectAtCameraZ(camera, view, screen, 0);
    const direction = subtract(through, eye);
    const basis = planeBasis(plane.location);

    const denominator = dot(direction, basis.normal);
    if (Math.abs(denominator) < EPSILON) {
        return null;
    }

    const t = dot(subtract(basis.origin, eye), basis.normal) / denominator;
    if (t <= 0) {
        return null;
    }

    const world = add(eye, direction, t);
    const relative = subtract(world, basis.origin);
    const local = {
        x: dot(relative, basis.u),
        y: dot(relative, basis.v),
    };
    const inside = local.x >= 0
        && local.x <= plane.width
        && local.y >= 0
        && local.y <= plane.height;
    const cameraZ = transformPoint(cameraMatrix(camera, view), world).z;

    return {
        world,
        local,
        cameraZ,
        inside,
    };
};


export const boxCenter = (
    box: WorldBox,
): Vec3 => ({
    x: (box.min.x + box.max.x) / 2,
    y: (box.min.y + box.max.y) / 2,
    z: (box.min.z + box.max.z) / 2,
});


export const boxCorners = (
    box: WorldBox,
): Vec3[] => {
    const corners: Vec3[] = [];
    for (const x of [box.min.x, box.max.x]) {
        for (const y of [box.min.y, box.max.y]) {
            for (const z of [box.min.z, box.max.z]) {
                corners.push({ x, y, z });
            }
        }
    }
    return corners;
};


export const pointsBounds = (
    points: Vec3[],
): WorldBox | null => {
    if (points.length === 0) {
        return null;
    }

    const box: WorldBox = {
        min: { x: Infinity, y: Infinity, z: Infinity },
        max: { x: -Infinity, y: -Infinity, z: -Infinity },
    };

    for (const point of points) {
        box.min.x = Math.min(box.min.x, point.x);
        box.min.y = Math.min(box.min.y, point.y);
        box.min.z = Math.min(box.min.z, point.z);
        box.max.x = Math.max(box.max.x, point.x);
        box.max.y = Math.max(box.max.y, point.y);
        box.max.z = Math.max(box.max.z, point.z);
    }

    return box;
};


export interface WorldBoundsOptions {
    /** Include planes with `show === false`. Default `false`. */
    includeHidden?: boolean;
    /** Size used for planes that have not been measured yet (width/height 0). */
    fallbackWidth?: number;
    fallbackHeight?: number;
}

interface BoundablePlane {
    location: TreePlaneLocation;
    width?: number;
    height?: number;
    show?: boolean;
    children?: BoundablePlane[];
}


/** The world-space box of every (visible) plane's corners, children included. */
export const worldBounds = (
    planes: BoundablePlane[],
    options: WorldBoundsOptions = {},
): WorldBox | null => {
    const points: Vec3[] = [];

    const walk = (nodes: BoundablePlane[]) => {
        for (const node of nodes) {
            if (!options.includeHidden && node.show === false) {
                continue;
            }

            const width = node.width || options.fallbackWidth || 0;
            const height = node.height || options.fallbackHeight || 0;
            points.push(...planeCorners({
                location: node.location,
                width,
                height,
            }));

            if (node.children && node.children.length > 0) {
                walk(node.children);
            }
        }
    };
    walk(planes);

    return pointsBounds(points);
};
// #endregion module
