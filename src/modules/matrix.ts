import {
    computeQuaternionFromEulers,
    // conjugateQuaternion,
    // inverseQuaternion,
    makeRotationMatrixFromQuaternion,
    // quaternionFromAxisAngle,
    quaternionMultiply
    // rotatePointViaQuaternion,
} from './quaternion';



/**
 *
 * @param xAngle
 * @param yAngle
 * @param zAngle
 */
export function rotateMatrix(
    xAngle: number, yAngle: number, zAngle: number = 0
): Array<number> {
    const xQuaternion = computeQuaternionFromEulers(0,       xAngle,        0);
    const yQuaternion = computeQuaternionFromEulers(0,            0,   yAngle);
    const zQuaternion = computeQuaternionFromEulers(zAngle,       0,        0);

    const quartenionMultiplication = quaternionMultiply([
        yQuaternion,
        xQuaternion,
        zQuaternion
    ]);
    const rotationMatrix = makeRotationMatrixFromQuaternion(
        quartenionMultiplication
    );

    console.log('rotationMatrix', rotationMatrix);
    return rotationMatrix;
}


/**
 *
 * @param x
 * @param y
 * @param z
 */
export function translateMatrix(x: number, y: number, z: number): Array<number> {
    return [
        1,    0,    0,   0,
        0,    1,    0,   0,
        0,    0,    1,   0,
        x,    y,    z,   1
    ];
}


/**
 *
 * @param s
 */
export function scaleMatrix(s: number): Array<number> {
    return [
        s,    0,    0,   0,
        0,    s,    0,   0,
        0,    0,    s,   0,
        0,    0,    0,   1
    ];
}


/**
 *
 * @param matrixA
 * @param matrixB
 */
export function multiplyMatrices(matrixA: Array<number>, matrixB: Array<number>): Array<number> {
    // https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat4.js#L306-L337
    const result = [];

    const a00 = matrixA[0];
    const a01 = matrixA[1];
    const a02 = matrixA[2];
    const a03 = matrixA[3];
    const a10 = matrixA[4];
    const a11 = matrixA[5];
    const a12 = matrixA[6];
    const a13 = matrixA[7];
    const a20 = matrixA[8];
    const a21 = matrixA[9];
    const a22 = matrixA[10];
    const a23 = matrixA[11];
    const a30 = matrixA[12];
    const a31 = matrixA[13];
    const a32 = matrixA[14];
    const a33 = matrixA[15];

    // Cache only the current line of the second matrix
    let b0 = matrixB[0];
    let b1 = matrixB[1];
    let b2 = matrixB[2];
    let b3 = matrixB[3];
    result[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    result[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    result[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    result[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = matrixB[4];
    b1 = matrixB[5];
    b2 = matrixB[6];
    b3 = matrixB[7];
    result[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    result[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    result[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    result[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = matrixB[8];
    b1 = matrixB[9];
    b2 = matrixB[10];
    b3 = matrixB[11];
    result[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    result[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    result[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    result[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = matrixB[12];
    b1 = matrixB[13];
    b2 = matrixB[14];
    b3 = matrixB[15];
    result[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    result[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    result[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    result[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    return result;
}


/**
 *
 * @param matrices
 */
export function multiplyArrayOfMatrices(matrices: Array<Array<number>>): Array<number> {
    let inputMatrix = matrices[0];

    for (let i = 1; i < matrices.length; i++) {
        inputMatrix = multiplyMatrices(inputMatrix, matrices[i]);
    }

    return inputMatrix;
}

// Create the matrix3d style property from a matrix array
export function matrixArrayToCSSMatrix(array: Array<number>): string {
    return 'matrix3d(' + array.join(',') + ')';
}
