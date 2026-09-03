// #region imports
    // #region external
    import {
        multiplyMatrices,
        multiplyArrayOfMatrices,
        translateMatrix,
        scaleMatrix,
        matrixArrayToCSSMatrix,
    } from '../mathematics/matrix';
    // #endregion external


    // #region internal
    import type {
        Mat4,
        CameraState,
        ViewSize,
        Vec3,
    } from './types';
    // #endregion internal
// #endregion imports



// #region module
const DEG_TO_RAD = Math.PI / 180;


/**
 * CSS `rotateX(deg)` as a column-major matrix. Pinned to the CSS definition (y' = y·cos − z·sin,
 * z' = y·sin + z·cos) so the engine's math and the browser's agree exactly.
 */
export const rotationXMatrix = (
    degrees: number,
): Mat4 => {
    const radians = degrees * DEG_TO_RAD;
    const c = Math.cos(radians);
    const s = Math.sin(radians);

    return [
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1,
    ];
};


/**
 * CSS `rotateY(deg)` as a column-major matrix (x' = x·cos + z·sin, z' = −x·sin + z·cos).
 */
export const rotationYMatrix = (
    degrees: number,
): Mat4 => {
    const radians = degrees * DEG_TO_RAD;
    const c = Math.cos(radians);
    const s = Math.sin(radians);

    return [
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1,
    ];
};


/** The turntable rotation `Rx(pitch) · Ry(yaw)` — the same composition CSS applies for `rotateX() rotateY()`. */
export const cameraRotation = (
    pitch: number,
    yaw: number,
): Mat4 => multiplyMatrices(
    rotationXMatrix(pitch),
    rotationYMatrix(yaw),
);


export const viewCenter = (
    view: ViewSize,
): Vec3 => ({
    x: view.width / 2,
    y: view.height / 2,
    z: 0,
});


/**
 * The camera matrix `T(C + offset) · Rx(pitch) · Ry(yaw) · S(scale) · T(−pivot)`: world → camera
 * space (the roots container's coordinates, before the CSS perspective divide).
 */
export const cameraMatrix = (
    camera: CameraState,
    view: ViewSize,
): Mat4 => {
    const center = viewCenter(view);

    return multiplyArrayOfMatrices([
        translateMatrix(
            center.x + camera.offset.x,
            center.y + camera.offset.y,
            camera.offset.z,
        ),
        rotationXMatrix(camera.pitch),
        rotationYMatrix(camera.yaw),
        scaleMatrix(camera.scale),
        translateMatrix(-camera.pivot.x, -camera.pivot.y, -camera.pivot.z),
    ]);
};


/** General 4x4 inverse (column-major). Returns the identity for a singular matrix. */
export const invertMatrix = (
    m: Mat4,
): Mat4 => {
    const [
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        a30, a31, a32, a33,
    ] = m;

    const b00 = a00 * a11 - a01 * a10;
    const b01 = a00 * a12 - a02 * a10;
    const b02 = a00 * a13 - a03 * a10;
    const b03 = a01 * a12 - a02 * a11;
    const b04 = a01 * a13 - a03 * a11;
    const b05 = a02 * a13 - a03 * a12;
    const b06 = a20 * a31 - a21 * a30;
    const b07 = a20 * a32 - a22 * a30;
    const b08 = a20 * a33 - a23 * a30;
    const b09 = a21 * a32 - a22 * a31;
    const b10 = a21 * a33 - a23 * a31;
    const b11 = a22 * a33 - a23 * a32;

    let determinant = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!determinant) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    }
    determinant = 1 / determinant;

    return [
        (a11 * b11 - a12 * b10 + a13 * b09) * determinant,
        (a02 * b10 - a01 * b11 - a03 * b09) * determinant,
        (a31 * b05 - a32 * b04 + a33 * b03) * determinant,
        (a22 * b04 - a21 * b05 - a23 * b03) * determinant,
        (a12 * b08 - a10 * b11 - a13 * b07) * determinant,
        (a00 * b11 - a02 * b08 + a03 * b07) * determinant,
        (a32 * b02 - a30 * b05 - a33 * b01) * determinant,
        (a20 * b05 - a22 * b02 + a23 * b01) * determinant,
        (a10 * b10 - a11 * b08 + a13 * b06) * determinant,
        (a01 * b08 - a00 * b10 - a03 * b06) * determinant,
        (a30 * b04 - a31 * b02 + a33 * b00) * determinant,
        (a21 * b02 - a20 * b04 - a23 * b00) * determinant,
        (a11 * b07 - a10 * b09 - a12 * b06) * determinant,
        (a00 * b09 - a01 * b07 + a02 * b06) * determinant,
        (a31 * b01 - a30 * b03 - a32 * b00) * determinant,
        (a20 * b03 - a21 * b01 + a22 * b00) * determinant,
    ];
};


export const cameraInverse = (
    camera: CameraState,
    view: ViewSize,
): Mat4 => invertMatrix(cameraMatrix(camera, view));


/** Apply a column-major matrix to a point (with the homogeneous divide). */
export const transformPoint = (
    m: Mat4,
    p: Vec3,
): Vec3 => {
    const x = m[0] * p.x + m[4] * p.y + m[8] * p.z + m[12];
    const y = m[1] * p.x + m[5] * p.y + m[9] * p.z + m[13];
    const z = m[2] * p.x + m[6] * p.y + m[10] * p.z + m[14];
    const w = m[3] * p.x + m[7] * p.y + m[11] * p.z + m[15];

    if (w === 1 || w === 0) {
        return { x, y, z };
    }

    return {
        x: x / w,
        y: y / w,
        z: z / w,
    };
};


/** Apply only the linear part of a matrix (directions ignore translation). */
export const transformDirection = (
    m: Mat4,
    v: Vec3,
): Vec3 => ({
    x: m[0] * v.x + m[4] * v.y + m[8] * v.z,
    y: m[1] * v.x + m[5] * v.y + m[9] * v.z,
    z: m[2] * v.x + m[6] * v.y + m[10] * v.z,
});


/** Apply the TRANSPOSE of the linear 3x3 block — the inverse of a pure rotation. */
export const transformDirectionTransposed = (
    m: Mat4,
    v: Vec3,
): Vec3 => ({
    x: m[0] * v.x + m[1] * v.y + m[2] * v.z,
    y: m[4] * v.x + m[5] * v.y + m[6] * v.z,
    z: m[8] * v.x + m[9] * v.y + m[10] * v.z,
});


// One-entry cache: the reducer commits the same camera through several actions per frame at most,
// and consumers re-derive the string from the same state object repeatedly.
let cachedKey = '';
let cachedMatrix3d = '';

const cacheKey = (
    camera: CameraState,
    view: ViewSize,
): string => (
    camera.yaw + '|' + camera.pitch + '|' + camera.scale + '|'
    + camera.pivot.x + '|' + camera.pivot.y + '|' + camera.pivot.z + '|'
    + camera.offset.x + '|' + camera.offset.y + '|' + camera.offset.z + '|'
    + view.width + '|' + view.height
);


/** The `matrix3d(...)` string the roots container renders with. */
export const cameraMatrix3d = (
    camera: CameraState,
    view: ViewSize,
): string => {
    const key = cacheKey(camera, view);
    if (key === cachedKey) {
        return cachedMatrix3d;
    }

    cachedKey = key;
    cachedMatrix3d = matrixArrayToCSSMatrix(cameraMatrix(camera, view));

    return cachedMatrix3d;
};


export const IDENTITY_MATRIX3D = 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)';
// #endregion module
