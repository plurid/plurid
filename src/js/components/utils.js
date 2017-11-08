// Utilities Functions

// Get User's Mouse Direction
// getMouseDirection(event)

// Get Transform Values and Decomposed Matrix from CSS
// getTransformRotate(element)
// getTransformTranslate(element)
// getTransformScale(element)
// getMatrixValues(element)
// getRotationMatrix(element)
// getTranslationMatrix(element)
// getScaleMatrix(element)
// setTransform(element, rotateXMatrix, rotateYMatrix, translateMatrix, scaleMatrix, xPosPercentarge, yPosPercentarge)
// setCursor
// getyPos

import * as matrix from "./matrix.js";


export function getMouseDirection(event) {
    var direction = "";

    if (event.movementX < 0 ) {
        direction = "left";
    } else if (event.movementX > 0) {
        direction = "right";
    }

    if (event.movementY < 0) {
        direction = "up";
    } else if (event.movementY > 0) {
        direction = "down";
    }

    // console.log('----- direction: ', direction)
    // console.log('movementX: ', event.movementX)
    // console.log('movementY: ', event.movementY)
    return direction;
}


export function getTransformRotate(element) {
    var values = getRotationMatrix(element);
    // console.log("getTransformRotate Matrix", values);

    var rotateX,
        rotateY;

    var pi = Math.PI;

    if (values.length == 6) {
        var cosa = parseFloat(values[0]);
        var sina = parseFloat(values[1]);
        // console.log("cos A", cosa);
        // console.log("sin A", sina);

        if (cosa == 1 && sina == 0) {
            rotateX = Math.asin(sina);
            rotateY = Math.acos(cosa);
        }
    }

    if (values.length == 16) {
        var cosaX = parseFloat(values[5]);
        var sinaX = parseFloat(values[9]);
        // console.log("cos A X", cosaX);
        // console.log("sin A X", sinaX);

        // 0-180
        if (sinaX <= 0) {
            rotateX = Math.acos(cosaX);
        }

        // 181-360
        if (sinaX > 0) {
            rotateX = 2*pi - Math.acos(cosaX);
        }

        // console.log("rotateX in Radians", rotateX);
        // console.log("rotateX in Degrees", rotateX*180/pi);


        var cosaY = parseFloat(values[0]);
        var sinaY = parseFloat(values[2]);
        // console.log("cos A Y", cosaY);
        // console.log("sin A Y", sinaY);

        // 0-180
        if (sinaY <= 0) {
            rotateY = Math.acos(cosaY);
        }

        // 181-360
        if (sinaY > 0) {
            rotateY = 2*pi - Math.acos(cosaY);
        }

        // console.log("rotateY in Radians", rotateY);
        // console.log("rotateY in Degrees", rotateY*180/pi);
    }

    return {
        rotateX: rotateX,
        rotateY: rotateY
    };
}


export function getTransformTranslate(element) {
    var values = getTranslationMatrix(element);

    var translateX,
        translateY;

    translateX = parseFloat(values[0]);
    translateY = parseFloat(values[1]);

    return {
        translateX: translateX,
        translateY: translateY
    };
}


export function getTransformScale(element) {
    var scale = getScaleMatrix(element);
    // console.log(scale);

    return {
        scale: scale
    }
}


export function getMatrixValues(element) {
    var transformValues = window.getComputedStyle(element, null).getPropertyValue("transform");
    var matrixValues = transformValues.split('(')[1].split(')')[0].split(',');

    for (var i = 0; i < matrixValues.length; i++) {
        matrixValues[i] = parseFloat(matrixValues[i]);
    }

    return matrixValues;
}


export function getRotationMatrix(element) {
    var valuesMatrix = getMatrixValues(element);
    var scale = getScaleMatrix(element);

    if (valuesMatrix.length == 16) {
        for (var i=0; i < 11; i++) {
            valuesMatrix[i] /= scale;
        }
    } else if(valuesMatrix.length == 6) {
        for (var i=0; i < 4; i++) {
            valuesMatrix[i] /= scale;
        }
    }

    var rotationMatrix = valuesMatrix;

    return rotationMatrix;
}


export function getTranslationMatrix(element) {
    var valuesMatrix = getMatrixValues(element);

    if (valuesMatrix.length == 16) {
        var translationMatrix = getMatrixValues(element).slice(12, 15);

    } else if (valuesMatrix.length == 6) {
        var translationMatrix = getMatrixValues(element).slice(4);
    }

    return translationMatrix;
}


export function getScaleMatrix(element) {
    var valuesMatrix = getMatrixValues(element);
    var temp = 0;

    if (valuesMatrix.length == 16) {
        var scaleMatrix = getMatrixValues(element).slice(0, 4);
        var scale = 0;

        for (var i = 0; i < scaleMatrix.length; i++) {
            scale += parseFloat(scaleMatrix[i]) * parseFloat(scaleMatrix[i]);
        }

        scale = parseFloat(Math.sqrt(scale).toPrecision(4));
    } else if (valuesMatrix.length == 6) {
        temp = valuesMatrix[0]*valuesMatrix[0] + valuesMatrix[1]*valuesMatrix[1];
        var scale = parseFloat(Math.sqrt(temp).toPrecision(4));
    }

    return scale;
}


// console.log("Direct Matrix", getMatrixValues(pluridContainer[0].children[0]));
// console.log("Rotation Matrix", getRotationMatrix(pluridContainer[0].children[0]));
// console.log("Translation Matrix", getTranslationMatrix(pluridContainer[0].children[0]));
// console.log("Scale Matrix", getScaleMatrix(pluridContainer[0].children[0]));


export function setTransform(element, rotateXMatrix, rotateYMatrix, translateMatrix, scaleMatrix, yPos = 0) {
    var transformMatrix = matrix.multiplyArrayOfMatrices([
        translateMatrix,
        rotateXMatrix,
        rotateYMatrix,
        scaleMatrix
    ]);
    // console.log("Transform Matrix", transformMatrix);

    // Set the transform
    var transformOriginRule = "50% " + yPos + "px";
    element.style.transformOrigin = transformOriginRule;

    // Returns a a matrix3d() CSS string
    var matrix3dRule = matrix.matrixArrayToCssMatrix(transformMatrix);
    // console.log("CSS Rule", matrix3dRule);
    element.style.transform = matrix3dRule;
}


export function setCursor(mode) {
    switch(mode) {
        case "rotate":
            document.body.style.cursor = "ew-resize";
            break;
        case "translate":
            document.body.style.cursor = "move";
            break;
        case "scale":
            document.body.style.cursor = "nesw-resize";
            break;
        default:
            document.body.style.cursor = "default";
    }
}


export function getyPos(event, plurid) {
    var yCenter = window.innerHeight / 2;
    var translateY = getTransformTranslate(plurid).translateY;

    var yPos = translateY * -1 + yCenter;

    return yPos;
}