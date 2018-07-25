import { computeQuaternionFromEulers,
         quaternionFromAxisAngle } from './quaternion';
import { rotateMatrix,
         translateMatrix,
         scaleMatrix } from './matrix';
import { setTransform,
         getTransformTranslate,
         getTransformScale,
         getyPos } from './transforms-core';



// Z - X - Y
// processGyro(0, 0, 30);
// var gyro = quaternionFromAxisAngle(0, 0, 0, 0);


//get orientation info
if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", event => {
        let plurid = document.getElementById(pluridScene.meta.activePlurid);
        processGyro(event.alpha, event.beta, event.gamma, plurid);
    }, true);
}


function processGyro(alpha, beta, gamma, plurid) {
	document.getElementById("alpha").innerHTML= alpha.toFixed(5);
	document.getElementById("beta").innerHTML= beta.toFixed(5);
    document.getElementById("gamma").innerHTML = gamma.toFixed(5);

    // X
    beta = -beta;
    // beta = 0;

    // Y
    gamma = -gamma;
    // gamma = 0;

    // Z
    alpha = 0;

    let valRotationMatrix = rotateMatrix(beta, gamma, alpha);

    var translateX = getTransformTranslate(plurid).translateX;
    var translateY = getTransformTranslate(plurid).translateY;
    var translateZ = 0;
    var scale = getTransformScale(plurid).scale;

    var valTranslationMatrix = translateMatrix(translateX, translateY, translateZ);
    var valScaleMatrix = scaleMatrix(scale);

    var yPos = getyPos(event, plurid);

    setTransform(plurid, valRotationMatrix, valTranslationMatrix, valScaleMatrix, yPos);

    // gyro = computeQuaternionFromEulers(alpha, beta, gamma);
    // document.getElementById("x").innerHTML=gyro.x.toFixed(5);
    // document.getElementById("y").innerHTML=gyro.y.toFixed(5);
    // document.getElementById("z").innerHTML=gyro.z.toFixed(5);
    // document.getElementById("w").innerHTML=gyro.w.toFixed(5);
}
