// #region imports
    // #region libraries
    import type {
        PluridAnchorPose,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        multiplyMatrices,
    } from '../mathematics/matrix';
    // #endregion external


    // #region internal
    import type {
        Mat4,
        CameraState,
        CameraLimits,
        ViewSize,
        PlaneGeometry,
        Vec3,
    } from './types';
    import {
        DEFAULT_CAMERA_LIMITS,
        clampCamera,
        normalizeYaw,
    } from './state';
    import {
        cameraRotation,
        rotationXMatrix,
        rotationYMatrix,
        transformDirection,
        transformDirectionTransposed,
        viewCenter,
    } from './matrix';
    import {
        pickPlanePoint,
    } from './project';
    import {
        setPivot,
    } from './delta';
    // #endregion internal
// #endregion imports



// #region module
/**
 * THE CAMERA IN A PLANE'S FRAME (2026-10-30), following the `dock.ts` pattern: the dock pose is one
 * camera named by a plane; an anchor pose is any camera named by one.
 *
 * A plane draws its local point `x` at `origin + Rp·x` (`Rp = Rx(rotateX)·Ry(rotateY)`, about its
 * top-left corner, `planeBasis`), and the camera maps a world point `w` to
 * `C + offset + s·Rc·(w − pivot)`. With the pivot written in the plane's frame,
 * `pivot = origin + Rp·q`, the plane's points land at `C + offset + s·(Rc·Rp)·(x − q)`: the picture
 * of the plane depends on `Rc·Rp`, `s`, `q` and `offset` alone, never on where the plane is. Those
 * four are the pose. A plane that moved or turned is read by solving for the camera again:
 * `Rc = (Rc·Rp)·Rpᵀ`, `pivot = origin' + Rp'·q`.
 */

const RADIANS_TO_DEGREES = 180 / Math.PI;

/** a `-0` leaks into serialized anchors */
const clean = (
    value: number,
): number => (value === 0 ? 0 : value);

/** A rotation's degrees in the camera's composition: `R = Rz(roll) · Rx(pitch) · Ry(yaw)`. */
export interface RotationAngles {
    yaw: number;
    pitch: number;
    roll: number;
}

/**
 * The angles of a rotation matrix (column-major, its upper 3x3 a rotation) in the camera's
 * composition `Rz(roll) · Rx(pitch) · Ry(yaw)`. The matrix's third row is
 * `(−cos p · sin y, sin p, cos p · cos y)` and its second column `(−sin r · cos p, cos r · cos p, ·)`,
 * so the pitch is read off one entry and the yaw and the roll off two each. At a pitch of ±90° the
 * yaw and the roll turn about one axis and only their sum is defined: the roll is taken as 0 there,
 * which keeps a looking-straight-down camera a turntable's.
 */
export const rotationAngles = (
    matrix: Mat4,
): RotationAngles => {
    // element (row r, column c) of a column-major matrix is matrix[c * 4 + r]
    const sinPitch = Math.max(-1, Math.min(1, matrix[6]));
    const pitch = Math.asin(sinPitch);
    const cosPitch = Math.cos(pitch);

    if (cosPitch < 1e-9) {
        return {
            yaw: clean(normalizeYaw(Math.atan2(matrix[8], matrix[0]) * RADIANS_TO_DEGREES)),
            pitch: clean(pitch * RADIANS_TO_DEGREES),
            roll: 0,
        };
    }

    return {
        yaw: clean(normalizeYaw(Math.atan2(-matrix[2], matrix[10]) * RADIANS_TO_DEGREES)),
        pitch: clean(pitch * RADIANS_TO_DEGREES),
        roll: clean(normalizeYaw(Math.atan2(-matrix[4], matrix[5]) * RADIANS_TO_DEGREES)),
    };
};

/** The rotation a plane draws its content with (`planeBasis`). */
const planeRotation = (
    plane: Pick<PlaneGeometry, 'location'>,
): Mat4 => cameraRotation(plane.location.rotateX, plane.location.rotateY);

/** The inverse of a plane's rotation, `Ry(−rotateY) · Rx(−rotateX)`. */
const planeRotationInverse = (
    plane: Pick<PlaneGeometry, 'location'>,
): Mat4 => multiplyMatrices(
    rotationYMatrix(-plane.location.rotateY),
    rotationXMatrix(-plane.location.rotateX),
);

const planeOrigin = (
    plane: Pick<PlaneGeometry, 'location'>,
): Vec3 => ({
    x: plane.location.translateX,
    y: plane.location.translateY,
    z: plane.location.translateZ,
});


