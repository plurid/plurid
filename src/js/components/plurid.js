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

    var rotateX = getTransformRotate(plurid).rotateX;
    var rotateY = getTransformRotate(plurid).rotateY;
    var translateX = getTransformTranslate(plurid).translateX;
    var translateY = getTransformTranslate(plurid).translateY;
    var scale = getTransformScale(plurid).scale;

    // console.log(rotateX, rotateY);

    var angleIncrement = 2.5;

    if (direction === "left") {
        rotateY -= angleIncrement;
        setTransform(plurid, rotateX, rotateY, translateX, translateY, scale);
    } else if (direction === "right") {
        rotateY += angleIncrement;
        setTransform(plurid, rotateX, rotateY, translateX, translateY, scale);
    } else if (direction === "up") {
        rotateX += angleIncrement;
        setTransform(plurid, rotateX, rotateY, translateX, translateY, scale);
    } else if (direction === "down") {
        rotateX -= angleIncrement;
        setTransform(plurid, rotateX, rotateY, translateX, translateY, scale);
    }

    // console.log(direction);
}


function translatePlurid(event, plurid) {
    var direction = getMouseDirection(event);

    var rotateX = getTransformRotate(plurid).rotateX;
    var rotateY = getTransformRotate(plurid).rotateY;
    var translateX = getTransformTranslate(plurid).translateX;
    var translateY = getTransformTranslate(plurid).translateY;
    var scale = getTransformScale(plurid).scale;

    // console.log(translateX, translateY)
    // console.log("TRANSLATE X from tp", translateX);
    // console.log("TRANSLATE Y from tp", translateY);

    var linearIncrement = 10;

    if (direction === "left") {
        translateX -= linearIncrement;
        setTransform(plurid, rotateX, rotateY, translateX, translateY, scale);
    } else if (direction === "right") {
        translateX += linearIncrement;
        setTransform(plurid, rotateX, rotateY, translateX, translateY, scale);
    } else if (direction === "up") {
        translateY -= linearIncrement;
        setTransform(plurid, rotateX, rotateY, translateX, translateY, scale);
    } else if (direction === "down") {
        translateY += linearIncrement;
        setTransform(plurid, rotateX, rotateY, translateX, translateY, scale);
    }

    // console.log(direction);
}


function scalePlurid(event, plurid) {
    var direction = getMouseDirection(event);

    var rotateX = getTransformRotate(plurid).rotateX;
    var rotateY = getTransformRotate(plurid).rotateY;
    var translateX = getTransformTranslate(plurid).translateX;
    var translateY = getTransformTranslate(plurid).translateY;
    var scale = getTransformScale(plurid).scale;
    // console.log(scale);

    var scaleIncrement = 0.1;

    if (direction === "up") {
        scale += scaleIncrement;
        if (scale > 4) {
            scale = 4
        }
        setTransform(plurid, rotateX, rotateY, translateX, translateY, scale);
    } else if (direction === "down") {
        scale -= scaleIncrement;
        if (scale < 0.1) {
            scale = 0.1
        }
        setTransform(plurid, rotateX, rotateY, translateX, translateY, scale);
    }

    // console.log(direction);
}


function getTransformRotate(element) {
    var values = getRotationMatrix(element);
    // console.log(values);

    var scale = getTransformScale(element).scale;
    // console.log(scale)

    for (var i = 0; i < values.length; i++) {
        // console.log(values[i])
        values[i] = values[i] / scale;
        // console.log(values[i])
    }
    // console.log(values);

    var rotateX,
        rotateY;

    var pi = Math.PI;

    if (values.length == 16) {
        // rotX
        var cos1ForX = parseFloat(values[5]);
        var sin1ForX = parseFloat(values[6]);
        var sin2ForX = parseFloat(values[9]);

        if (sin1ForX > 0) {
            // console.log('X a');
            var rotX = Math.round(Math.acos(cos1ForX) * 180 / pi);
        } else if (sin1ForX < 0 && cos1ForX < 0) {
            // console.log('X b');
            var rotX = Math.asin(sin1ForX) * 180 / pi * (-1) + 180;
        } else if (cos1ForX == 0) {
            // console.log('X c');
            var rotX = 0;
        } else {
            // console.log('X d');
            var rotX = 360 - Math.acos(cos1ForX) * 180 / pi;
        }

        // rotY
        var cos1ForY = parseFloat(values[0]);
        var sin1ForY = parseFloat(values[2]);
        var sin2ForY = parseFloat(values[8]);

        if (sin1ForY > 0 && sin2ForY < 0) {
            // console.log('Y a0');
            var rotY = 360 - Math.acos(cos1ForY) * 180 / pi;
        } else if (sin1ForY > 0) {
            // console.log('Y a');
            var rotY = Math.acos(cos1ForY) * 180 / pi;
        } else if (sin1ForY < 0 && cos1ForY < 0) {
            // console.log('Y b');
            var rotY = Math.asin(sin2ForY) * 180 / pi * (-1) + 180;
        } else if (sin1ForY < 0) {
            // console.log('Y c');
            var rotY = Math.asin(sin2ForY) * 180 / pi;
        } else if (cos1ForY == 1) {
            // console.log('Y d');
            var rotY = 0;
        } else {
            // console.log('Y e');
            var rotY = 360 - Math.acos(cos1ForY) * 180 / pi;
        }

        // console.log(`sin1: ${sin1ForY}, sin2: ${sin2ForY}`);
        // console.log(`cos1: ${cos1ForY}`);

        rotateX = rotX;
        rotateY = rotY;
    } else if (values.length == 6) {
        rotateX = 0;
        rotateY = 0;
    }

    return {
        rotateX: rotateX,
        rotateY: rotateY
    };
}


