import { computeQuaternionFromEulers,
         quaternionFromAxisAngle } from './quaternion';


//get orientation info
if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", () => {
        processGyro(event.alpha, event.beta, event.gamma);
    }, true);
}


// Z - X - Y
processGyro(0, 45, 0);


function processGyro(alpha, beta, gamma) {
	document.getElementById("alpha").innerHTML= alpha.toFixed(5);
	document.getElementById("beta").innerHTML= beta.toFixed(5);
    document.getElementById("gamma").innerHTML = gamma.toFixed(5);

    gyro = computeQuaternionFromEulers(alpha, beta, gamma);

    document.getElementById("x").innerHTML=gyro.x.toFixed(5);
    document.getElementById("y").innerHTML=gyro.y.toFixed(5);
    document.getElementById("z").innerHTML=gyro.z.toFixed(5);
    document.getElementById("w").innerHTML=gyro.w.toFixed(5);

    // let pointRotate = [0, -45, -45];
    // let result = rotatePointViaQuaternion(pointRotate, gyro);
    // console.log(result);

    // let result2 = makeRotationMatrixFromQuaternion(result);
    // console.log(result2);
}

var gyro = quaternionFromAxisAngle(0, 0, 0, 0);
