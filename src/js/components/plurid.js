var plurid = document.getElementById('plurid');
// var pluridRotate = document.getElementById('plurid-rotate');
// var pluridTranslate = document.getElementById('plurid-translate');
// var pluridScale = document.getElementById('plurid-scale');
var pluridContainer = document.getElementById('plurid-container');


pluridContainer.addEventListener("mousemove", function(event) {
    if (!!event.shiftKey) {
        rotatePlurid(event);
    }

    if (!!event.altKey) {
        movePlurid(event)
    }

    if (!!event.ctrlKey || !!event.metaKey) {
        scalePlurid(event)
    }
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

    var rotateX = getTransform(plurid).rotateX;
    var rotateY = getTransform(plurid).rotateY;
    var translateX = getTransform(plurid).translateX;
    var translateY = getTransform(plurid).translateY;
    var scale = getTransform(plurid).scale;

    var angleIncrement = 3;

    if (direction === "left") {
        rotateY -= angleIncrement;
        console.log(rotateX, rotateY, translateX, translateY, scale);
        setTransform(plurid, rotateX, rotateY, translateX, translateY, scale)

        // plurid.style.transform = "rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translateX(" + translateX + "px) + translateY(" + translateY + "px) + scale(" + scale + ")";
        // plurid.style.webkitTransform = "rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translateX(" + translateX + "px) + translateY(" + translateY + "px) + scale(" + scale + ")";
    } else if (direction === "right") {
        rotateY += angleIncrement;

        setTransform(plurid, rotateX, rotateY, translateX, translateY, scale)

        // plurid.style.transform = "rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";
        // plurid.style.webkitTransform = "rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";
    } else if (direction === "up") {
        rotateX += angleIncrement;

        setTransform(plurid, rotateX, rotateY, translateX, translateY, scale)

        // plurid.style.transform = "rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";
        // plurid.style.webkitTransform = "rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";
    } else if (direction === "down") {
        rotateX -= angleIncrement;

        setTransform(plurid, rotateX, rotateY, translateX, translateY, scale)

        // plurid.style.transform = "rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";
        // plurid.style.webkitTransform = "rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";
    }
}


function movePlurid(event) {
    var direction = getMouseDirection(event);

    var rotateX = getTransform(plurid).rotateX;
    var rotateY = getTransform(plurid).rotateY;
    var translateX = getTransform(plurid).translateX;
    var translateY = getTransform(plurid).translateY;
    var scale = getTransform(plurid).scale;

    var linearIncrement = 3;


    console.log(direction);
}


function scalePlurid(event) {
    var direction = getMouseDirection(event);

    var rotateX = getTransform(plurid).rotateX;
    var rotateY = getTransform(plurid).rotateY;
    var translateX = getTransform(plurid).translateX;
    var translateY = getTransform(plurid).translateY;
    var scale = getTransform(plurid).scale;

    var scaleIncrement = 0.1;


    console.log(direction);
}


function getTransform(element) {
    var values = getMatrixValues(element);

    var rotateX,
        rotateY,
        translateX,
        translateY,
        scale;

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
        translateX = parseFloat(values[12]);
        translateY = parseFloat(values[13]);
        scale = parseFloat(values[0]);
    } else if (values.length == 6) {
        rotateX = 0;
        rotateY = 0;
        translateX = parseFloat(values[4]);
        translateY = parseFloat(values[5]);
        scale = parseFloat(values[0]);
    }

    return {
        rotateX: rotateX,
        rotateY: rotateY,
        translateX: translateX,
        translateY: translateY,
        scale: scale
    };
}

// console.log(getTransform(plurid));

function getMatrixValues(element) {
    var transformValues = window.getComputedStyle(element, null).getPropertyValue("transform");
    var matrixValues = transformValues.split('(')[1].split(')')[0].split(',');

    return matrixValues;
}

// console.log(getMatrixValues(plurid));


function setTransform(element, rotateX, rotateY, translateX, translateY, scale) {
    var transformString = "rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translateX(" + translateX + "px) translateY(" + translateY + "px) scale(" + scale + ")";

    element.style.transform = transformString;
    element.style.webkitTransform = transformString;
}
