"use strict";
exports.__esModule = true;
exports.degToRad = function (deg) {
    return deg * 0.01745329252;
};
exports.radToDeg = function (rad) {
    return rad * 57.2957795131;
};
exports.makeQuaternion = function (x, y, z, w) {
    return {
        x: x,
        y: y,
        z: z,
        w: w
    };
};
exports.zeroQuaternion = function () {
    return exports.makeQuaternion(0, 0, 0, 0);
};
function inverseQuaternion(quaternion) {
    return exports.makeQuaternion(quaternion.x, quaternion.y, quaternion.z, -quaternion.w);
}
exports.inverseQuaternion = inverseQuaternion;
function conjugateQuaternion(quaternion) {
    return exports.makeQuaternion(-quaternion.x, -quaternion.y, -quaternion.z, quaternion.w);
}
exports.conjugateQuaternion = conjugateQuaternion;
function computeQuaternionFromEulers(alpha, beta, gamma) {
    var x = beta;
    var y = gamma;
    var z = alpha;
    var cX = Math.cos(x / 2);
    var cY = Math.cos(y / 2);
    var cZ = Math.cos(z / 2);
    var sX = Math.sin(x / 2);
    var sY = Math.sin(y / 2);
    var sZ = Math.sin(z / 2);
    var xQ = sX * cY * cZ - cX * sY * sZ;
    var yQ = cX * sY * cZ + sX * cY * sZ;
    var zQ = cX * cY * sZ + sX * sY * cZ;
    var wQ = cX * cY * cZ - sX * sY * sZ;
    return exports.makeQuaternion(xQ, yQ, zQ, wQ);
}
exports.computeQuaternionFromEulers = computeQuaternionFromEulers;
function quaternionFromAxisAngle(x, y, z, angle) {
    var q = exports.zeroQuaternion();
    var halfAngle = angle / 2;
    q.x = x * Math.sin(halfAngle);
    q.y = y * Math.sin(halfAngle);
    q.z = z * Math.sin(halfAngle);
    q.w = Math.cos(halfAngle);
    return q;
}
exports.quaternionFromAxisAngle = quaternionFromAxisAngle;
function quaternionMultiply(quaternionArray) {
    var temporaryQuaternion = quaternionArray[0];
    var copyQuaternion = {
        x: temporaryQuaternion.x,
        y: temporaryQuaternion.y,
        z: temporaryQuaternion.z,
        w: temporaryQuaternion.w
    };
    for (var i = 1; i < quaternionArray.length; i++) {
        var secondaryTemporaryQuaternion = quaternionArray[i];
        var nextQuaternion = {
            x: secondaryTemporaryQuaternion.x,
            y: secondaryTemporaryQuaternion.y,
            z: secondaryTemporaryQuaternion.z,
            w: secondaryTemporaryQuaternion.w
        };
        var w = copyQuaternion.w * nextQuaternion.w -
            copyQuaternion.x * nextQuaternion.x -
            copyQuaternion.y * nextQuaternion.y -
            copyQuaternion.z * nextQuaternion.z;
        var x = copyQuaternion.x * nextQuaternion.w +
            copyQuaternion.w * nextQuaternion.x +
            copyQuaternion.y * nextQuaternion.z -
            copyQuaternion.z * nextQuaternion.y;
        var y = copyQuaternion.y * nextQuaternion.w +
            copyQuaternion.w * nextQuaternion.y +
            copyQuaternion.z * nextQuaternion.x -
            copyQuaternion.x * nextQuaternion.z;
        var z = copyQuaternion.z * nextQuaternion.w +
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
exports.quaternionMultiply = quaternionMultiply;
function rotatePointViaQuaternion(pointRotate, quaternion) {
    var temporaryQuaternion = {
        x: pointRotate[0],
        y: pointRotate[1],
        z: pointRotate[2],
        w: 0
    };
    var rotatedPoint = quaternionMultiply([
        quaternion,
        temporaryQuaternion,
        conjugateQuaternion(quaternion),
    ]);
    return {
        x: rotatedPoint.x,
        y: rotatedPoint.y,
        z: rotatedPoint.z,
        w: rotatedPoint.w
    };
}
exports.rotatePointViaQuaternion = rotatePointViaQuaternion;
function makeRotationMatrixFromQuaternion(quaternion) {
    var num = quaternion.x * 2;
    var num2 = quaternion.y * 2;
    var num3 = quaternion.z * 2;
    var num4 = quaternion.x * num;
    var num5 = quaternion.y * num2;
    var num6 = quaternion.z * num3;
    var num7 = quaternion.x * num2;
    var num8 = quaternion.x * num3;
    var num9 = quaternion.y * num3;
    var num10 = quaternion.w * num;
    var num11 = quaternion.w * num2;
    var num12 = quaternion.w * num3;
    return [
        1 - (num5 + num6), num7 - num12, num8 + num11, 0,
        num7 + num12, 1 - (num4 + num6), num9 - num10, 0,
        num8 - num11, num9 + num10, 1 - (num4 + num5), 0,
        0, 0, 0, 1,
    ];
}
exports.makeRotationMatrixFromQuaternion = makeRotationMatrixFromQuaternion;
//# sourceMappingURL=quaternion.js.map