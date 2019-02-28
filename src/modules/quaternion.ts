interface Quaternion {
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
const makeQuaternion = (
    x: number,
    y: number,
    z: number,
    w: number
): Quaternion => {
    return {
        x,
        y,
        z,
        w
    };
};

/**
 * Returns all-fields 0-ed quaternion.
 *
 * @returns {Quaternion}
 */
const zeroQuaternion = (): Quaternion => {
    return makeQuaternion(0, 0, 0, 0);
};

/**
 * Converts degrees to radians.
 *
 * @param deg
 * @returns radians
 */
const degToRad = (deg: number): number => {
    return (deg * Math.PI) / 180;
};

/**
 * Generates quaternion based on Euler angles (in degrees).
 *
 * @param alpha     around Z axis
 * @param beta      around X axis
 * @param gamma     around Y axis
 * @returns {Quaternion}
 */
export function computeQuaternionFromEulers(
    alpha: number,
    beta: number,
    gamma: number
): Quaternion {
    const x = degToRad(beta);
    const y = degToRad(gamma);
    const z = degToRad(alpha);

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
    angle: number
): Quaternion {
    const q: Quaternion = zeroQuaternion();
    const halfAngle = angle / 2;
    q.x = x * Math.sin(halfAngle);
    q.y = y * Math.sin(halfAngle);
    q.z = z * Math.sin(halfAngle);
    q.w = Math.cos(halfAngle);
    return q;
}

/**
 *
 * @param quaternion
 */
export function inverseQuaternion(quaternion: Quaternion): Quaternion {
    return makeQuaternion(
        quaternion.x,
        quaternion.y,
        quaternion.z,
        -quaternion.w
    );
}

/**
 *
 * @param quaternion
 */
export function conjugateQuaternion(quaternion: Quaternion): Quaternion {
    return makeQuaternion(
        -quaternion.x,
        -quaternion.y,
        -quaternion.z,
        quaternion.w
    );
}

/**
 *
 * @param quaternionArray
 */
export function quaternionMultiply(quaternionArray: Quaternion[]): Quaternion {
    const temporaryQuaternion: Quaternion = quaternionArray[0];
    const copyQuaternion: Quaternion = {
        x: temporaryQuaternion.x,
        y: temporaryQuaternion.y,
        z: temporaryQuaternion.z,
        w: temporaryQuaternion.w
    };

    for (let i = 1; i < quaternionArray.length; i++) {
        const secondaryTemporaryQuaternion: Quaternion = quaternionArray[i];
        const nextQuaternion: Quaternion = {
            x: secondaryTemporaryQuaternion.x,
            y: secondaryTemporaryQuaternion.y,
            z: secondaryTemporaryQuaternion.z,
            w: secondaryTemporaryQuaternion.w
        };

        const w =
            copyQuaternion.w * nextQuaternion.w -
            copyQuaternion.x * nextQuaternion.x -
            copyQuaternion.y * nextQuaternion.y -
            copyQuaternion.z * nextQuaternion.z;

        const x =
            copyQuaternion.x * nextQuaternion.w +
            copyQuaternion.w * nextQuaternion.x +
            copyQuaternion.y * nextQuaternion.z -
            copyQuaternion.z * nextQuaternion.y;

        const y =
            copyQuaternion.y * nextQuaternion.w +
            copyQuaternion.w * nextQuaternion.y +
            copyQuaternion.z * nextQuaternion.x -
            copyQuaternion.x * nextQuaternion.z;

        const z =
            copyQuaternion.z * nextQuaternion.w +
            copyQuaternion.w * nextQuaternion.z +
            copyQuaternion.x * nextQuaternion.y -
            copyQuaternion.y * nextQuaternion.x;

        copyQuaternion.x = x;
        copyQuaternion.y = y;
        copyQuaternion.z = z;
        copyQuaternion.w = w;
    }

    return copyQuaternion;
}

/**
 *
 * @param pointRotate
 * @param quaternion
 */
export function rotatePointViaQuaternion(
    pointRotate: any,
    quaternion: Quaternion
): Quaternion {
    const temporaryQuaternion: Quaternion = {
        x: pointRotate[0],
        y: pointRotate[1],
        z: pointRotate[2],
        w: 0
    };
    const rotatedPoint = quaternionMultiply([
        quaternion,
        temporaryQuaternion,
        conjugateQuaternion(quaternion)
    ]);

    return {
        x: rotatedPoint.x,
        y: rotatedPoint.y,
        z: rotatedPoint.z,
        w: rotatedPoint.w
    };
}

/**
 *
 * @param quaternion
 */
export function makeRotationMatrixFromQuaternion(quaternion: Quaternion) {
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
        1 - (num5 + num6),
        num7 - num12,
        num8 + num11,
        0,
        num7 + num12,
        1 - (num4 + num6),
        num9 - num10,
        0,
        num8 - num11,
        num9 + num10,
        1 - (num4 + num5),
        0,
        0,
        0,
        0,
        1
    ];
}
