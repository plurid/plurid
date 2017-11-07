var pluridContainer = document.getElementsByClassName('plurid-container');

// var pluridRotate = document.getElementsByClassName('plurid-rotate');
// var pluridTranslate = document.getElementsByClassName('plurid-translate');
// var pluridScale = document.getElementsByClassName('plurid-scale');

// var pluridContent = document.getElementsByClassName('plurid-content');


// Basic Rotation, Translation, Scaling of the Plurid Content
for (var i = 0; i < pluridContainer.length; i++) {
    pluridContainer[i].addEventListener("mousemove", function(event) {
        // console.log(this.children[0]);
        if (!!event.shiftKey) {
            rotatePlurid(event, this.children[0]);
        }

        if (!!event.altKey) {
            translatePlurid(event, this.children[0])
        }

        if (!!event.ctrlKey || !!event.metaKey) {
            scalePlurid(event, this.children[0])
        }
    });
}


// Reset Transfor at Double Click
// for (var i = 0; i < pluridContainer.length; i++) {
//     pluridContent[i].addEventListener('dblclick', function() {
//         setTransformRotate(this.parentElement.parentElement.parentElement, 0, 0)
//         setTransformTranslate(this.parentElement.parentElement, 0, 0)
//         setTransformScale(this.parentElement, 1.0)
//     });
// }


