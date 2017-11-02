var pluridContainer = document.getElementById('plurid-container');

var pluridRotate = document.getElementById('plurid-rotate');
var pluridTranslate = document.getElementById('plurid-translate');
var pluridScale = document.getElementById('plurid-scale');

var pluridContent = document.getElementById('plurid-content');


// Basic Rotation, Translation, Scaling of the Plurid Content
pluridContainer.addEventListener("mousemove", function(event) {
    if (!!event.shiftKey) {
        rotatePlurid(event);
    }

    if (!!event.altKey) {
        translatePlurid(event)
    }

    if (!!event.ctrlKey || !!event.metaKey) {
        scalePlurid(event)
    }
});


// Reset Transfor at Double Click
pluridContent.addEventListener('dblclick', function() {
    setTransformRotate(pluridRotate, 0, 0)
    setTransformTranslate(pluridTranslate, 0, 0)
    setTransformScale(pluridScale, 1.0)
});


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

    return direction;
}


function rotatePlurid(event) {
    var direction = getMouseDirection(event);

    var rotateX = getTransformRotate(pluridRotate).rotateX;
    var rotateY = getTransformRotate(pluridRotate).rotateY;

    var angleIncrement = 3;

    if (direction === "left") {
        rotateY -= angleIncrement;
        setTransformRotate(pluridRotate, rotateX, rotateY)
    } else if (direction === "right") {
        rotateY += angleIncrement;
        setTransformRotate(pluridRotate, rotateX, rotateY)
    } else if (direction === "up") {
        rotateX += angleIncrement;
        setTransformRotate(pluridRotate, rotateX, rotateY)
    } else if (direction === "down") {
        rotateX -= angleIncrement;
        setTransformRotate(pluridRotate, rotateX, rotateY)
    }

    // console.log(direction);
}


function translatePlurid(event) {
    var direction = getMouseDirection(event);

    var translateX = getTransformTranslate(pluridTranslate).translateX;
    var translateY = getTransformTranslate(pluridTranslate).translateY;
    console.log(translateX, translateY)

    var linearIncrement = 10;

    if (direction === "left") {
        translateX -= linearIncrement;
        setTransformTranslate(pluridTranslate, translateX, translateY);
    } else if (direction === "right") {
        translateX += linearIncrement;
        setTransformTranslate(pluridTranslate, translateX, translateY);
    } else if (direction === "up") {
        translateY -= linearIncrement;
        setTransformTranslate(pluridTranslate, translateX, translateY);
    } else if (direction === "down") {
        translateY += linearIncrement;
        setTransformTranslate(pluridTranslate, translateX, translateY);
    }

    // console.log(direction);
}


function scalePlurid(event) {
    var direction = getMouseDirection(event);

    var scale = getTransformScale(pluridScale).scale;

    var scaleIncrement = 0.1;

    if (direction === "up") {
        scale += scaleIncrement;
        if (scale > 4) {
            scale = 4
        }
        setTransformScale(pluridScale, scale);
    } else if (direction === "down") {
        scale -= scaleIncrement;
        if (scale < 0.1) {
            scale = 0.1
        }
        setTransformScale(pluridScale, scale);
    }

    // console.log(direction);
}


function getTransformRotate(element) {
    var values = getMatrixValues(element);

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
    var values = getMatrixValues(element);

    var translateX,
        translateY;

    if (values.length == 16) {
        translateX = parseFloat(values[12]);
        translateY = parseFloat(values[13]);
    } else if (values.length == 6) {
        translateX = parseFloat(values[4]);
        translateY = parseFloat(values[5]);
    }

    return {
        translateX: translateX,
        translateY: translateY
    };
}


function getTransformScale(element) {
    var values = getMatrixValues(element);

    var scale = parseFloat(values[0]);

    return {
        scale: scale
    }
}


function getMatrixValues(element) {
    var transformValues = window.getComputedStyle(element, null).getPropertyValue("transform");
    var matrixValues = transformValues.split('(')[1].split(')')[0].split(',');

    return matrixValues;
}

// console.log(getMatrixValues(plurid));


function setTransformRotate(element, rotateX, rotateY) {
    var transformString = "rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";

    element.style.transform = transformString;
    element.style.webkitTransform = transformString;
}


function setTransformTranslate(element, translateX, translateY) {
    var transformString = "translateX(" + translateX + "px) translateY(" + translateY + "px)";

    element.style.transform = transformString;
    element.style.webkitTransform = transformString;
}


function setTransformScale(element, scale) {
    var transformString = "scale(" + scale + ")";

    element.style.transform = transformString;
    element.style.webkitTransform = transformString;
}
