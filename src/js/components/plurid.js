var plurid = document.getElementById('plurid');

var lastPosition = {};


plurid.addEventListener("mousedown", function() {
    plurid.addEventListener("mousemove", function(event) {
        detectDirection(event, lastPosition);
    })
})

function detectDirection(e, pos) {
    if (typeof(lastPosition.x) != 'undefined') {
        var deltaX = lastPosition.x - event.offsetX,
            deltaY = lastPosition.y - event.offsetY;
        if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0) {
            //left
            console.log("left");
        } else if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < 0) {
            //right
            console.log("right");
        } else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 0) {
            //up
            console.log("up");
        } else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < 0) {
            //down
            console.log("down");
        }
    }

    lastPosition = {
        x : event.offsetX,
        y : event.offsetY
    };
}


function getTransform(element) {
    var values = getMatrixValues(element);

    var rotateX = 0,
        rotateY = 0,
        rotateZ = 0;

    var pi = Math.PI;

    if (values !== 'none') {
        // rotX
        var cos1ForX = parseFloat(values[5]);
        var sin1ForX = parseFloat(values[6]);
        var sin2ForX = parseFloat(values[9]);

        if (sin1ForX > 0) {
            console.log('X a');
            var rotX = Math.acos(cos1ForX) * 180 / pi;
        } else if (sin1ForX < 0 && cos1ForX < 0) {
            console.log('X b');
            var rotX = Math.asin(sin1ForX) * 180 / pi * (-1) + 180;
        } else if (cos1ForX == 0) {
            console.log('X c');
            var rotX = 0;
        } else {
            console.log('X d');
            var rotX = 360 - Math.acos(cos1ForX) * 180 / pi;
        }

        // rotY
        var cos1ForY = parseFloat(values[0]);
        var sin1ForY = parseFloat(values[2]);
        var sin2ForY = parseFloat(values[8]);


        if (sin1ForY > 0 && sin2ForY < 0) {
            console.log('Y a0');
            var rotY = 360 - Math.acos(cos1ForY) * 180 / pi;
        } else if (sin1ForY > 0) {
            console.log('Y a');
            var rotY = Math.acos(cos1ForY) * 180 / pi;
        } else if (sin1ForY < 0 && cos1ForY < 0) {
            console.log('Y b');
            var rotY = Math.asin(sin2ForY) * 180 / pi * (-1) + 180;
        } else if (sin1ForY < 0) {
            console.log('Y c');
            var rotY = Math.asin(sin2ForY) * 180 / pi;
        } else if (cos1ForY == 1) {
            console.log('Y d');
            var rotY = 0;
        } else {
            console.log('Y e');
            var rotY = 360 - Math.acos(cos1ForY) * 180 / pi;
        }

        // console.log(`sin1: ${sin1ForY}, sin2: ${sin2ForY}`);
        // console.log(`cos1: ${cos1ForY}`);

        rotateX = rotX.toPrecision(4);
        rotateY = rotY.toPrecision(4);
    }

    return {
        rotateX: rotateX,
        rotateY: rotateY,
    };
}

console.log(getTransform(plurid));


function getMatrixValues(element) {
    var transformValues = window.getComputedStyle(element, null).getPropertyValue("transform");
    var matrixValues = transformValues.split('(')[1].split(')')[0].split(',');

    return matrixValues;
}

console.log(getMatrixValues(plurid));
