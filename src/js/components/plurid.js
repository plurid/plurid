var plurid = document.getElementById('plurid');

var lastPosition = {};

plurid.addEventListener("mousedown", function() {
    plurid.addEventListener("mousemove", function(event) {
        detectDirection(event, lastPosition, angle);
    })
})

function detectDirection(e, pos, a) {
    if (typeof(lastPosition.x) != 'undefined') {
        var deltaX = lastPosition.x - event.offsetX,
            deltaY = lastPosition.y - event.offsetY;
        if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0) {
            //left
            console.log(angle + "left");
        } else if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < 0) {
            //right
            console.log(angle + "right");
        } else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 0) {
            //up
            console.log(angle + "up");
        } else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < 0) {
            //down
            console.log(angle + "down");
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

    if (values !== 'none') {
        var pi = Math.PI,
            sinB = parseFloat(values[8]),
            b = Math.round(Math.asin(sinB) * 180 / pi),
            cosB = Math.cos(b * pi / 180),
            matrixVal10 = parseFloat(values[9]),
            a = Math.round(Math.asin(-matrixVal10 / cosB) * 180 / pi),
            matrixVal1 = parseFloat(values[0]),
            c = Math.round(Math.acos(matrixVal1 / cosB) * 180 / pi);

        rotateX = a;
        rotateY = b;
        rotateZ = c;
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

// console.log(getMatrixValues(plurid));
