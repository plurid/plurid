import * as plurid from "./plurid.js";

var rotateLeft = document.getElementsByClassName('plurid-container-rotate-left');
var rotateRight = document.getElementsByClassName('plurid-container-rotate-right');

var translateLeft = document.getElementsByClassName('plurid-container-translate-left');
var translateUp = document.getElementsByClassName('plurid-container-translate-up');
var translateDown = document.getElementsByClassName('plurid-container-translate-down');
var translateRight = document.getElementsByClassName('plurid-container-translate-right');

var scaleUp = document.getElementsByClassName('plurid-container-scale-up');
var scaleDown = document.getElementsByClassName('plurid-container-scale-down');


var timer;

// TO DO
// fix bug when clicking and moving mouse out of the hover area


var rotatePlurid = function(event, direction) {
    plurid.rotatePlurid(event, plurid.pluridContainer[0].children[0], direction);
    timer = setTimeout(rotatePlurid, 35, event, direction);
}

var translatePlurid = function(event, direction) {
    plurid.translatePlurid(event, plurid.pluridContainer[0].children[0], direction);
    timer = setTimeout(translatePlurid, 25, event, direction);
}

var scalePlurid = function(event, direction) {
    plurid.scalePlurid(event, plurid.pluridContainer[0].children[0], direction);
    timer = setTimeout(scalePlurid, 35, event, direction);
}


// rotation
for (var i=0; i < rotateLeft.length; i++) {
    rotateLeft[i].addEventListener("mousedown", function(event) {
        var direction = "left";
        timer = setTimeout(rotatePlurid, 35, event, direction);
    });

    rotateLeft[i].addEventListener("mouseup", function(event) {
        clearTimeout(timer);
    });
}

for (var i=0; i < rotateRight.length; i++) {
    rotateRight[i].addEventListener("mousedown", function(event) {
        var direction = "right";
        timer = setTimeout(rotatePlurid, 35, event, direction);
    });

    rotateRight[i].addEventListener("mouseup", function(event) {
        clearTimeout(timer);
    });
}


// translation
for (var i=0; i < translateLeft.length; i++) {
    translateLeft[i].addEventListener("mousedown", function(event) {
        var direction = "left";
        timer = setTimeout(translatePlurid, 25, event, direction);
    });

    translateLeft[i].addEventListener("mouseup", function(event) {
        clearTimeout(timer);
    });
}

for (var i=0; i < translateUp.length; i++) {
    translateUp[i].addEventListener("mousedown", function(event) {
        var direction = "up";
        timer = setTimeout(translatePlurid, 25, event, direction);
    });

    translateUp[i].addEventListener("mouseup", function(event) {
        clearTimeout(timer);
    });
}

for (var i=0; i < translateDown.length; i++) {
    translateDown[i].addEventListener("mousedown", function(event) {
        var direction = "down";
        timer = setTimeout(translatePlurid, 25, event, direction);
    });

    translateDown[i].addEventListener("mouseup", function(event) {
        clearTimeout(timer);
    });
}

for (var i=0; i < translateRight.length; i++) {
    translateRight[i].addEventListener("mousedown", function(event) {
        var direction = "right";
        timer = setTimeout(translatePlurid, 25, event, direction);
    });

    translateRight[i].addEventListener("mouseup", function(event) {
        clearTimeout(timer);
    });
}


// scale
for (var i=0; i < scaleUp.length; i++) {
    scaleUp[i].addEventListener("mousedown", function(event) {
        var direction = "up";
        timer = setTimeout(scalePlurid, 35, event, direction);
    });

    scaleUp[i].addEventListener("mouseup", function(event) {
        clearTimeout(timer);
    });
}

for (var i=0; i < scaleDown.length; i++) {
    scaleDown[i].addEventListener("mousedown", function(event) {
        var direction = "down";
        timer = setTimeout(scalePlurid, 35, event, direction);
    });

    scaleDown[i].addEventListener("mouseup", function(event) {
        clearTimeout(timer);
    });
}