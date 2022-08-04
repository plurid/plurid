// #region module
/**
 * Converts degrees to radians.
 *
 * @param deg
 * @returns radians
 */
export const degToRad = (
    deg: number,
): number => {
    // return deg * Math.PI / 180;
    return deg * 0.01745329252;
};

/**
 * Converts radians to degrees.
 *
 * @param deg
 * @returns degrees
 */
export const radToDeg = (
    rad: number,
): number => {
    // return rad * 180 / Math.PI;
    return rad * 57.2957795131;
};



export interface Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
}

/**
 *
 * @param x
 * @param y
 * @param z
 * @param w
 * @returns {Quaternion}
 */
export const makeQuaternion = (
    x: number,
    y: number,
    z: number,
    w: number,
): Quaternion => {
    return {
        x,
        y,
        z,
        w,
    };
};

/**
 * Returns all-fields 0-ed quaternion.
 *
 * @returns {Quaternion}
 */
export const zeroQuaternion = (): Quaternion => {
    return makeQuaternion(0, 0, 0, 0);
};

/**
 *
 * @param quaternion
 */
export function inverseQuaternion(
    quaternion: Quaternion,
): Quaternion {
    return makeQuaternion(
        quaternion.x,
        quaternion.y,
        quaternion.z,
        -quaternion.w,
    );
}

/**
 *
 * @param quaternion
 */
export function conjugateQuaternion(
    quaternion: Quaternion,
): Quaternion {
    return makeQuaternion(
        -quaternion.x,
        -quaternion.y,
        -quaternion.z,
        quaternion.w,
    );
}

/**
 * Generates quaternion based on Euler angles (in radians).
 *
 * @param alpha     around Z axis
 * @param beta      around X axis
 * @param gamma     around Y axis
 * @returns {Quaternion}
 */
export function computeQuaternionFromEulers(
    alpha: number,
    beta: number,
    gamma: number,
    radians = true,
): Quaternion {
    const x = radians ? beta : degToRad(beta);
    const y = radians ? gamma : degToRad(gamma);
    const z = radians ? alpha : degToRad(alpha);

    const cX = Math.cos(x / 2);
    const cY = Math.cos(y / 2);
    const cZ = Math.cos(z / 2);
    const sX = Math.sin(x / 2);
    const sY = Math.sin(y / 2);
    const sZ = Math.sin(z / 2);

    const xQ = sX * cY * cZ - cX * sY * sZ;
    const yQ = cX * sY * cZ + sX * cY * sZ;
    const zQ = cX * cY * sZ + sX * sY * cZ;
    const wQ = cX * cY * cZ - sX * sY * sZ;

    return makeQuaternion(xQ, yQ, zQ, wQ);
}

/**
 *
 * @param x
 * @param y
 * @param z
 * @param angle
 */
export function quaternionFromAxisAngle(
    x: number,
    y: number,
    z: number,
    angle: number,
): Quaternion {
    const q: Quaternion = zeroQuaternion();
    const halfAngle = angle / 2;
    const sine = Math.sin(halfAngle);

    q.x = x * sine;
    q.y = y * sine;
    q.z = z * sine;
    q.w = Math.cos(halfAngle);

    return q;
}

/**
 *
 * @param quaternionArray
 */
export function quaternionMultiply(
    quaternionArray: Quaternion[],
): Quaternion {
    const firstQuaternion: Quaternion = quaternionArray[0];
    const valueQuaternion: Quaternion = {
        ...firstQuaternion,
    };

    for (let i = 1; i < quaternionArray.length; i++) {
        const nextQuaternion: Quaternion = quaternionArray[i];

        const w =
            valueQuaternion.w * nextQuaternion.w -
            valueQuaternion.x * nextQuaternion.x -
            valueQuaternion.y * nextQuaternion.y -
            valueQuaternion.z * nextQuaternion.z;

        const x =
            valueQuaternion.x * nextQuaternion.w +
            valueQuaternion.w * nextQuaternion.x +
            valueQuaternion.y * nextQuaternion.z -
            valueQuaternion.z * nextQuaternion.y;

        const y =
            valueQuaternion.y * nextQuaternion.w +
            valueQuaternion.w * nextQuaternion.y +
            valueQuaternion.z * nextQuaternion.x -
            valueQuaternion.x * nextQuaternion.z;

        const z =
            valueQuaternion.z * nextQuaternion.w +
            valueQuaternion.w * nextQuaternion.z +
            valueQuaternion.x * nextQuaternion.y -
            valueQuaternion.y * nextQuaternion.x;

        valueQuaternion.x = x;
        valueQuaternion.y = y;
        valueQuaternion.z = z;
        valueQuaternion.w = w;
    }

    return valueQuaternion;
}

/**
 *
 * @param pointRotate
 * @param quaternion
 */
export function rotatePointViaQuaternion(
    pointRotate: [number, number, number],
    quaternion: Quaternion,
): Quaternion {
    const temporaryQuaternion: Quaternion = {
        x: pointRotate[0],
        y: pointRotate[1],
        z: pointRotate[2],
        w: 0,
    };
    const rotatedPointQuaternion = quaternionMultiply([
        quaternion,
        temporaryQuaternion,
        conjugateQuaternion(quaternion),
    ]);

    return rotatedPointQuaternion;
}

/**
 *
 * @param quaternion
 */
export function makeRotationMatrixFromQuaternion(
    quaternion: Quaternion,
) {
    const num = quaternion.x * 2;
    const num2 = quaternion.y * 2;
    const num3 = quaternion.z * 2;
    const num4 = quaternion.x * num;
    const num5 = quaternion.y * num2;
    const num6 = quaternion.z * num3;
    const num7 = quaternion.x * num2;
    const num8 = quaternion.x * num3;
    const num9 = quaternion.y * num3;
    const num10 = quaternion.w * num;
    const num11 = quaternion.w * num2;
    const num12 = quaternion.w * num3;

    return [
        1 - (num5 + num6),      num7 - num12,           num8 + num11,           0,
        num7 + num12,           1 - (num4 + num6),      num9 - num10,           0,
        num8 - num11,           num9 + num10,           1 - (num4 + num5),      0,
        0,                      0,                      0,                      1,
    ];
}
// #endregion module
