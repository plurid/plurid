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
        var cos1ForX = parseFloat(values[5]);
        var sin1ForX = parseFloat(values[6]);
        var sin2ForX = parseFloat(values[9]);
        var cos2ForX = parseFloat(values[10]);
        // if (sin1ForX > 0 && cos1ForX > 0) {
        //     var rotX = Math.asin(sin1ForX) * 180 / pi;
        // } else if (sin1ForX > 0 && cos1ForX < 0) {
        //     var rotX = Math.acos(cos1ForX) * 180 / pi;
        // } else {
        //     var rotX = Math.acos(cos1ForX) * 180 / pi;
        // }
        if (sin1ForX > 0) {
            var rotX = Math.acos(cos1ForX) * 180 / pi;
        } else if (sin1ForX < 0 && cos1ForX < 0){
            var rotX = Math.asin(sin2ForX) * 180 / pi + 180;
        } else if (cos1ForX == 0) {
            var rotX = 0;
        } else {
            console.log('test');
            var rotX = 360 - Math.acos(cos1ForX) * 180 / pi;
        }

        // console.log(`sin1: ${sin1ForX}, sin2: ${sin2ForX}`);
        // console.log(`cos1: ${cos1ForX}, cos2: ${cos2ForX}`);


        var cosForY = parseFloat(values[0]);
        var rotY = Math.acos(cosForY) * 180 / pi;

        var sinForZ = parseFloat(values[1]);
        var rotZ = Math.asin(sinForZ) * 180 / pi;


        rotateX = rotX.toPrecision(4);
        rotateY = rotY.toPrecision(4);
        rotateZ = rotZ.toPrecision(4);
    }

    return {
        rotateX: rotateX,
        rotateY: rotateY,
        rotateZ: rotateZ
    };
}

console.log(getTransform(plurid));


function getMatrixValues(element) {
    var transformValues = window.getComputedStyle(element, null).getPropertyValue("transform");
    var matrixValues = transformValues.split('(')[1].split(')')[0].split(',');

    return matrixValues;
}

console.log(getMatrixValues(plurid));
