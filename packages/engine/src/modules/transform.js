"use strict";
exports.__esModule = true;
var matrix_1 = require("./matrix");
function getMatrixValues(matrix3d) {
    var matrixValues = matrix3d.split('(')[1].split(')')[0].split(',');
    var matrixValuesInt = [];
    for (var i = 0; i < matrixValues.length; i++) {
        matrixValuesInt[i] = parseFloat(matrixValues[i]);
    }
    return matrixValuesInt;
}
exports.getMatrixValues = getMatrixValues;
function getRotationMatrix(matrix3d) {
    var valuesMatrix = getMatrixValues(matrix3d);
    var scale = getScalationValue(matrix3d);
    if (valuesMatrix.length === 16) {
        for (var i = 0; i < 11; i++) {
            valuesMatrix[i] /= scale;
        }
    }
    else if (valuesMatrix.length === 6) {
        for (var i = 0; i < 4; i++) {
            valuesMatrix[i] /= scale;
        }
    }
    var rotationMatrix = valuesMatrix;
    return rotationMatrix;
}
exports.getRotationMatrix = getRotationMatrix;
function getTranslationMatrix(matrix3d) {
    var valuesMatrix = getMatrixValues(matrix3d);
    var translationMatrix;
    if (valuesMatrix.length === 16) {
        translationMatrix = getMatrixValues(matrix3d).slice(12, 15);
    }
    else if (valuesMatrix.length === 6) {
        translationMatrix = getMatrixValues(matrix3d).slice(4);
    }
    return translationMatrix;
}
exports.getTranslationMatrix = getTranslationMatrix;
function getScalationValue(matrix3d) {
    var valuesMatrix = getMatrixValues(matrix3d);
    var temp = 0;
    var scale;
    if (valuesMatrix.length === 16) {
        var scaleMatrix_2 = getMatrixValues(matrix3d).slice(0, 4);
        scale = 0;
        for (var _i = 0, scaleMatrix_1 = scaleMatrix_2; _i < scaleMatrix_1.length; _i++) {
            var el = scaleMatrix_1[_i];
            scale += parseFloat(el) * parseFloat(el);
        }
        scale = parseFloat(Math.sqrt(scale).toPrecision(4));
    }
    else if (valuesMatrix.length === 6) {
        temp = valuesMatrix[0] * valuesMatrix[0] + valuesMatrix[1] * valuesMatrix[1];
        scale = parseFloat(Math.sqrt(temp).toPrecision(4));
    }
    return scale;
}
exports.getScalationValue = getScalationValue;
function setTransform(rotationMatrix, translationMatrix, scalationMatrix) {
    var transformMatrix = matrix_1.multiplyArrayOfMatrices([
        translationMatrix,
        rotationMatrix,
        scalationMatrix,
    ]);
    return matrix_1.matrixArrayToCSSMatrix(transformMatrix);
}
exports.setTransform = setTransform;
function getTransformRotate(matrix3d) {
    var pi = Math.PI;
    var values = getRotationMatrix(matrix3d);
    var rotateX = 0;
    var rotateY = 0;
    var thetaX = 0;
    var thetaY = 0;
    var thetaZ = 0;
    if (values.length === 6) {
        var cosa = values[0];
        var sina = values[1];
        if (cosa === 1 && sina === 0) {
            rotateX = Math.asin(sina);
            rotateY = Math.acos(cosa);
        }
    }
    if (values.length === 16) {
        thetaZ = Math.asin(-1 * values[1]);
        thetaX = Math.atan2(values[9], values[5]);
        thetaY = Math.atan2(values[2], values[0]);
        var cosaX1 = values[5];
        var sinaX3 = values[9];
        if (sinaX3 <= 0) {
            rotateX = Math.acos(cosaX1);
        }
        if (sinaX3 > 0) {
            rotateX = 2 * pi - Math.acos(cosaX1);
        }
        var cosaY1 = values[0];
        var sinaY2 = values[2];
        if (sinaY2 <= 0) {
            rotateY = Math.acos(cosaY1);
        }
        if (sinaY2 > 0) {
            rotateY = 2 * pi - Math.acos(cosaY1);
        }
        rotateX = Math.atan2(values[9], values[5]);
        rotateY = Math.atan2(values[2], values[0]);
    }
    return {
        rotateX: rotateX,
        rotateY: rotateY,
        rotateZ: 0
    };
}
exports.getTransformRotate = getTransformRotate;
function getTransformTranslate(matrix3d) {
    var values = getTranslationMatrix(matrix3d);
    var translateX = values[0];
    var translateY = values[1];
    var translateZ = values[2];
    return {
        translateX: translateX,
        translateY: translateY,
        translateZ: translateZ
    };
}
exports.getTransformTranslate = getTransformTranslate;
function getTransformScale(matrix3d) {
    var scale = getScalationValue(matrix3d);
    return {
        scale: scale
    };
}
exports.getTransformScale = getTransformScale;
function rotatePlurid(matrix3d, direction, angleIncrement) {
    if (direction === void 0) { direction = ''; }
    if (angleIncrement === void 0) { angleIncrement = 0.07; }
    var transformRotate = getTransformRotate(matrix3d);
    var rotateX = transformRotate.rotateX;
    var rotateY = transformRotate.rotateY;
    var rotateZ = transformRotate.rotateZ;
    var transformTranslate = getTransformTranslate(matrix3d);
    var translateX = transformTranslate.translateX;
    var translateY = transformTranslate.translateY;
    var translateZ = transformTranslate.translateZ;
    var scale = getTransformScale(matrix3d).scale;
    var valRotationMatrix = matrix_1.rotateMatrix(rotateX, rotateY, rotateZ);
    var valTranslationMatrix = matrix_1.translateMatrix(translateX, translateY, translateZ);
    var valScalationMatrix = matrix_1.scaleMatrix(scale);
    if (direction === 'left') {
        rotateY -= angleIncrement;
        valRotationMatrix = matrix_1.rotateMatrix(rotateX, rotateY);
    }
    if (direction === 'right') {
        rotateY += angleIncrement;
        valRotationMatrix = matrix_1.rotateMatrix(rotateX, rotateY);
    }
    if (direction === 'up') {
        rotateY -= angleIncrement;
        valRotationMatrix = matrix_1.rotateMatrix(rotateX, rotateY);
    }
    if (direction === 'down') {
        rotateY += angleIncrement;
        valRotationMatrix = matrix_1.rotateMatrix(rotateX, rotateY);
    }
    var transformedMatrix3d = setTransform(valRotationMatrix, valTranslationMatrix, valScalationMatrix);
    return transformedMatrix3d;
}
exports.rotatePlurid = rotatePlurid;
function translatePlurid(matrix3d, direction, linearIncrement) {
    if (direction === void 0) { direction = ''; }
    if (linearIncrement === void 0) { linearIncrement = 50; }
    var transformRotate = getTransformRotate(matrix3d);
    var rotateX = transformRotate.rotateX;
    var rotateY = transformRotate.rotateY;
    var rotateZ = transformRotate.rotateZ;
    var transformTranslate = getTransformTranslate(matrix3d);
    var translateX = transformTranslate.translateX;
    var translateY = transformTranslate.translateY;
    var translateZ = transformTranslate.translateZ;
    var scale = getTransformScale(matrix3d).scale;
    var valRotationMatrix = matrix_1.rotateMatrix(rotateX, rotateY, rotateZ);
    var valTranslationMatrix = matrix_1.translateMatrix(translateX, translateY, translateZ);
    var valScalationMatrix = matrix_1.scaleMatrix(scale);
    scale < 0.5 ? linearIncrement = 50 : linearIncrement = 30;
    if (direction === 'left') {
        translateX += linearIncrement;
        valTranslationMatrix = matrix_1.translateMatrix(translateX, translateY, translateZ);
    }
    if (direction === 'right') {
        translateX -= linearIncrement;
        valTranslationMatrix = matrix_1.translateMatrix(translateX, translateY, translateZ);
    }
    if (direction === 'up') {
        translateY += linearIncrement;
        valTranslationMatrix = matrix_1.translateMatrix(translateX, translateY, translateZ);
    }
    if (direction === 'down') {
        translateY -= linearIncrement;
        valTranslationMatrix = matrix_1.translateMatrix(translateX, translateY, translateZ);
    }
    var transformedMatrix3d = setTransform(valRotationMatrix, valTranslationMatrix, valScalationMatrix);
    return transformedMatrix3d;
}
exports.translatePlurid = translatePlurid;
function scalePlurid(matrix3d, direction, scaleIncrement) {
    if (direction === void 0) { direction = ''; }
    if (scaleIncrement === void 0) { scaleIncrement = 0.05; }
    var transformRotate = getTransformRotate(matrix3d);
    var rotateX = transformRotate.rotateX;
    var rotateY = transformRotate.rotateY;
    var rotateZ = transformRotate.rotateZ;
    var transformTranslate = getTransformTranslate(matrix3d);
    var translateX = transformTranslate.translateX;
    var translateY = transformTranslate.translateY;
    var translateZ = transformTranslate.translateZ;
    var scale = getTransformScale(matrix3d).scale;
    var valRotationMatrix = matrix_1.rotateMatrix(rotateX, rotateY, rotateZ);
    var valTranslationMatrix = matrix_1.translateMatrix(translateX, translateY, translateZ);
    var valScalationMatrix = matrix_1.scaleMatrix(scale);
    if (direction === 'up') {
        scale -= scaleIncrement;
        if (scale < 0.1) {
            scale = 0.1;
        }
        valScalationMatrix = matrix_1.scaleMatrix(scale);
    }
    if (direction === 'down') {
        scale += scaleIncrement;
        if (scale > 4) {
            scale = 4;
        }
        valScalationMatrix = matrix_1.scaleMatrix(scale);
    }
    var transformedMatrix3d = setTransform(valRotationMatrix, valTranslationMatrix, valScalationMatrix);
    return transformedMatrix3d;
}
exports.scalePlurid = scalePlurid;
//# sourceMappingURL=transform.js.map