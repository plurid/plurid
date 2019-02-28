import {
    computeQuaternionFromEulers,
    // conjugateQuaternion,
    // inverseQuaternion,
    makeRotationMatrixFromQuaternion,
    // quaternionFromAxisAngle,
    quaternionMultiply
    // rotatePointViaQuaternion,
} from './quaternion';

export function rotateMatrix(xAngle: any, yAngle: any, zAngle: any = 0) {
    const xQuaternion = computeQuaternionFromEulers(0, xAngle, 0);
    const yQuaternion = computeQuaternionFromEulers(0, 0, yAngle);
    const zQuaternion = computeQuaternionFromEulers(zAngle, 0, 0);

    const quartenionMultiplication = quaternionMultiply([
        yQuaternion,
        xQuaternion,
        zQuaternion
    ]);
    const rotationMatrix = makeRotationMatrixFromQuaternion(
        quartenionMultiplication
    );
    return rotationMatrix;
}

export function translateMatrix(x: any, y: any, z: any) {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
}

export function scaleMatrix(s: any) {
    return [s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1];
}

export function multiplyMatrices(a: any, b: any) {
    // https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat4.js#L306-L337

    const result = [];

    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a03 = a[3];
    const a10 = a[4];
    const a11 = a[5];
    const a12 = a[6];
    const a13 = a[7];
    const a20 = a[8];
    const a21 = a[9];
    const a22 = a[10];
    const a23 = a[11];
    const a30 = a[12];
    const a31 = a[13];
    const a32 = a[14];
    const a33 = a[15];

    // Cache only the current line of the second matrix
    let b0 = b[0];
    let b1 = b[1];
    let b2 = b[2];
    let b3 = b[3];
    result[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    result[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    result[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    result[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];
    result[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    result[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    result[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    result[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];
    result[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    result[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    result[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    result[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];
    result[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    result[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    result[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    result[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    return result;
}

export function multiplyArrayOfMatrices(matrices: any) {
    let inputMatrix = matrices[0];

    for (let i = 1; i < matrices.length; i++) {
        inputMatrix = multiplyMatrices(inputMatrix, matrices[i]);
    }

    return inputMatrix;
}

// Create the matrix3d style property from a matrix array
export function matrixArrayToCssMatrix(array: any) {
    return 'matrix3d(' + array.join(',') + ')';
}
