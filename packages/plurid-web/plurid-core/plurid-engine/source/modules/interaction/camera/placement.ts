// #region imports
    // #region libraries
    import {
        PLANE_BAR_HEIGHT,
    } from '@plurid/plurid-data';
    import type {
        PluridScreenRect,
        PluridStackStep,
        PluridStackFacing,
        TreePlaneLocation,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region internal
    import type {
        CameraState,
        ViewSize,
        PlaneGeometry,
        Vec3,
    } from './types';
    import {
        normalizeYaw,
    } from './state';
    import {
        cameraRotation,
        transformDirection,
        transformDirectionTransposed,
        viewCenter,
    } from './matrix';
    import {
        project,
        planeCorners,
    } from './project';
    // #endregion internal
// #endregion imports



// #region module
/**
 * PLACING A PLANE WHERE A SCREEN RECT IS, AND STACKING PLANES (2026-10-31).
 *
 * A face-on plane draws its local point `x` at camera space `A + s·x` (`A` its top-left corner in
 * camera space, `s` the camera's scale), all at one depth `A.z`; the perspective divide scales it by
 * `k = d / (d − A.z)` about the view centre. A plane laid out at the rect's own size lands exactly on
 * the rect when `s·k = 1`, so at the depth `A.z = d·(1 − s)`, with its top-left on the ray through
 * the rect's top-left. Its content is laid out at the size it had on the screen: nothing reflows.
 *
 * FACE-ON NEEDS A LEVEL CAMERA. A plane turns by `Rx(rotateX)·Ry(rotateY)`, two angles; it faces a
 * camera `Rz(roll)·Rx(pitch)·Ry(yaw)` exactly when the roll is 0 and the pitch or the yaw is (then
 * `rotateX = −pitch` or `rotateY = −yaw`). A camera turned both ways has no exact face-on plane, and
 * `levelCamera` is the nearest one that does: the pitch and the roll taken to 0, the yaw, the pivot
 * and the pan kept.
 */

const ANGLE_EPSILON = 1e-6;

const clean = (
    value: number,
): number => (value === 0 ? 0 : value);

/** Whether a face-on plane can face this camera exactly (`placementForRect` is exact). */
export const facesCameraExactly = (
    camera: CameraState,
): boolean => Math.abs(normalizeYaw(camera.roll ?? 0)) < ANGLE_EPSILON
    && (Math.abs(camera.pitch) < ANGLE_EPSILON || Math.abs(normalizeYaw(camera.yaw)) < ANGLE_EPSILON);

/** The camera with its horizon and its pitch level: the yaw, the zoom, the pivot and the pan kept. */
export const levelCamera = (
    camera: CameraState,
): CameraState => ({
    ...camera,
    pitch: 0,
    roll: 0,
});

/** The rotation a plane faces the camera with: exact under `facesCameraExactly`, else the dock pose's pair. */
const facingRotation = (
    camera: CameraState,
): { rotateX: number; rotateY: number } => {
    if (Math.abs(camera.pitch) < ANGLE_EPSILON) {
        return { rotateX: 0, rotateY: clean(normalizeYaw(-camera.yaw)) };
    }
    if (Math.abs(normalizeYaw(camera.yaw)) < ANGLE_EPSILON) {
        return { rotateX: clean(0 - camera.pitch), rotateY: 0 };
    }
    return { rotateX: clean(0 - camera.pitch), rotateY: clean(normalizeYaw(-camera.yaw)) };
};

/** A camera-space point as the world point the camera maps to it (the inverse of its affine part). */
const worldOfCameraPoint = (
    camera: CameraState,
    view: ViewSize,
    point: Vec3,
): Vec3 => {
    const centre = viewCenter(view);
    const local = transformDirectionTransposed(cameraRotation(camera.pitch, camera.yaw, camera.roll), {
        x: (point.x - centre.x - camera.offset.x) / camera.scale,
        y: (point.y - centre.y - camera.offset.y) / camera.scale,
        z: (point.z - camera.offset.z) / camera.scale,
    });
    return {
        x: camera.pivot.x + local.x,
        y: camera.pivot.y + local.y,
        z: camera.pivot.z + local.z,
    };
};


/**
 * THE WORLD PLACEMENT A PLANE OF THE RECT'S SIZE LANDS ON THE RECT WITH, under `camera`: face-on, at
 * the depth where one of its px is one screen px, its top-left under the rect's. `exact` says whether
 * the camera allows it (`facesCameraExactly`); otherwise the plane faces the camera as a dock pose
 * does, its top-left and its scale on the rect, turned off it by what two angles cannot undo.
 */
export const placementForRect = (
    camera: CameraState,
    view: ViewSize,
    rect: PluridScreenRect,
): { location: TreePlaneLocation; exact: boolean } => {
    const d = camera.perspective;
    const s = camera.scale;
    const centre = viewCenter(view);
    // `s·k = 1`: the depth at which a px of the plane is a px of the screen
    const z = d * (1 - s);
    const corner = {
        x: centre.x + (rect.left - centre.x) * s,
        y: centre.y + (rect.top - centre.y) * s,
        z,
    };
    const origin = worldOfCameraPoint(camera, view, corner);
    const rotation = facingRotation(camera);
    return {
        location: {
            translateX: origin.x,
            translateY: origin.y,
            translateZ: origin.z,
            rotateX: rotation.rotateX,
            rotateY: rotation.rotateY,
        },
        exact: facesCameraExactly(camera),
    };
};


/**
 * Where a plane is drawn now: the bounds of its projected corners in view px; `undefined` when a
 * corner is at or behind the eye (the plane has no bounded picture).
 */
export const projectedBounds = (
    camera: CameraState,
    view: ViewSize,
    plane: PlaneGeometry,
): PluridScreenRect | undefined => {
    const points = planeCorners(plane).map((corner) => project(camera, view, corner));
    if (points.some((point) => !point.visible)) {
        return undefined;
    }
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const left = Math.min(...xs);
    const top = Math.min(...ys);
    return {
        left,
        top,
        width: Math.max(...xs) - left,
        height: Math.max(...ys) - top,
    };
};


/** A plane of a stack: its size, and its own placement (`facing: 'keep'` keeps its turn). */
export interface StackedPlaneGeometry {
    width: number;
    height: number;
    location: TreePlaneLocation;
}

/** The default step, relative to the front plane: a title bar and a little down, a little right, and back in depth. */
export const defaultStackStep = (
    front: { width: number; height: number },
): PluridStackStep => ({
    x: Math.max(24, Math.round(front.width * 0.05)),
    y: PLANE_BAR_HEIGHT + Math.max(8, Math.round(front.height * 0.03)),
    z: Math.max(60, Math.round(front.width * 0.15)),
});

/**
 * THE STACK (2026-10-31): the planes one behind another in depth, the first in front. Each plane
 * stands `step` down-right of and nearer than the one behind it, along the camera's own axes, so
 * every title stays in view above and left of the plane in front; the stack's middle is the view's
 * centre at the pivot's depth. `facing: 'camera'` turns every plane to the camera (as `placementForRect`
 * does), `front` to the world's front, `keep` leaves each plane's turn.
 */
export const stackLocations = (
    camera: CameraState,
    view: ViewSize,
    planes: StackedPlaneGeometry[],
    step: PluridStackStep,
    facing: PluridStackFacing = 'camera',
): TreePlaneLocation[] => {
    if (planes.length === 0) {
        return [];
    }
    const centre = viewCenter(view);
    const s = camera.scale;
    const middle = (planes.length - 1) / 2;
    const cameraFacing = facingRotation(camera);

    return planes.map((plane, index) => {
        // camera space: the front plane down-right and nearest, each next one up-left and deeper
        const along = middle - index;
        const centreOfPlane = worldOfCameraPoint(camera, view, {
            x: centre.x + s * step.x * along,
            y: centre.y + s * step.y * along,
            z: camera.offset.z + s * step.z * along,
        });
        const rotation = facing === 'camera'
            ? cameraFacing
            : facing === 'front'
                ? { rotateX: 0, rotateY: 0 }
                : { rotateX: plane.location.rotateX, rotateY: plane.location.rotateY };
        // the plane turns about its top-left corner: the corner is its centre less half of it, turned
        const half = transformDirection(cameraRotation(rotation.rotateX, rotation.rotateY), {
            x: plane.width / 2,
            y: plane.height / 2,
            z: 0,
        });
        return {
            translateX: centreOfPlane.x - half.x,
            translateY: centreOfPlane.y - half.y,
            translateZ: centreOfPlane.z - half.z,
            rotateX: rotation.rotateX,
            rotateY: rotation.rotateY,
        };
    });
};
// #endregion module