function getTransformTranslate(element) {
    var values = getTranslationMatrix(element);
    // console.log("VALUES", values);

    var translateX,
        translateY;

    translateX = parseFloat(values[0]);
    translateY = parseFloat(values[1]);
    // console.log("TRANSLATE X", translateX);
    // console.log("TRANSLATE Y", translateY);


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
    // console.log(matrixValues);

    return matrixValues;
}

function getTranslationMatrix(element) {
    var valuesMatrix = getMatrixValues(element);
    console.log(valuesMatrix)

    if (valuesMatrix.length == 16) {
        var translationMatrix = getMatrixValues(element).slice(12, 14);
        // console.log("16", translationMatrix)

    } else if (valuesMatrix.length == 6) {
        var translationMatrix = getMatrixValues(element).slice(4);
        // console.log("6", translationMatrix)

    }
    // console.log("FINAL", translationMatrix)

    return translationMatrix;
}

function getScaleMatrix(element) {
    var valuesMatrix = getMatrixValues(element);
    // console.log(valuesMatrix);

    if (valuesMatrix.length == 16) {
        var scaleMatrix = getMatrixValues(element).slice(0, 4);
        // console.log(scaleMatrix);

        var scale = 0;

        for (var i = 0; i < scaleMatrix.length; i++) {
            scale += parseFloat(scaleMatrix[i]) * parseFloat(scaleMatrix[i]);
            // console.log(scale);
        }

        // console.log(scale);

        scale = Math.sqrt(scale).toPrecision(4);;
    }

    return scale;
}

function getRotationMatrix(element) {
    var valuesMatrix = getMatrixValues(element);
    var scale = getScaleMatrix(element);

    if (valuesMatrix.length == 16) {
        for (var i=0; i < 11; i++) {
            valuesMatrix[i] /= scale;
        }
    }

    var rotationMatrix = valuesMatrix;

    return rotationMatrix;
}




// console.log(getTranslationMatrix(pluridContainer[1].children[0]));


function setTransform(element, rotateX, rotateY, translateX, translateY, scale) {
    var transformString = "scale(" + scale + ") rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translateX(" + translateX + "px) translateY(" + translateY + "px)";
    console.log(transformString);

    element.style.transform = transformString;
    element.style.webkitTransform = transformString;
}


// function setTransformRotate(element, rotateX, rotateY) {
//     var transformString = "rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";

//     element.style.transform = transformString;
//     element.style.webkitTransform = transformString;
// }


// function setTransformTranslate(element, translateX, translateY) {
//     var transformString = "translateX(" + translateX + "px) translateY(" + translateY + "px)";

//     element.style.transform = transformString;
//     element.style.webkitTransform = transformString;
// }


// function setTransformScale(element, scale) {
//     var transformString = "scale(" + scale + ")";

//     element.style.transform = transformString;
//     element.style.webkitTransform = transformString;
// }





















// ---- LINKS

var pluridLinks = document.getElementsByTagName('a');

// console.log(pluridLinks[0]);

function pluridifyLinks(links) {
    for (i = 0; i < links.length; i++) {
        links[i].addEventListener('click', function(event) {
            event.preventDefault();

            // this.innerHTML = this.innerHTML +
            //                 '<iframe src="' +
            //                 this.href +
            //                 '" class="plurid-link" height="500px" width="500px"></iframe>'



            var newDiv = document.createElement("div")

            newDiv.innerHTML = '<div class="plurid-link-container">' +
                                    '<div class="plurid-link">' +
                                        '<iframe src="' +
                                            this.href +
                                            '" class="plurid-link" height="500px" width="500px"></iframe>' +
                                    '</div>' +
                                '</div>'

            this.parentElement.parentElement.parentElement.appendChild(newDiv);

            console.log(this.parentElement.parentElement)
        })

    }
}

pluridifyLinks(pluridLinks);
