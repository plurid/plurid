import * as matrix from "./matrix.js";


export function getTransformRotate(element) {
    var values = getRotationMatrix(element);
    // console.log("values Matrix", values);

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
        var cosaX1 = parseFloat(values[5]);
        var sinaX2 = parseFloat(values[6]);
        var sinaX3 = parseFloat(values[9]);
        var cosaX4 = parseFloat(values[10]);
        // console.log("----------------------")
        // console.log("cos A X 1", cosaX1);
        // console.log("cos A X 1", cosaX1 > 0 ? "POSITIVE" : "NEGATIVE");
        // console.log("arccos A X 1", Math.acos(cosaX1)*180/pi);
        // console.log("sin A X 2", sinaX2);
        // console.log("sin A X 2", sinaX2 > 0 ? "POSITIVE" : "NEGATIVE");
        // console.log("arcsin A X 2", Math.asin(sinaX2)*180/pi);
        // console.log("sin A X 3", sinaX3);
        // console.log("sin A X 3", sinaX3 > 0 ? "POSITIVE" : "NEGATIVE");
        // console.log("arcsin A X 3", Math.asin(sinaX3)*180/pi);
        // console.log("cos A X 4", cosaX4);
        // console.log("cos A X 4", cosaX4 > 0 ? "POSITIVE" : "NEGATIVE");
        // console.log("arccos A X 4", Math.acos(cosaX4)*180/pi);


        // rotateX = 0;

        // 0-180
        if (sinaX3 <= 0) {
            rotateX = Math.acos(cosaX1);
            // console.log("ONE X");
            // console.log("++++++");
        }

        // // 181-360
        if (sinaX3 > 0) {
            rotateX = 2*pi - Math.acos(cosaX1);
            // console.log("TWO X");
            // console.log("++++++");
        }

        // console.log("rotateX in Radians", rotateX);
        // console.log("rotateX in Degrees", rotateX*180/pi);

        // console.log("-------------")


        // var cosaY = parseFloat(values[0]);
        // var sinaY = parseFloat(values[2]);
        // console.log("cos A Y", cosaY);
        // console.log("sin A Y", sinaY);

        var cosaY1 = parseFloat(values[0]);
        var sinaY2 = parseFloat(values[2]);
        var sinaY3 = parseFloat(values[8]);
        var cosaY4 = parseFloat(values[10]);
        // console.log("cos A Y 1", cosaY1);
        // console.log("cos A Y 1", cosaY1 > 0 ? "POSITIVE" : "NEGATIVE");
        // console.log("arccos A Y 1", Math.acos(cosaY1));
        // console.log("arccos A Y 1 in degs", Math.acos(cosaY1)*180/pi);
        // console.log("sin A Y 2", sinaY2);
        // console.log("sin A Y 2", sinaY2 > 0 ? "POSITIVE" : "NEGATIVE");
        // console.log("arcsin A Y 2", Math.asin(sinaY2)*180/pi);
        // console.log("sin A Y 3", sinaY3);
        // console.log("sin A Y 3", sinaY3 > 0 ? "POSITIVE" : "NEGATIVE");
        // console.log("arcsin A Y 3", Math.asin(sinaY3)*180/pi);
        // console.log("cos A Y 4", cosaY4);
        // console.log("cos A Y 4", cosaY4 > 0 ? "POSITIVE" : "NEGATIVE");
        // console.log("arccos A Y 4", Math.acos(cosaY4)*180/pi);

        // rotateY = 0

        if (sinaY2 <= 0) {
            rotateY = Math.acos(cosaY1);
            // console.log("ONE Y");
            // console.log("++++++");
        }

        if (sinaY2 > 0) {
            rotateY = 2*pi - Math.acos(cosaY1);
            // console.log("TWO Y");
            // console.log("++++++");
        }
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
    // console.log("transformValues Matrix", transformValues);

    var matrixValues = transformValues.split('(')[1].split(')')[0].split(',');
    // console.log("matrixValues Matrix", matrixValues);

    for (var i = 0; i < matrixValues.length; i++) {
        matrixValues[i] = parseFloat(matrixValues[i]);
    }

    return matrixValues;
}


export function getRotationMatrix(element) {
    var valuesMatrix = getMatrixValues(element);
    // console.log("getMatrixValues Matrix", valuesMatrix);

    var scale = getScaleMatrix(element);
    // console.log("getScaleMatrix Matrix", scale);

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
    // console.log("rotationMatrix Matrix", rotationMatrix);


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


export function setTransform(element, rotateXMatrix, rotateYMatrix, translateMatrix, scaleMatrix, yPos = 0) {
    let transformMatrix = matrix.multiplyArrayOfMatrices([
        translateMatrix,
        rotateYMatrix,
        rotateXMatrix,
        scaleMatrix
    ]);
    // console.log("Transform Matrix", transformMatrix);

    // window.addEventListener('wheel', event => {
        // console.log(event);
        // console.log(event.clientX, event.clientY);
        // var transformOriginRule = `${event.x}px ${yPos}px`;
        // element.style.transformOrigin = transformOriginRule;
    // })

    // console.log(element);

    // Set the transform
    let transformOriginRule = "50% " + yPos + "px";
    element.style.transformOrigin = transformOriginRule;


    // Returns a a matrix3d() CSS string
    let matrix3dRule = matrix.matrixArrayToCssMatrix(transformMatrix);
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


export function getyPos(event = null, plurid) {
    var yCenter = window.innerHeight / 2;
    var translateY = getTransformTranslate(plurid).translateY;

    var yPos = translateY * -1 + yCenter;

    return yPos;
}
