import * as matrix from "./matrix.js";
import * as utils from "./utils.js";
import * as bridges from "./bridges.js"

var pluridContainer = document.getElementsByClassName('plurid-container');


// Basic Rotation, Translation, Scaling of the Plurid Card
for (var i = 0; i < pluridContainer.length; i++) {
    pluridContainer[i].addEventListener("mousemove", function(event) {
        // console.log(this.children[0]);
        if (!!event.shiftKey) {
            rotatePlurid(event, this.children[0]);
            utils.setCursor("rotate");
        }

        if (!!event.altKey) {
            translatePlurid(event, this.children[0]);
            utils.setCursor("translate");
        }

        if (!!event.ctrlKey || !!event.metaKey) {
            scalePlurid(event, this.children[0]);
            utils.setCursor("scale");
        }

        // if (!event.shiftKey || !event.altKey || !event.ctrlKey) {
        //     utils.setCursor("default");
        // }
    });
}

// Set cursor back to default (a bit laggy/buggy)
document.addEventListener("keyup", function (event) {
    if (event.key == "Ctrl" || event.key == "Shift" || event.key == "Alt" || event.key == "Meta") {
            utils.setCursor("default");
    }
});


// var pluridSheets = document.getElementsByClassName('plurid-sheet');

// console.log(pluridSheets[0]);

// for (var i = 0; i < pluridContainer.length; i++) {
//     pluridSheets[0].addEventListener("mousemove", function(event) {
//         // console.log(this.children[0]);
//         if (!!event.shiftKey) {
//             rotatePlurid(event, this);
//         }

//         if (!!event.altKey) {
//             translatePlurid(event, this)
//         }

//         if (!!event.ctrlKey || !!event.metaKey) {
//             scalePlurid(event, this)
//         }
//     });
// }


