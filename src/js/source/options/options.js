import * as plurid from "../logic/transforms.js";
import * as transcore from "../logic/transforms-core.js";
import { getPlurid } from "../logic/get-plurid.js";


setTimeout(() => {

    var rotateLeft = document.getElementsByClassName('plurid-container-rotate-left');
    var rotateUp = document.getElementsByClassName('plurid-container-rotate-up');
    var rotateRight = document.getElementsByClassName('plurid-container-rotate-right');
    var rotateDown = document.getElementsByClassName('plurid-container-rotate-down');

    var translateLeft = document.getElementsByClassName('plurid-container-translate-left');
    var translateUp = document.getElementsByClassName('plurid-container-translate-up');
    var translateRight = document.getElementsByClassName('plurid-container-translate-right');
    var translateDown = document.getElementsByClassName('plurid-container-translate-down');

    var scaleUp = document.getElementsByClassName('plurid-container-scale-up');
    var scaleDown = document.getElementsByClassName('plurid-container-scale-down');

    var moreButton = document.getElementsByClassName('plurid-container-more-button');
    var moreMenu = document.getElementsByClassName('plurid-container-options-more');

    var shortcutsButton = document.getElementsByClassName('plurid-container-shortcuts-button');
    var shortcutsMenu = document.getElementsByClassName('plurid-container-options-shortcuts');

    var pluridToTransform = document.getElementsByTagName("plurid-roots")[0];
    // console.log(pluridToTransform);


    var timer;

    // TO DO
    // fix bug when clicking and moving mouse out of the hover area


    rotateLeft[0].addEventListener("click", event => {
        let direction = "left";
        plurid.rotatePlurid(event, pluridToTransform, direction);
        // console.log(event);
    })

    rotateRight[0].addEventListener("click", event => {
        let direction = "right";
        plurid.rotatePlurid(event, pluridToTransform, direction);
        // console.log(event);
    })

    rotateUp[0].addEventListener("click", event => {
        let direction = "up";
        plurid.rotatePlurid(event, pluridToTransform, direction);
        // console.log(event);
    })

    rotateDown[0].addEventListener("click", event => {
        let direction = "down";
        plurid.rotatePlurid(event, pluridToTransform, direction);
        // console.log(event);
    })





    var rotatePlurid = function(event, direction) {
        plurid.rotatePlurid(event, pluridToTransform, direction);
        timer = setTimeout(rotatePlurid, 35, event, direction);
    }

    var translatePlurid = function(event, direction) {
        plurid.translatePlurid(event, pluridToTransform, direction);
        timer = setTimeout(translatePlurid, 25, event, direction);
    }

    var scalePlurid = function(event, direction) {
        plurid.scalePlurid(event, pluridToTransform, direction);
        timer = setTimeout(scalePlurid, 35, event, direction);
    }


    // rotation
    for (var i=0; i < rotateLeft.length; i++) {
        rotateLeft[i].addEventListener("mousedown", function(event) {
            var direction = "right";
            timer = setTimeout(rotatePlurid, 35, event, direction);
        });

        rotateLeft[i].addEventListener("mouseup", function(event) {
            clearTimeout(timer);
        });
    }

    for (var i=0; i < rotateRight.length; i++) {
        rotateRight[i].addEventListener("mousedown", function(event) {
            var direction = "left";
            timer = setTimeout(rotatePlurid, 35, event, direction);
        });

        rotateRight[i].addEventListener("mouseup", function(event) {
            clearTimeout(timer);
        });
    }

    for (var i=0; i < rotateRight.length; i++) {
        rotateUp[i].addEventListener("mousedown", function(event) {
            var direction = "down";
            timer = setTimeout(rotatePlurid, 35, event, direction);
        });

        rotateUp[i].addEventListener("mouseup", function(event) {
            clearTimeout(timer);
        });
    }


    for (var i=0; i < rotateRight.length; i++) {
        rotateDown[i].addEventListener("mousedown", function(event) {
            var direction = "up";
            timer = setTimeout(rotatePlurid, 35, event, direction);
        });

        rotateDown[i].addEventListener("mouseup", function(event) {
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



    // // background color

    // var pluridContainerBackground = document.getElementsByClassName('plurid-container-color');


    // pluridContainerBackground[0].addEventListener("click", function() {
    //     var pluridBackgroundColor = window.getComputedStyle(plurid.pluridContainer[0], null).getPropertyValue("background-color");
    //     if (pluridBackgroundColor == "rgb(26, 26, 26)" || pluridBackgroundColor == "rgb(25, 25, 25)") {
    //         plurid.pluridContainer[0].style.backgroundColor = "hsl(0, 0%, 40%)";
    //         pluridContainerBackground[0].style.backgroundColor = "hsl(0, 0%, 40%)";
    //     }

    //     if (pluridBackgroundColor == "rgb(102, 102, 102)") {
    //         plurid.pluridContainer[0].style.backgroundColor = "hsl(0, 0%, 93%)";
    //         pluridContainerBackground[0].style.backgroundColor = "hsl(0, 0%, 93%)";
    //     }

    //     if (pluridBackgroundColor == "rgb(238, 238, 238)") {
    //         plurid.pluridContainer[0].style.backgroundColor = "hsl(0, 0%, 10%)";
    //         pluridContainerBackground[0].style.backgroundColor = "hsl(0, 0%, 10%)";
    //     }
    // });

    // // console.log(window.getComputedStyle(plurid.pluridContainer[0], null).getPropertyValue("background-color"))


    // // more menu
    // moreButton[0].addEventListener("click", function() {
    //     moreMenu[0].classList.toggle('plurid-container-options-more-clicked');
    // });



    // // Scroll to Translate
    // var useScrollCheckbox = document.getElementsByClassName('plurid-container-use-scroll');

    // var useScrollToTranslate = useScrollCheckbox[0].checked;

    // useScrollCheckbox[0].addEventListener("change", function() {
    //     if (this.checked) {
    //         useScrollToTranslate = 1;
    //         plurid.pluridContainer[0].addEventListener('wheel', useScrollTranslation);
    //         // console.log(useScrollToTranslate);
    //     } else {
    //         useScrollToTranslate = 0;
    //         // console.log(useScrollToTranslate);
    //         plurid.pluridContainer[0].removeEventListener('wheel', useScrollTranslation);
    //     }
    // });

    // var previousScrollDeltaX = 0;
    // var previousScrollDeltaY = 0;

    // if (useScrollToTranslate) {
    //     plurid.pluridContainer[0].addEventListener('wheel', useScrollTranslation);
    // }

    // function useScrollTranslation(event) {
    //     event.preventDefault();

    //     var currentScrollDeltaX = event.deltaX;
    //     var currentScrollDeltaY = event.deltaY;

    //     if (currentScrollDeltaY < 0
    //         //  &&
    //         //  currentScrollDeltaY == previousScrollDeltaY
    //         ) {
    //         // console.log('scrolling up');
    //         plurid.translatePlurid(event, plurid.pluridContainer[0].children[0], "up");
    //         transcore.setCursor("translate");
    //     }

    //     if (currentScrollDeltaY > 0
    //         // &&
    //         // currentScrollDeltaY == previousScrollDeltaY
    //         ) {
    //         // console.log('scrolling down');
    //         plurid.translatePlurid(event, plurid.pluridContainer[0].children[0], "down");
    //         transcore.setCursor("translate");
    //     }

    //     if (currentScrollDeltaX > 0
    //         // &&
    //         // currentScrollDeltaX == previousScrollDeltaX
    //         ) {
    //         // console.log('scrolling right');
    //         plurid.translatePlurid(event, plurid.pluridContainer[0].children[0], "right");
    //         transcore.setCursor("translate");
    //     }

    //     if (currentScrollDeltaX < 0
    //         // &&
    //         // currentScrollDeltaX == previousScrollDeltaX
    //         ) {
    //         // console.log('scrolling left');
    //         plurid.translatePlurid(event, plurid.pluridContainer[0].children[0], "left");
    //         transcore.setCursor("translate");
    //     }

    //     previousScrollDeltaX = currentScrollDeltaX
    //     previousScrollDeltaY = currentScrollDeltaY

    //     // console.log("X", event.deltaX, "|", "Y", event.deltaY);
    // }


    // // Shortcuts Menu
    // shortcutsButton[0].addEventListener("click", function() {
    //     console.log("a");
    //     shortcutsMenu[0].classList.toggle('plurid-container-options-shortcuts-clicked');
    // });

}, 500 );