/**
 * THE POSE OF A CAMERA ON A PLANE: `camera` taken into `plane`'s frame. The camera is first
 * re-pivoted, losslessly (`setPivot`), on the point of the plane under the view centre, so the pose
 * reads as "this point of the plane, from these angles, at this zoom": its pivot lies on the plane
 * (`z` 0) and its offset pans by nothing. A plane seen edge-on, or behind the eye, has no such point,
 * and the camera's own pivot is taken in.
 */
export const poseOnPlane = (
    camera: CameraState,
    plane: PlaneGeometry,
    view: ViewSize,
): PluridAnchorPose => {
    const centre = viewCenter(view);
    const pick = pickPlanePoint(camera, view, plane, { x: centre.x, y: centre.y });
    const pivoted = pick ? setPivot(camera, pick.world) : camera;

    const relative = rotationAngles(multiplyMatrices(
        cameraRotation(pivoted.pitch, pivoted.yaw, pivoted.roll),
        planeRotation(plane),
    ));
    const origin = planeOrigin(plane);
    const local = transformDirectionTransposed(planeRotation(plane), {
        x: pivoted.pivot.x - origin.x,
        y: pivoted.pivot.y - origin.y,
        z: pivoted.pivot.z - origin.z,
    });
    // the re-pivot puts the pivot on the ray through the view centre: what pans is noise
    const onAxis = !!pick;

    return {
        yaw: relative.yaw,
        pitch: relative.pitch,
        roll: relative.roll,
        scale: pivoted.scale,
        pivot: {
            x: clean(local.x),
            y: clean(local.y),
            z: onAxis ? 0 : clean(local.z),
        },
        offset: {
            x: onAxis ? 0 : clean(pivoted.offset.x),
            y: onAxis ? 0 : clean(pivoted.offset.y),
            z: clean(pivoted.offset.z),
        },
    };
};


/**
 * THE CAMERA OF A POSE ON A PLANE, wherever the plane is now: the angles turned back out of the
 * plane's frame, the pivot placed on the plane. `camera` gives what the pose does not hold (the
 * perspective) and the fallback of the finite gate. The orbit's pitch limit never clamps it: a pose
 * on a tilted plane is reached as recorded, as a dock pose is.
 */
export const cameraFromPose = (
    pose: PluridAnchorPose,
    plane: Pick<PlaneGeometry, 'location'>,
    camera: CameraState,
    limits: CameraLimits = DEFAULT_CAMERA_LIMITS,
): CameraState => {
    const angles = rotationAngles(multiplyMatrices(
        cameraRotation(pose.pitch, pose.yaw, pose.roll ?? 0),
        planeRotationInverse(plane),
    ));
    const origin = planeOrigin(plane);
    const along = transformDirection(planeRotation(plane), pose.pivot);
    const offset = pose.offset ?? { x: 0, y: 0, z: 0 };

    return clampCamera(
        {
            ...camera,
            yaw: angles.yaw,
            pitch: angles.pitch,
            roll: angles.roll,
            scale: pose.scale,
            pivot: {
                x: origin.x + along.x,
                y: origin.y + along.y,
                z: origin.z + along.z,
            },
            offset: {
                x: offset.x,
                y: offset.y,
                z: offset.z,
            },
        },
        { ...limits, pitchLimit: Math.max(limits.pitchLimit, Math.abs(angles.pitch)) },
        camera,
    );
};


/** Two poses that draw the same picture of their plane: the angles within `angle` degrees, the zoom within 1e-3, the points within `distance` px. */
export const samePose = (
    a: PluridAnchorPose,
    b: PluridAnchorPose,
    angle = 1e-3,
    distance = 0.5,
): boolean => {
    const offsetA = a.offset ?? { x: 0, y: 0, z: 0 };
    const offsetB = b.offset ?? { x: 0, y: 0, z: 0 };
    return Math.abs(normalizeYaw(a.yaw - b.yaw)) <= angle
        && Math.abs(a.pitch - b.pitch) <= angle
        && Math.abs(normalizeYaw((a.roll ?? 0) - (b.roll ?? 0))) <= angle
        && Math.abs(a.scale - b.scale) <= 1e-3
        && Math.abs(a.pivot.x - b.pivot.x) <= distance
        && Math.abs(a.pivot.y - b.pivot.y) <= distance
        && Math.abs(a.pivot.z - b.pivot.z) <= distance
        && Math.abs(offsetA.x - offsetB.x) <= distance
        && Math.abs(offsetA.y - offsetB.y) <= distance
        && Math.abs(offsetA.z - offsetB.z) <= distance;
};
// #endregion module
