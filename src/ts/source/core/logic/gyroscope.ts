import {
        rotateMatrix,
        scaleMatrix,
        translateMatrix,
        } from './matrix';
import {
        getTransformScale,
        getTransformTranslate,
        getyPos,
        setTransform,
        } from './transforms-core';
// import { computeQuaternionFromEulers,
//          quaternionFromAxisAngle } from './quaternion';


// Z - X - Y
// processGyro(0, 0, 30);
// var gyro = quaternionFromAxisAngle(0, 0, 0, 0);


// get orientation info
if ((<any> window).DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", (event) => {
        const plurid = document.getElementById((<any> window).pluridScene.meta.activePlurid);
        processGyro(event.alpha, event.beta, event.gamma, plurid);
    }, true);
}


function processGyro(alpha, beta, gamma, plurid) {
    document.getElementById("alpha").innerHTML = alpha.toFixed(5);
    document.getElementById("beta").innerHTML = beta.toFixed(5);
    document.getElementById("gamma").innerHTML = gamma.toFixed(5);

    // X
    beta = -beta;
    // beta = 0;

    // Y
    gamma = -gamma;
    // gamma = 0;

    // Z
    alpha = 0;

    const valRotationMatrix = rotateMatrix(beta, gamma, alpha);

    const translateX = getTransformTranslate(plurid).translateX;
    const translateY = getTransformTranslate(plurid).translateY;
    const translateZ = 0;
    const scale = getTransformScale(plurid).scale;

    const valTranslationMatrix = translateMatrix(translateX, translateY, translateZ);
    const valScaleMatrix = scaleMatrix(scale);

    const yPos = getyPos(event, plurid);

    setTransform(plurid, valRotationMatrix, valTranslationMatrix, valScaleMatrix, yPos);

    // gyro = computeQuaternionFromEulers(alpha, beta, gamma);
    // document.getElementById("x").innerHTML=gyro.x.toFixed(5);
    // document.getElementById("y").innerHTML=gyro.y.toFixed(5);
    // document.getElementById("z").innerHTML=gyro.z.toFixed(5);
    // document.getElementById("w").innerHTML=gyro.w.toFixed(5);
}
