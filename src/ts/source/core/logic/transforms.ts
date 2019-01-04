import { rotateViewcube } from '../../elements/viewcube/viewcube-core';
import { getDirection } from "./directions";
// import { getPlurid } from "./get-plurid";
import * as matrix from "./matrix";
// import { getTransformRotate } from './transforms-core';
import * as transcore from "./transforms-core";



let rotateX = 0.5;
let rotateY = 0.5;


export function rotation(transform: any) {
    const event = transform.event;
    const plurid = transform.plurid;
    const direction = transform.direction ? transform.direction : getDirection(event);
    // let rotX = transform.rotateX ? transform.rotateX : rotateX;
    // let rotY = transform.rotateY ? transform.rotateY : rotateY;
    // let rotateX = transform.rotateX ? transform.rotateX : getTransformRotate(plurid).rotateX;
    // let rotateY = transform.rotateY ? transform.rotateY : getTransformRotate(plurid).rotateY;

    // console.log(rotateX);
    // console.log(rotateY);

    // rotatePlurid(event, plurid, direction, rotX, rotY);
    rotatePlurid(event, plurid, direction);
    if (plurid.nodeName === 'PLURID-ROOTS') {
        rotateViewcube(event, plurid, rotateX, rotateY);
    }
}



export function rotatePlurid(event: any, plurid: any, direction: any = null) {
    let angleIncrement: any;
    // console.log("ROTATE");
    // console.log("Event", event);
    // console.log("----------------------------------")

    // var rotateX = -1 * transcore.getTransformRotate(plurid).rotateX * 180 / Math.PI;
    // var rotateY = -1 * transcore.getTransformRotate(plurid).rotateY * 180 / Math.PI;
    const translateX = transcore.getTransformTranslate(plurid).translateX;
    const translateY = transcore.getTransformTranslate(plurid).translateY;
    const translateZ = 0;
    const scale = transcore.getTransformScale(plurid).scale;

    let valRotationMatrix = matrix.rotateMatrix(rotateX, rotateY);
    const valtranslationMatrix = matrix.translateMatrix(translateX, translateY, 0);
    const valscaleMatrix = matrix.scaleMatrix(scale);

    const yPos = transcore.getyPos(event, plurid);

    if (scale < 0.5) {
        angleIncrement = 4.5;
    } else {
        angleIncrement = 4.5;
    }

    // console.log("----------------------------------")
    // console.log("Rotate X", rotateX);
    // console.log("Rotate Y",rotateY);
    // console.log("Translate X", translateX);
    // console.log("Translate Y", translateY);
    // console.log("Scale", scale);

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


export function translatePlurid(event: any, plurid: any, direction: any = null) {
    let linearIncrement: any;
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
    let translateX = transcore.getTransformTranslate(plurid).translateX;
    let translateY = transcore.getTransformTranslate(plurid).translateY;
    const translateZ = 0;
    const scale = transcore.getTransformScale(plurid).scale;

    const valRotationMatrix = matrix.rotateMatrix(rotateX, rotateY);
    let valtranslationMatrix = matrix.translateMatrix(translateX, translateY, 0);
    const valscaleMatrix = matrix.scaleMatrix(scale);

    const yPos = transcore.getyPos(event, plurid);

    if (scale < 0.5) {
        linearIncrement = 50;
    } else {
        linearIncrement = 30;
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
        translateX += linearIncrement;
        valtranslationMatrix = matrix.translateMatrix(translateX, translateY, translateZ);

        transcore.setTransform(plurid, valRotationMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }

    if (direction === "right") {
        translateX -= linearIncrement;
        valtranslationMatrix = matrix.translateMatrix(translateX, translateY, translateZ);

        transcore.setTransform(plurid, valRotationMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }

    if (direction === "up") {
        translateY += linearIncrement;
        valtranslationMatrix = matrix.translateMatrix(translateX, translateY, translateZ);

        transcore.setTransform(plurid, valRotationMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }

    if (direction === "down") {
        translateY -= linearIncrement;
        valtranslationMatrix = matrix.translateMatrix(translateX, translateY, translateZ);

        transcore.setTransform(plurid, valRotationMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }
}


export function scalePlurid(event: any, plurid: any, direction: any = null) {
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
    const translateX = transcore.getTransformTranslate(plurid).translateX;
    const translateY = transcore.getTransformTranslate(plurid).translateY;
    const translateZ = 0;
    let scale = transcore.getTransformScale(plurid).scale;

    const valRotationMatrix = matrix.rotateMatrix(rotateX, rotateY);
    const valtranslationMatrix = matrix.translateMatrix(translateX, translateY, 0);
    let valscaleMatrix = matrix.scaleMatrix(scale);

    const yPos = transcore.getyPos(event, plurid);

    const scaleIncrement = 0.05;

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
            scale = 4;
        }

        valscaleMatrix = matrix.scaleMatrix(scale);

        transcore.setTransform(plurid, valRotationMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }

    if (direction === "down" || direction === "downleft" || direction === "downright") {
        scale -= scaleIncrement;

        if (scale < 0.1) {
            scale = 0.1;
        }

        valscaleMatrix = matrix.scaleMatrix(scale);

        transcore.setTransform(plurid, valRotationMatrix, valtranslationMatrix, valscaleMatrix, yPos);
    }
}
