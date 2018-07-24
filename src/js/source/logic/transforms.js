import { getPlurid } from "./get-plurid.js";
import { getDirection } from "./directions.js";
import * as transcore from "./transforms-core.js";
import * as matrix from "./matrix.js";


var rotateX = 0.5;
var rotateY = 0.5;

export function rotatePlurid(event, plurid, direction = null) {
    // console.log("ROTATE");
    // console.log("Event", event);
    // console.log("----------------------------------")

    // let plurid = getPlurid(event);
    // console.log("Plurid", plurid);

    if (direction == null) {
        direction = getDirection(event);
    }
    // console.log("Direction", direction);


    // var rotateX = -1 * transcore.getTransformRotate(plurid).rotateX * 180 / Math.PI;
    // var rotateY = -1 * transcore.getTransformRotate(plurid).rotateY * 180 / Math.PI;
    var translateX = transcore.getTransformTranslate(plurid).translateX;
    var translateY = transcore.getTransformTranslate(plurid).translateY;
    var translateZ = 0;
    var scale = transcore.getTransformScale(plurid).scale;

    let valRotationMatrix = matrix.rotateMatrix(rotateX, rotateY);
    var valtranslationMatrix = matrix.translateMatrix(translateX, translateY, 0);
    var valscaleMatrix = matrix.scaleMatrix(scale);

    var yPos = transcore.getyPos(event, plurid);

    if (scale < 0.5) {
        var angleIncrement = 4.5;
    } else {
        var angleIncrement = 4.5;
    }

    console.log("----------------------------------")
    console.log("Rotate X", rotateX);
    console.log("Rotate Y",rotateY);
    console.log("Translate X", translateX);
    console.log("Translate Y", translateY);
    console.log("Scale", scale);

    plurid.style.transition = "0ms ease-in-out";

    if (direction === "left") {
        rotateY -= angleIncrement;
        valRotationMatrix = matrix.rotateMatrix(rotateX, rotateY);

        transcore.setTransform(plurid, valRotationMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }

    if (direction === "right") {
        rotateY += angleIncrement;
        valRotationMatrix = matrix.rotateMatrix(rotateX, rotateY);

        transcore.setTransform(plurid, valRotationMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }

    if (direction === "up") {
        rotateX += angleIncrement;
        valRotationMatrix = matrix.rotateMatrix(rotateX, rotateY);

        transcore.setTransform(plurid, valRotationMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }

    if (direction === "down") {
        rotateX -= angleIncrement;
        valRotationMatrix = matrix.rotateMatrix(rotateX, rotateY);

        transcore.setTransform(plurid, valRotationMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }
}


export function translatePlurid(event, plurid, direction = null) {
    // console.log("TRANSLATE");
    // console.log("Event", event);

    // let plurid = getPlurid(event);
    // console.log("Plurid", plurid);

    if (direction == null) {
        direction = getDirection(event);
    }
    // console.log("Direction", direction);


    // var rotateX = -1 * transcore.getTransformRotate(plurid).rotateX * 180 / Math.PI;
    // var rotateY = -1 * transcore.getTransformRotate(plurid).rotateY * 180 / Math.PI;
    var translateX = transcore.getTransformTranslate(plurid).translateX;
    var translateY = transcore.getTransformTranslate(plurid).translateY;
    var translateZ = 0;
    var scale = transcore.getTransformScale(plurid).scale;

    let valRotationMatrix = matrix.rotateMatrix(rotateX, rotateY);
    var valtranslationMatrix = matrix.translateMatrix(translateX, translateY, 0);
    var valscaleMatrix = matrix.scaleMatrix(scale);

    var yPos = transcore.getyPos(event, plurid);

    if (scale < 0.5) {
        var linearIncrement = 50;
    } else {
        var linearIncrement = 30;
    }

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

    plurid.style.transition = "20ms ease-in-out";

    if (direction === "left") {
        translateX -= linearIncrement;
        var valtranslationMatrix = matrix.translateMatrix(translateX, translateY, translateZ);

        transcore.setTransform(plurid, valRotationMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }

    if (direction === "right") {
        translateX += linearIncrement;
        var valtranslationMatrix = matrix.translateMatrix(translateX, translateY, translateZ);

        transcore.setTransform(plurid, valRotationMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }

    if (direction === "up") {
        translateY -= linearIncrement;
        var valtranslationMatrix = matrix.translateMatrix(translateX, translateY, translateZ);

        transcore.setTransform(plurid, valRotationMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }

    if (direction === "down") {
        translateY += linearIncrement;
        var valtranslationMatrix = matrix.translateMatrix(translateX, translateY, translateZ);

        transcore.setTransform(plurid, valRotationMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }
}


export function scalePlurid(event, plurid, direction = null) {
    // console.log("SCALE");
    // console.log("Event", event);

    // let plurid = getPlurid(event);
    // console.log("Plurid", plurid);

    if (direction == null) {
        direction = getDirection(event);
    }
    // console.log("Direction", direction);

    // var rotateX = -1 * transcore.getTransformRotate(plurid).rotateX * 180 / Math.PI;
    // var rotateY = -1 * transcore.getTransformRotate(plurid).rotateY * 180 / Math.PI;
    var translateX = transcore.getTransformTranslate(plurid).translateX;
    var translateY = transcore.getTransformTranslate(plurid).translateY;
    var translateZ = 0;
    var scale = transcore.getTransformScale(plurid).scale;

    let valRotationMatrix = matrix.rotateMatrix(rotateX, rotateY);
    var valtranslationMatrix = matrix.translateMatrix(translateX, translateY, 0);
    var valscaleMatrix = matrix.scaleMatrix(scale);

    var yPos = transcore.getyPos(event, plurid);

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

    plurid.style.transition = "20ms ease-in-out";

    if (direction === "up" || direction === "upright" || direction === "upleft") {
        scale += scaleIncrement;

        if (scale > 4) {
            scale = 4
        }

        var valscaleMatrix = matrix.scaleMatrix(scale);

        transcore.setTransform(plurid, valRotationMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }

    if (direction === "down" || direction === "downleft" || direction === "downright") {
        scale -= scaleIncrement;

        if (scale < 0.1) {
            scale = 0.1
        }

        var valscaleMatrix = matrix.scaleMatrix(scale);

        transcore.setTransform(plurid, valRotationMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }
}