function getMouseDirection(event) {
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


function rotatePlurid(event, plurid) {
    var direction = getMouseDirection(event);
    // console.log("Direction", direction);

    var rotateX = getTransformRotate(plurid).rotateX;
    var rotateY = getTransformRotate(plurid).rotateY;
    var translateX = getTransformTranslate(plurid).translateX;
    var translateY = getTransformTranslate(plurid).translateY;
    var translateZ = 0;
    var scale = getTransformScale(plurid).scale;

    var valrotationXMatrix = rotateXMatrix(-1 * rotateX);
    var valrotationYMatrix = rotateYMatrix(-1 * rotateY);
    var valtranslationMatrix = translateMatrix(translateX, translateY, 0);
    var valscaleMatrix = scaleMatrix(scale);

    // console.log("----------------------------------")
    // console.log("Rotate X", rotateX);
    // console.log("Rotate X in Degrees", rotateX*180/Math.PI);
    // console.log("Rotate Y",rotateY);
    // console.log("Rotate Y in Degrees",rotateY*180/Math.PI);
    // console.log("Rotate Y",rotateY);
    // console.log("Translate X", translateX);
    // console.log("Translate Y", translateY);
    // console.log("Scale", scale);

    var xPosition = event.clientX;
    var yPosition = event.clientY
    var xPosPercentarge = xPosition/window.innerWidth;
    var yPosPercentarge = yPosition/window.innerWidth;
    // console.log(xPosition, xPosition);
    // console.log(xPosPercentarge, yPosPercentarge);

    var angleIncrement = 0.08;


    // ISSUE
    // issue with the angle jumping over 2*pi


    if (direction === "left") {
        rotateY -= angleIncrement;
        valrotationYMatrix = rotateYMatrix(-1 * rotateY);

        // console.log("valrotationXMatrix", valrotationXMatrix);
        // console.log("valrotationYMatrix", valrotationYMatrix);
        // console.log("valtranslationMatrix", valtranslationMatrix);
        // console.log("valscaleMatrix", valscaleMatrix);

        setTransform(plurid, valrotationXMatrix, valrotationYMatrix, valtranslationMatrix, valscaleMatrix, xPosPercentarge, yPosPercentarge);
    }

    if (direction === "right") {
        rotateY += angleIncrement;
        valrotationYMatrix = rotateYMatrix(-1 * rotateY);

        setTransform(plurid, valrotationXMatrix, valrotationYMatrix, valtranslationMatrix, valscaleMatrix, xPosPercentarge, yPosPercentarge);
    }

    // if (direction === "up") {
    //     rotateX += angleIncrement;
    //     valrotationXMatrix = rotateXMatrix(-1 * rotateX);

    //     setTransform(plurid, valrotationXMatrix, valrotationYMatrix, valtranslationMatrix, valscaleMatrix, xPosPercentarge, yPosPercentarge);
    // }

    // if (direction === "down") {
    //     rotateX -= angleIncrement;

    //     valrotationXMatrix = rotateXMatrix(-1 * rotateX);

    //     setTransform(plurid, valrotationXMatrix, valrotationYMatrix, valtranslationMatrix, valscaleMatrix, xPosPercentarge, yPosPercentarge);
    // }
}


function translatePlurid(event, plurid) {
    var direction = getMouseDirection(event);
    // console.log("Direction", direction);

    var rotateX = getTransformRotate(plurid).rotateX;
    var rotateY = getTransformRotate(plurid).rotateY;
    var translateX = getTransformTranslate(plurid).translateX;
    var translateY = getTransformTranslate(plurid).translateY;
    var translateZ = 0;
    var scale = getTransformScale(plurid).scale;

    var valrotationXMatrix = rotateXMatrix(-1 * rotateX);
    var valrotationYMatrix = rotateYMatrix(-1 * rotateY);
    var valtranslationMatrix = translateMatrix(translateX, translateY, 0);
    var valscaleMatrix = scaleMatrix(scale);

    var xPosition = event.clientX;
    var yPosition = event.clientY
    var xPosPercentarge = xPosition/window.innerWidth;
    var yPosPercentarge = yPosition/window.innerWidth;
    // console.log(xPosition, xPosition);
    // console.log(xPosPercentarge, yPosPercentarge);

    var linearIncrement = 10;

    // console.log("----------------------------------")
    // console.log("Rotate X", rotateX);
    // console.log("Rotate Y",rotateY);
    // console.log("Translate X", translateX);
    // console.log("Translate Y", translateY);
    // console.log("Scale", scale);
    // console.log("getRotateXMatrix", getRotateXMatrix);
    // console.log("getRotateYMatrix", getRotateYMatrix);
    // console.log("getTranslateMatrix", getTranslateMatrix);
    // console.log("getScaleMatrix", getScaleMatrix);


    if (direction === "left") {
        translateX -= linearIncrement;
        var valtranslationMatrix = translateMatrix(translateX, translateY, translateZ);

        // console.log("valrotationXMatrix", valrotationXMatrix);
        // console.log("valrotationYMatrix", valrotationYMatrix);
        // console.log("valtranslationMatrix", valtranslationMatrix);
        // console.log("valscaleMatrix", valscaleMatrix);

        setTransform(plurid, valrotationXMatrix, valrotationYMatrix, valtranslationMatrix, valscaleMatrix, xPosPercentarge, yPosPercentarge);
    }

    if (direction === "right") {
        translateX += linearIncrement;
        var valtranslationMatrix = translateMatrix(translateX, translateY, translateZ);

        setTransform(plurid, valrotationXMatrix, valrotationYMatrix, valtranslationMatrix, valscaleMatrix, xPosPercentarge, yPosPercentarge);
    }

    if (direction === "up") {
        translateY -= linearIncrement;
        var valtranslationMatrix = translateMatrix(translateX, translateY, translateZ);

        setTransform(plurid, valrotationXMatrix, valrotationYMatrix, valtranslationMatrix, valscaleMatrix, xPosPercentarge, yPosPercentarge);
    }

    if (direction === "down") {
        translateY += linearIncrement;
        var valtranslationMatrix = translateMatrix(translateX, translateY, translateZ);

        setTransform(plurid, valrotationXMatrix, valrotationYMatrix, valtranslationMatrix, valscaleMatrix, xPosPercentarge, yPosPercentarge);
    }
}


function scalePlurid(event, plurid) {
    var direction = getMouseDirection(event);
    // console.log("Direction", direction);

    var rotateX = getTransformRotate(plurid).rotateX;
    var rotateY = getTransformRotate(plurid).rotateY;
    var translateX = getTransformTranslate(plurid).translateX;
    var translateY = getTransformTranslate(plurid).translateY;
    var translateZ = 0;
    var scale = getTransformScale(plurid).scale;

    var valrotationXMatrix = rotateXMatrix(-1 * rotateX);
    var valrotationYMatrix = rotateYMatrix(-1 * rotateY);
    var valtranslationMatrix = translateMatrix(translateX, translateY, 0);
    var valscaleMatrix = scaleMatrix(scale);

    var scaleIncrement = 0.05;

    // console.log("----------------------------------")
    // console.log("Rotate X", rotateX);
    // console.log("Rotate Y",rotateY);
    // console.log("Translate X", translateX);
    // console.log("Translate Y", translateY);
    // console.log("Scale", scale);
    // console.log("getRotateXMatrix", getRotateXMatrix);
    // console.log("getRotateYMatrix", getRotateYMatrix);
    // console.log("getTranslateMatrix", getTranslateMatrix);
    // console.log("getScaleMatrix", getScaleMatrix);

    var xPosition = event.clientX;
    var yPosition = event.clientY
    var xPosPercentarge = xPosition/window.innerWidth;
    var yPosPercentarge = yPosition/window.innerWidth;
    // console.log(xPosition, xPosition);
    // console.log(xPosPercentarge, yPosPercentarge);

    if (direction === "up") {
        scale += scaleIncrement;

        if (scale > 4) {
            scale = 4
        }

        var valscaleMatrix = scaleMatrix(scale);

        setTransform(plurid, valrotationXMatrix, valrotationYMatrix, valtranslationMatrix, valscaleMatrix, xPosPercentarge, yPosPercentarge);
    }

    if (direction === "down") {
        scale -= scaleIncrement;

        if (scale < 0.1) {
            scale = 0.1
        }

        var valscaleMatrix = scaleMatrix(scale);

        setTransform(plurid, valrotationXMatrix, valrotationYMatrix, valtranslationMatrix, valscaleMatrix, xPosPercentarge, yPosPercentarge);
    }
}


function getTransformRotate(element) {
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


function getTransformTranslate(element) {
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


function getTransformScale(element) {
    var scale = getScaleMatrix(element);
    // console.log(scale);

    return {
        scale: scale
    }
}


function getMatrixValues(element) {
    var transformValues = window.getComputedStyle(element, null).getPropertyValue("transform");
    var matrixValues = transformValues.split('(')[1].split(')')[0].split(',');

    for (var i = 0; i < matrixValues.length; i++) {
        matrixValues[i] = parseFloat(matrixValues[i]);
    }

    return matrixValues;
}


function getRotationMatrix(element) {
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


function getTranslationMatrix(element) {
    var valuesMatrix = getMatrixValues(element);

    if (valuesMatrix.length == 16) {
        var translationMatrix = getMatrixValues(element).slice(12, 15);

    } else if (valuesMatrix.length == 6) {
        var translationMatrix = getMatrixValues(element).slice(4);
    }

    return translationMatrix;
}


function getScaleMatrix(element) {
    var valuesMatrix = getMatrixValues(element);

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


function setTransform(element, rotateXMatrix, rotateYMatrix, translateMatrix, scaleMatrix, xPosPercentarge, yPosPercentarge) {
    var transformMatrix = multiplyArrayOfMatrices([
        translateMatrix,
        rotateXMatrix,
        rotateYMatrix,
        scaleMatrix
    ]);
    // console.log("Transform Matrix", transformMatrix);

    // Returns a result like: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 50, 100, 0, 1);"
    var matrix3dRule = matrixArrayToCssMatrix(transformMatrix);
    // console.log("CSS Rule", matrix3dRule);

    xPosPercentarge = (xPosPercentarge*100).toPrecision(6);
    yPosPercentarge = (yPosPercentarge*100).toPrecision(6);

    // Set the transform
    element.style.transform = matrix3dRule;
    // element.style.transformOrigin = xPosPercentarge + "% " + yPosPercentarge + "%";
    // console.log("Percentage", xPosPercentarge, yPosPercentarge);
}


// // --------- --------- --------- --------- //


// transforms
function rotateXMatrix(a) {
    var cos = Math.cos;
    var sin = Math.sin;

    return [
         1,       0,        0,     0,
         0,  cos(a),  -sin(a),     0,
         0,  sin(a),   cos(a),     0,
         0,       0,        0,     1
    ];
}


function rotateYMatrix(a) {
    var cos = Math.cos;
    var sin = Math.sin;

    return [
         cos(a),   0, sin(a),   0,
              0,   1,      0,   0,
        -sin(a),   0, cos(a),   0,
              0,   0,      0,   1
    ];
}


function rotateZMatrix(a) {
    var cos = Math.cos;
    var sin = Math.sin;

    return [
        cos(a), -sin(a),    0,    0,
        sin(a),  cos(a),    0,    0,
             0,       0,    1,    0,
             0,       0,    0,    1
    ];
}


function translateMatrix(x, y, z) {
	return [
	    1,    0,    0,   0,
	    0,    1,    0,   0,
	    0,    0,    1,   0,
	    x,    y,    z,   1
	];
}


function scaleMatrix(s) {
	return [
	    s,    0,    0,   0,
	    0,    s,    0,   0,
	    0,    0,    s,   0,
	    0,    0,    0,   1
	];
}


function multiplyPoint(matrix, point) {
    var x = point[0], y = point[1], z = point[2], w = point[3];

    var c1r1 = matrix[ 0], c2r1 = matrix[ 1], c3r1 = matrix[ 2], c4r1 = matrix[ 3],
        c1r2 = matrix[ 4], c2r2 = matrix[ 5], c3r2 = matrix[ 6], c4r2 = matrix[ 7],
        c1r3 = matrix[ 8], c2r3 = matrix[ 9], c3r3 = matrix[10], c4r3 = matrix[11],
        c1r4 = matrix[12], c2r4 = matrix[13], c3r4 = matrix[14], c4r4 = matrix[15];

    return [
        x*c1r1 + y*c1r2 + z*c1r3 + w*c1r4,
        x*c2r1 + y*c2r2 + z*c2r3 + w*c2r4,
        x*c3r1 + y*c3r2 + z*c3r3 + w*c3r4,
        x*c4r1 + y*c4r2 + z*c4r3 + w*c4r4
    ];
}


function multiplyMatrices(a, b) {
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


function multiplyArrayOfMatrices(matrices) {
    var inputMatrix = matrices[0];

    for(var i=1; i < matrices.length; i++) {
      inputMatrix = multiplyMatrices(inputMatrix, matrices[i]);
    }

    return inputMatrix;
}


// Create the matrix3d style property from a matrix array
function matrixArrayToCssMatrix(array) {
    return 'matrix3d(' + array.join(',') + ')';
}







// // ---- LINKS

// var pluridLinks = document.getElementsByTagName('a');

// // console.log(pluridLinks[0]);

// function pluridifyLinks(links) {
//     for (i = 0; i < links.length; i++) {
//         links[i].addEventListener('click', function(event) {
//             event.preventDefault();

//             // this.innerHTML = this.innerHTML +
//             //                 '<iframe src="' +
//             //                 this.href +
//             //                 '" class="plurid-link" height="500px" width="500px"></iframe>'



//             var newDiv = document.createElement("div")

//             newDiv.innerHTML = '<div class="plurid-link-container">' +
//                                     '<div class="plurid-link">' +
//                                         '<iframe src="' +
//                                             this.href +
//                                             '" class="plurid-link" height="500px" width="500px"></iframe>' +
//                                     '</div>' +
//                                 '</div>'

//             this.parentElement.parentElement.parentElement.appendChild(newDiv);

//             console.log(this.parentElement.parentElement)
//         })

//     }
// }

// pluridifyLinks(pluridLinks);
