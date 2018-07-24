import { computeQuaternionFromEulers,
         quaternionMultiply,
         makeRotationMatrixFromQuaternion,
         rotatePointViaQuaternion,
         conjugateQuaternion } from "./quaternion";


export function rotateMatrix(xAngle, yAngle, zAngle = 0) {
    let xQuaternion = computeQuaternionFromEulers(0,        xAngle,          0);
    let xQuaternionPlus = computeQuaternionFromEulers(0,        xAngle + 5,          0);
    let yQuaternion = computeQuaternionFromEulers(0,             0,     yAngle);
    let zQuaternion = computeQuaternionFromEulers(zAngle,        0,          0);

    let quartenionMultiplication = quaternionMultiply([yQuaternion, xQuaternion]);


    // let rotateX = rotatePointViaQuaternion(xQuaternionPlus, xQuaternion);
    // let quat = {x: 0, y: 0, z: 0, w: 0};
    // let rotate = rotatePointViaQuaternion(quartenionMultiplication, quat);

    let rotationMatrix = makeRotationMatrixFromQuaternion(quartenionMultiplication);

    return rotationMatrix;
}


// Matrix Operations for Single Value (De-)Composition
// Sourced from https://github.com/gregtatum/mdn-webgl/blob/master/library/matrices.js
export function rotateXMatrix(a) {
    var cos = Math.cos;
    var sin = Math.sin;

    return [
         1,       0,        0,     0,
         0,  cos(a),  -sin(a),     0,
         0,  sin(a),   cos(a),     0,
         0,       0,        0,     1
    ];
}


export function rotateYMatrix(a) {
    var cos = Math.cos;
    var sin = Math.sin;

    return [
         cos(a),   0, sin(a),   0,
              0,   1,      0,   0,
        -sin(a),   0, cos(a),   0,
              0,   0,      0,   1
    ];
}


export function rotateZMatrix(a) {
    var cos = Math.cos;
    var sin = Math.sin;

    return [
        cos(a), -sin(a),    0,    0,
        sin(a),  cos(a),    0,    0,
             0,       0,    1,    0,
             0,       0,    0,    1
    ];
}


export function translateMatrix(x, y, z) {
	return [
	    1,    0,    0,   0,
	    0,    1,    0,   0,
	    0,    0,    1,   0,
	    x,    y,    z,   1
	];
}


export function scaleMatrix(s) {
	return [
	    s,    0,    0,   0,
	    0,    s,    0,   0,
	    0,    0,    s,   0,
	    0,    0,    0,   1
	];
}


export function multiplyMatrices(a, b) {
    // https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat4.js#L306-L337

    var result = [];

    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    // Cache only the current line of the second matrix
    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    result[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    result[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    result[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    result[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    result[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    result[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    result[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    result[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    result[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    result[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    result[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    result[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    result[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    result[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    result[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    result[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    return result;
}


export function multiplyArrayOfMatrices(matrices) {
    var inputMatrix = matrices[0];

    for(var i=1; i < matrices.length; i++) {
      inputMatrix = multiplyMatrices(inputMatrix, matrices[i]);
    }

    return inputMatrix;
}


// Create the matrix3d style property from a matrix array
export function matrixArrayToCssMatrix(array) {
    return 'matrix3d(' + array.join(',') + ')';
}