// Reset Transforms at Double Click
for (var i = 0; i < pluridContainer.length; i++) {
    pluridContainer[i].addEventListener('dblclick', function(event) {
        var plurid = this.children[0];
        var translateY = utils.getTransformTranslate(plurid).translateY;

        var valrotationXMatrix = matrix.rotateXMatrix(0);
        var valrotationYMatrix = matrix.rotateYMatrix(0);
        var valtranslationMatrix = matrix.translateMatrix(0, translateY, 0);
        var valscaleMatrix = matrix.scaleMatrix(1);

        var yPos = utils.getyPos(event, plurid);

        utils.setTransform(plurid, valrotationXMatrix, valrotationYMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    });
}


function rotatePlurid(event, plurid) {
    var direction = utils.getMouseDirection(event);
    // console.log("Direction", direction);

    var rotateX = utils.getTransformRotate(plurid).rotateX;
    var rotateY = utils.getTransformRotate(plurid).rotateY;
    var translateX = utils.getTransformTranslate(plurid).translateX;
    var translateY = utils.getTransformTranslate(plurid).translateY;
    var translateZ = 0;
    var scale = utils.getTransformScale(plurid).scale;

    var valrotationXMatrix = matrix.rotateXMatrix(-1 * rotateX);
    var valrotationYMatrix = matrix.rotateYMatrix(-1 * rotateY);
    var valtranslationMatrix = matrix.translateMatrix(translateX, translateY, 0);
    var valscaleMatrix = matrix.scaleMatrix(scale);

    var yPos = utils.getyPos(event, plurid);

    var angleIncrement = 0.08;

    // console.log("----------------------------------")
    // console.log("Rotate X", rotateX);
    // console.log("Rotate X in Degrees", rotateX*180/Math.PI);
    // console.log("Rotate Y",rotateY);
    // console.log("Rotate Y in Degrees",rotateY*180/Math.PI);
    // console.log("Rotate Y",rotateY);
    // console.log("Translate X", translateX);
    // console.log("Translate Y", translateY);
    // console.log("Scale", scale);

    // ISSUE
    // issue with the angle jumping over 2*pi when having both X and Y movement

    if (direction === "left") {
        rotateY -= angleIncrement;
        valrotationYMatrix = matrix.rotateYMatrix(-1 * rotateY);

        // console.log("valrotationXMatrix", valrotationXMatrix);
        // console.log("valrotationYMatrix", valrotationYMatrix);
        // console.log("valtranslationMatrix", valtranslationMatrix);
        // console.log("valscaleMatrix", valscaleMatrix);

        utils.setTransform(plurid, valrotationXMatrix, valrotationYMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }

    if (direction === "right") {
        rotateY += angleIncrement;
        valrotationYMatrix = matrix.rotateYMatrix(-1 * rotateY);

        utils.setTransform(plurid, valrotationXMatrix, valrotationYMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }

    // if (direction === "up") {
    //     rotateX += angleIncrement;
    //     valrotationXMatrix = matrix.rotateXMatrix(-1 * rotateX);

    //     utils.setTransform(plurid, valrotationXMatrix, valrotationYMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    // }

    // if (direction === "down") {
    //     rotateX -= angleIncrement;

    //     valrotationXMatrix = matrix.rotateXMatrix(-1 * rotateX);

    //     utils.setTransform(plurid, valrotationXMatrix, valrotationYMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    // }
}


function translatePlurid(event, plurid) {
    var direction = utils.getMouseDirection(event);
    // console.log("Direction", direction);

    var rotateX = utils.getTransformRotate(plurid).rotateX;
    var rotateY = utils.getTransformRotate(plurid).rotateY;
    var translateX = utils.getTransformTranslate(plurid).translateX;
    var translateY = utils.getTransformTranslate(plurid).translateY;
    var translateZ = 0;
    var scale = utils.getTransformScale(plurid).scale;

    var valrotationXMatrix = matrix.rotateXMatrix(-1 * rotateX);
    var valrotationYMatrix = matrix.rotateYMatrix(-1 * rotateY);
    var valtranslationMatrix = matrix.translateMatrix(translateX, translateY, 0);
    var valscaleMatrix = matrix.scaleMatrix(scale);

    var yPos = utils.getyPos(event, plurid);

    var linearIncrement = 10;

    // console.log("----------------------------------")
    // console.log("Rotate X", rotateX);
    // console.log("Rotate Y",rotateY);
    // console.log("Translate X", translateX);
    // console.log("Translate Y", translateY);
    // console.log("Scale", scale);
    // console.log("getRotateXMatrix", getRotateXMatrix);
    // console.log("getRotateYMatrix", getRotateYMatrix);
    // console.log("getTranslateMatrix", getTranslateMatrix);
    // console.log("getScaleMatrix", getScaleMatrix);

    if (direction === "left") {
        translateX -= linearIncrement;
        var valtranslationMatrix = matrix.translateMatrix(translateX, translateY, translateZ);

        // console.log("valrotationXMatrix", valrotationXMatrix);
        // console.log("valrotationYMatrix", valrotationYMatrix);
        // console.log("valtranslationMatrix", valtranslationMatrix);
        // console.log("valscaleMatrix", valscaleMatrix);

        utils.setTransform(plurid, valrotationXMatrix, valrotationYMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }

    if (direction === "right") {
        translateX += linearIncrement;
        var valtranslationMatrix = matrix.translateMatrix(translateX, translateY, translateZ);

        utils.setTransform(plurid, valrotationXMatrix, valrotationYMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }

    if (direction === "up") {
        translateY -= linearIncrement;
        var valtranslationMatrix = matrix.translateMatrix(translateX, translateY, translateZ);

        utils.setTransform(plurid, valrotationXMatrix, valrotationYMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }

    if (direction === "down") {
        translateY += linearIncrement;
        var valtranslationMatrix = matrix.translateMatrix(translateX, translateY, translateZ);

        utils.setTransform(plurid, valrotationXMatrix, valrotationYMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }
}


function scalePlurid(event, plurid) {
    var direction = utils.getMouseDirection(event);
    // console.log("Direction", direction);

    var rotateX = utils.getTransformRotate(plurid).rotateX;
    var rotateY = utils.getTransformRotate(plurid).rotateY;
    var translateX = utils.getTransformTranslate(plurid).translateX;
    var translateY = utils.getTransformTranslate(plurid).translateY;
    var translateZ = 0;
    var scale = utils.getTransformScale(plurid).scale;

    var valrotationXMatrix = matrix.rotateXMatrix(-1 * rotateX);
    var valrotationYMatrix = matrix.rotateYMatrix(-1 * rotateY);
    var valtranslationMatrix = matrix.translateMatrix(translateX, translateY, 0);
    var valscaleMatrix = matrix.scaleMatrix(scale);

    var yPos = utils.getyPos(event, plurid);

    var scaleIncrement = 0.05;

    // console.log("----------------------------------")
    // console.log("Rotate X", rotateX);
    // console.log("Rotate Y",rotateY);
    // console.log("Translate X", translateX);
    // console.log("Translate Y", translateY);
    // console.log("Scale", scale);
    // console.log("getRotateXMatrix", getRotateXMatrix);
    // console.log("getRotateYMatrix", getRotateYMatrix);
    // console.log("getTranslateMatrix", getTranslateMatrix);
    // console.log("getScaleMatrix", getScaleMatrix);

    if (direction === "up") {
        scale += scaleIncrement;

        if (scale > 4) {
            scale = 4
        }

        var valscaleMatrix = matrix.scaleMatrix(scale);

        utils.setTransform(plurid, valrotationXMatrix, valrotationYMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }

    if (direction === "down") {
        scale -= scaleIncrement;

        if (scale < 0.1) {
            scale = 0.1
        }

        var valscaleMatrix = matrix.scaleMatrix(scale);

        utils.setTransform(plurid, valrotationXMatrix, valrotationYMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }
}
