"use strict";
exports.__esModule = true;
var quaternion_1 = require("./quaternion");
function rotateMatrix(xAngle, yAngle, zAngle) {
    if (zAngle === void 0) { zAngle = 0; }
    var xQuaternion = quaternion_1.computeQuaternionFromEulers(0, xAngle, 0);
    var yQuaternion = quaternion_1.computeQuaternionFromEulers(0, 0, yAngle);
    var zQuaternion = quaternion_1.computeQuaternionFromEulers(zAngle, 0, 0);
    var quartenionMultiplication = quaternion_1.quaternionMultiply([
        yQuaternion,
        xQuaternion,
        zQuaternion,
    ]);
    var rotationMatrix = quaternion_1.makeRotationMatrixFromQuaternion(quartenionMultiplication);
    return rotationMatrix;
}
exports.rotateMatrix = rotateMatrix;
function translateMatrix(x, y, z) {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1,
    ];
}
exports.translateMatrix = translateMatrix;
function scaleMatrix(s) {
    return [
        s, 0, 0, 0,
        0, s, 0, 0,
        0, 0, s, 0,
        0, 0, 0, 1,
    ];
}
exports.scaleMatrix = scaleMatrix;
function multiplyMatrices(matrixA, matrixB) {
    var result = [];
    var a00 = matrixA[0];
    var a01 = matrixA[1];
    var a02 = matrixA[2];
    var a03 = matrixA[3];
    var a10 = matrixA[4];
    var a11 = matrixA[5];
    var a12 = matrixA[6];
    var a13 = matrixA[7];
    var a20 = matrixA[8];
    var a21 = matrixA[9];
    var a22 = matrixA[10];
    var a23 = matrixA[11];
    var a30 = matrixA[12];
    var a31 = matrixA[13];
    var a32 = matrixA[14];
    var a33 = matrixA[15];
    var b0 = matrixB[0];
    var b1 = matrixB[1];
    var b2 = matrixB[2];
    var b3 = matrixB[3];
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
exports.multiplyMatrices = multiplyMatrices;
function multiplyArrayOfMatrices(matrices) {
    var inputMatrix = matrices[0];
    for (var i = 1; i < matrices.length; i++) {
        inputMatrix = multiplyMatrices(inputMatrix, matrices[i]);
    }
    return inputMatrix;
}
exports.multiplyArrayOfMatrices = multiplyArrayOfMatrices;
function matrixArrayToCSSMatrix(array) {
    return 'matrix3d(' + array.join(',') + ')';
}
exports.matrixArrayToCSSMatrix = matrixArrayToCSSMatrix;
//# sourceMappingURL=matrix.js.map