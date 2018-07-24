// // testing quaternions
// let quaternionX0_Y45_Z0 = {
//     x: 0,
//     y: 0.38268,
//     z: 0,
//     w: 0.92388
// }


// let quaternionX45_Y0_Z0 = {
//     x: 0.38268,
//     y: 0,
//     z: 0,
//     w: 0.92388
// }

// let result = quaternionMultiply([ quaternionX0_Y45_Z0, quaternionX45_Y0_Z0]);

// let a = makeRotationMatrixFromQuaternion(result);

// let b = '';
// for (let c of a) {
//     b = b + c + ', '
// }
// console.log(b);



// let y_45_quat = computeQuaternionFromEulers(0, 0, 45);
// let rot_mat_y_45 = makeRotationMatrixFromQuaternion(y_45_quat);
// console.log(rot_mat_y_45);

// let rot_mat_y_45_css = '';
// for (let el of rot_mat_y_45) {
//     rot_mat_y_45_css = rot_mat_y_45_css + el + ', '
// }
// console.log(rot_mat_y_45_css);



// let x_45_quat = computeQuaternionFromEulers(0, 45, 0);
// let rot_mat_x_45 = makeRotationMatrixFromQuaternion(x_45_quat);
// console.log(rot_mat_x_45);

// let rot_mat_x_45_css = '';
// for (let el of rot_mat_x_45) {
//     rot_mat_x_45_css = rot_mat_x_45_css + el + ', '
// }
// console.log(rot_mat_x_45_css);


// let quat_mul = quaternionMultiply([y_45_quat, x_45_quat]);
// console.log(quat_mul);
// let rot_mat_x_y_45 = makeRotationMatrixFromQuaternion(quat_mul);
// console.log(rot_mat_x_y_45);

// let rot_mat_x_y_45_css = '';
// for (let el of rot_mat_x_y_45) {
//     rot_mat_x_y_45_css = rot_mat_x_y_45_css + el + ', '
// }
// console.log(rot_mat_x_y_45_css);




function makeQuaternion(x, y, z, w) {
    return  {
        x: x,
        y: y,
        z: z,
        w: w
    };
}


//alpha around Z axis, beta around X axis, and gamma around Y axis
export function computeQuaternionFromEulers(alpha, beta, gamma) {
	let x = degToRad(beta); // beta value
	let y = degToRad(gamma); // gamma value
	let z = degToRad(alpha); // alpha value

	let cX = Math.cos( x/2 );
	let cY = Math.cos( y/2 );
	let cZ = Math.cos( z/2 );
	let sX = Math.sin( x/2 );
	let sY = Math.sin( y/2 );
	let sZ = Math.sin( z/2 );

	let w = cX * cY * cZ - sX * sY * sZ;
	x = sX * cY * cZ - cX * sY * sZ;
	y = cX * sY * cZ + sX * cY * sZ;
	z = cX * cY * sZ + sX * sY * cZ;

	return makeQuaternion(x, y, z, w);
}


export function quaternionFromAxisAngle(x, y, z, angle) {
    let q = {};
    let halfAngle = angle/2;
    q.x = x * Math.sin(halfAngle);
    q.y = y * Math.sin(halfAngle);
    q.z = z * Math.sin(halfAngle);
    q.w = Math.cos(halfAngle);
    return q;
}


function inverseQuaternion(quaternion) {
	return makeQuaternion(quaternion.x, quaternion.y, quaternion.z, -quaternion.w);
}


function conjugateQuaternion(quaternion) {
    return makeQuaternion(-quaternion.x, -quaternion.y, -quaternion.z, quaternion.w);
}


export function quaternionMultiply(quaternionArray) {
    let temporaryQuaternion = quaternionArray[0];
    let copyQuaternion = {
        x: temporaryQuaternion.x,
        y: temporaryQuaternion.y,
        z: temporaryQuaternion.z,
        w: temporaryQuaternion.w
    };

    for(let i=1; i < quaternionArray.length; i ++) {
        let secondaryTemporaryQuaternion = quaternionArray[i];
        let nextQuaternion = {
            x: secondaryTemporaryQuaternion.x,
            y: secondaryTemporaryQuaternion.y,
            z: secondaryTemporaryQuaternion.z,
            w: secondaryTemporaryQuaternion.w
        };

        let w = copyQuaternion.w * nextQuaternion.w -
                copyQuaternion.x * nextQuaternion.x -
                copyQuaternion.y * nextQuaternion.y -
                copyQuaternion.z * nextQuaternion.z;

        let x = copyQuaternion.x * nextQuaternion.w +
                copyQuaternion.w * nextQuaternion.x +
                copyQuaternion.y * nextQuaternion.z -
                copyQuaternion.z * nextQuaternion.y;

        let y = copyQuaternion.y * nextQuaternion.w +
                copyQuaternion.w * nextQuaternion.y +
                copyQuaternion.z * nextQuaternion.x -
                copyQuaternion.x * nextQuaternion.z;

        let z = copyQuaternion.z * nextQuaternion.w +
                copyQuaternion.w * nextQuaternion.z +
                copyQuaternion.x * nextQuaternion.y -
                copyQuaternion.y * nextQuaternion.x;

        copyQuaternion.x = x;
        copyQuaternion.y = y;
        copyQuaternion.z = z;
        copyQuaternion.w = w;
    }

    return copyQuaternion;
}


export function rotatePointViaQuaternion(pointRotate, quaternion) {
    var temporaryQuaternion = {
        x: pointRotate[0],
        y: pointRotate[1],
        z: pointRotate[2],
        w: 0
    };
    let rotatedPoint = quaternionMultiply(
        [quaternion, temporaryQuaternion, inverseQuaternion(quaternion)]
    );

    return {
        x: rotatedPoint.x,
        y: rotatedPoint.y,
        z: rotatedPoint.z,
        w: rotatedPoint.w
    };
}


export function makeRotationMatrixFromQuaternion(quaternion) {
    let num = quaternion.x * 2;
    let num2 = quaternion.y * 2;
    let num3 = quaternion.z * 2;
    let num4 = quaternion.x * num;
    let num5 = quaternion.y * num2;
    let num6 = quaternion.z * num3;
    let num7 = quaternion.x * num2;
    let num8 = quaternion.x * num3;
    let num9 = quaternion.y * num3;
    let num10 = quaternion.w * num;
    let num11 = quaternion.w * num2;
    let num12 = quaternion.w * num3;

    return [
        1 - (num5 + num6),      num7 - num12,           num8 + num11,           0,
        num7 + num12,           1 - (num4 + num6),      num9 - num10,           0,
        num8 - num11,           num9 + num10,           1 - (num4 + num5),      0,
        0,                      0,                      0,                      1
    ];
}


function degToRad(deg) {
     return deg * Math.PI / 180;
}
