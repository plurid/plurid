// #region imports
    // #region libraries
    import {
        TreePlane,
        CameraState,
        ViewSize,
        Vec2,
        Vec3,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        interaction,
    } from '~services/engine';
    // #endregion external
// #endregion imports



// #region module
const {
    camera: cameraEngine,
} = interaction;


export interface ScreenRect {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export type Direction =
    | 'left'
    | 'right'
    | 'up'
    | 'down';


/** Every shown plane in the tree, children included, in tree order. */
export const collectShownPlanes = (
    tree: TreePlane[],
): TreePlane[] => {
    const planes: TreePlane[] = [];
    const walk = (nodes: TreePlane[]) => {
        for (const node of nodes) {
            if (node.show === false) {
                continue;
            }
            planes.push(node);
            if (node.children) {
                walk(node.children);
            }
        }
    };
    walk(tree);
    return planes;
};


/** The world center of a plane (its rotated basis), measured size or the fallback. */
export const planeWorldCenter = (
    plane: TreePlane,
    fallback: { width: number; height: number },
): Vec3 => cameraEngine.planeCenter({
    location: plane.location,
    width: plane.width || fallback.width,
    height: plane.height || fallback.height,
});


/** The screen-space bounding rect of a plane's projected corners; `null` when any corner is behind the eye. */
export const projectedPlaneRect = (
    camera: CameraState,
    view: ViewSize,
    plane: TreePlane,
    fallback: { width: number; height: number },
): ScreenRect | null => {
    const corners = cameraEngine.planeCorners({
        location: plane.location,
        width: plane.width || fallback.width,
        height: plane.height || fallback.height,
    });
    const matrix = cameraEngine.cameraMatrix(camera, view);

    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    for (const corner of corners) {
        const projected = cameraEngine.projectWithMatrix(matrix, camera.perspective, view, corner);
        if (!projected.visible || !Number.isFinite(projected.x) || !Number.isFinite(projected.y)) {
            return null;
        }
        left = Math.min(left, projected.x);
        top = Math.min(top, projected.y);
        right = Math.max(right, projected.x);
        bottom = Math.max(bottom, projected.y);
    }

    return {
        left,
        top,
        right,
        bottom,
    };
};


const rectsIntersect = (
    a: ScreenRect,
    b: ScreenRect,
): boolean => a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top;


/** The ids of the shown planes whose projected rect intersects a screen rect (the marquee). */
export const planesInScreenRect = (
    tree: TreePlane[],
    camera: CameraState,
    view: ViewSize,
    rect: ScreenRect,
    fallback: { width: number; height: number },
): string[] => {
    const normalized: ScreenRect = {
        left: Math.min(rect.left, rect.right),
        right: Math.max(rect.left, rect.right),
        top: Math.min(rect.top, rect.bottom),
        bottom: Math.max(rect.top, rect.bottom),
    };

    return collectShownPlanes(tree)
        .filter((plane) => {
            const projected = projectedPlaneRect(camera, view, plane, fallback);
            return !!projected && rectsIntersect(projected, normalized);
        })
        .map((plane) => plane.planeID);
};


const DIRECTIONS: Record<Direction, Vec2> = {
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
};

/** Half-angle of the search cone: candidates farther off-axis than this are not "in that direction". */
const CONE_TANGENT = Math.tan(60 * Math.PI / 180);


/**
 * The candidate nearest in a screen direction from `from`: inside a 60° half-angle cone, scored by
 * the along-axis distance plus half the off-axis distance (so a plane straight ahead beats a nearer
 * one to the side). `undefined` when nothing lies that way.
 */
export const nearestInDirection = (
    candidates: { id: string; x: number; y: number }[],
    from: Vec2,
    direction: Direction,
): string | undefined => {
    const axis = DIRECTIONS[direction];
    let best: string | undefined;
    let bestScore = Infinity;

    for (const candidate of candidates) {
        const dx = candidate.x - from.x;
        const dy = candidate.y - from.y;
        const along = dx * axis.x + dy * axis.y;
        if (along <= 1) {
            continue;
        }
        const perpendicular = Math.abs(dx * axis.y - dy * axis.x);
        if (perpendicular > along * CONE_TANGENT) {
            continue;
        }
        const score = along + perpendicular * 0.5;
        if (score < bestScore) {
            bestScore = score;
            best = candidate.id;
        }
    }

    return best;
};


/** The projected centers of the shown planes (those in front of the eye). */
export const projectedPlaneCenters = (
    tree: TreePlane[],
    camera: CameraState,
    view: ViewSize,
    fallback: { width: number; height: number },
): { id: string; x: number; y: number }[] => {
    const matrix = cameraEngine.cameraMatrix(camera, view);
    const centers: { id: string; x: number; y: number }[] = [];
    for (const plane of collectShownPlanes(tree)) {
        const projected = cameraEngine.projectWithMatrix(matrix, camera.perspective, view, planeWorldCenter(plane, fallback));
        if (projected.visible && Number.isFinite(projected.x) && Number.isFinite(projected.y)) {
            centers.push({ id: plane.planeID, x: projected.x, y: projected.y });
        }
    }
    return centers;
};


/**
 * A screen-space drag as a WORLD delta on the plane at camera depth `cameraZ` — exact at any
 * orientation, so a dragged plane stays under the pointer instead of drifting by `1 / scale`.
 */
export const dragWorldDelta = (
    camera: CameraState,
    view: ViewSize,
    from: Vec2,
    to: Vec2,
    cameraZ: number,
): Vec3 => {
    const start = cameraEngine.unprojectAtCameraZ(camera, view, from, cameraZ);
    const end = cameraEngine.unprojectAtCameraZ(camera, view, to, cameraZ);
    return {
        x: end.x - start.x,
        y: end.y - start.y,
        z: end.z - start.z,
    };
};


/** The camera's forward direction (away from the eye) in world space, unit length. */
export const cameraForward = (
    camera: CameraState,
    view: ViewSize,
): Vec3 => {
    const center = { x: view.width / 2, y: view.height / 2 };
    const near = cameraEngine.unprojectAtCameraZ(camera, view, center, 0);
    const far = cameraEngine.unprojectAtCameraZ(camera, view, center, -100);
    const direction = {
        x: far.x - near.x,
        y: far.y - near.y,
        z: far.z - near.z,
    };
    const length = Math.hypot(direction.x, direction.y, direction.z) || 1;
    return {
        x: direction.x / length,
        y: direction.y / length,
        z: direction.z / length,
    };
};


/** Camera-space depth of a world point. */
export const cameraDepthOf = (
    camera: CameraState,
    view: ViewSize,
    world: Vec3,
): number => cameraEngine.project(camera, view, world).cameraZ;
// #endregion module
