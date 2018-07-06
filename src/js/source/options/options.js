import * as plurid from "../logic/transforms.js";
import * as transcore from "../logic/transforms-core.js";
import { getPlurid } from "../logic/get-plurid.js";


setTimeout(() => {

    // background color

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

    // console.log(window.getComputedStyle(plurid.pluridContainer[0], null).getPropertyValue("background-color"))



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
