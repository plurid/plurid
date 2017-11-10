import * as plurid from "./plurid.js";

var rotateLeft = document.getElementsByClassName('plurid-container-rotate-left');
var rotateRight = document.getElementsByClassName('plurid-container-rotate-right');

var translateLeft = document.getElementsByClassName('plurid-container-translate-left');
var translateUp = document.getElementsByClassName('plurid-container-translate-up');
var translateDown = document.getElementsByClassName('plurid-container-translate-down');
var translateRight = document.getElementsByClassName('plurid-container-translate-right');

var scaleUp = document.getElementsByClassName('plurid-container-scale-up');
var scaleDown = document.getElementsByClassName('plurid-container-scale-down');

var moreButton = document.getElementsByClassName('plurid-container-more-button');
var moreMenu = document.getElementsByClassName('plurid-container-options-more');

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



// background color

var pluridContainerBackground = document.getElementsByClassName('plurid-container-color');


pluridContainerBackground[0].addEventListener("click", function() {
    var pluridBackgroundColor = window.getComputedStyle(plurid.pluridContainer[0], null).getPropertyValue("background-color");
    if (pluridBackgroundColor == "rgb(26, 26, 26)" || pluridBackgroundColor == "rgb(25, 25, 25)") {
        plurid.pluridContainer[0].style.backgroundColor = "hsl(0, 0%, 40%)";
        pluridContainerBackground[0].style.backgroundColor = "hsl(0, 0%, 40%)";
    }

    if (pluridBackgroundColor == "rgb(102, 102, 102)") {
        plurid.pluridContainer[0].style.backgroundColor = "hsl(0, 0%, 93%)";
        pluridContainerBackground[0].style.backgroundColor = "hsl(0, 0%, 93%)";
    }

    if (pluridBackgroundColor == "rgb(238, 238, 238)") {
        plurid.pluridContainer[0].style.backgroundColor = "hsl(0, 0%, 10%)";
        pluridContainerBackground[0].style.backgroundColor = "hsl(0, 0%, 10%)";
    }
});

// console.log(window.getComputedStyle(plurid.pluridContainer[0], null).getPropertyValue("background-color"))


// more menu

moreButton[0].addEventListener("click", function() {
    // if (moreMenu[0].style.display == "" || moreMenu[0].style.display == "none") {
    //     moreMenu[0].style.display = "block";
    // } else if (moreMenu[0].style.display == "block") {
    //     moreMenu[0].style.display = "none";
    // }

    moreMenu[0].classList.toggle('plurid-container-options-more-clicked');

});