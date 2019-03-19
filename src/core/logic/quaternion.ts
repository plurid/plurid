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




function makeQuaternion(x: any, y: any, z: any, w: any) {
    return  {
        x,
        y,
        z,
        w,
    };
}


// alpha around Z axis, beta around X axis, and gamma around Y axis
export function computeQuaternionFromEulers(alpha: any, beta: any, gamma: any) {
    let x = degToRad(beta); // beta value
    let y = degToRad(gamma); // gamma value
    let z = degToRad(alpha); // alpha value

    const cX = Math.cos( x / 2 );
    const cY = Math.cos( y / 2 );
    const cZ = Math.cos( z / 2 );
    const sX = Math.sin( x / 2 );
    const sY = Math.sin( y / 2 );
    const sZ = Math.sin( z / 2 );

    const w = cX * cY * cZ - sX * sY * sZ;
    x = sX * cY * cZ - cX * sY * sZ;
    y = cX * sY * cZ + sX * cY * sZ;
    z = cX * cY * sZ + sX * sY * cZ;

    return makeQuaternion(x, y, z, w);
}


export function quaternionFromAxisAngle(x: any, y: any, z: any, angle: any) {
    const q: any = {};
    const halfAngle = angle / 2;
    q.x = x * Math.sin(halfAngle);
    q.y = y * Math.sin(halfAngle);
    q.z = z * Math.sin(halfAngle);
    q.w = Math.cos(halfAngle);
    return q;
}


export function inverseQuaternion(quaternion: any) {
    return makeQuaternion(quaternion.x, quaternion.y, quaternion.z, -quaternion.w);
}


export function conjugateQuaternion(quaternion: any) {
    return makeQuaternion(-quaternion.x, -quaternion.y, -quaternion.z, quaternion.w);
}


export function quaternionMultiply(quaternionArray: any) {
    const temporaryQuaternion = quaternionArray[0];
    const copyQuaternion = {
        x: temporaryQuaternion.x,
        y: temporaryQuaternion.y,
        z: temporaryQuaternion.z,
        w: temporaryQuaternion.w,
    };

    for (let i = 1; i < quaternionArray.length; i ++) {
        const secondaryTemporaryQuaternion = quaternionArray[i];
        const nextQuaternion = {
            x: secondaryTemporaryQuaternion.x,
            y: secondaryTemporaryQuaternion.y,
            z: secondaryTemporaryQuaternion.z,
            w: secondaryTemporaryQuaternion.w,
        };

        const w = copyQuaternion.w * nextQuaternion.w -
                copyQuaternion.x * nextQuaternion.x -
                copyQuaternion.y * nextQuaternion.y -
                copyQuaternion.z * nextQuaternion.z;

        const x = copyQuaternion.x * nextQuaternion.w +
                copyQuaternion.w * nextQuaternion.x +
                copyQuaternion.y * nextQuaternion.z -
                copyQuaternion.z * nextQuaternion.y;

        const y = copyQuaternion.y * nextQuaternion.w +
                copyQuaternion.w * nextQuaternion.y +
                copyQuaternion.z * nextQuaternion.x -
                copyQuaternion.x * nextQuaternion.z;

        const z = copyQuaternion.z * nextQuaternion.w +
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


export function rotatePointViaQuaternion(pointRotate: any, quaternion: any) {
    const temporaryQuaternion = {
        x: pointRotate[0],
        y: pointRotate[1],
        z: pointRotate[2],
        w: 0,
    };
    const rotatedPoint = quaternionMultiply(
        [quaternion, temporaryQuaternion, conjugateQuaternion(quaternion)],
    );

    return {
        x: rotatedPoint.x,
        y: rotatedPoint.y,
        z: rotatedPoint.z,
        w: rotatedPoint.w,
    };
}


export function makeRotationMatrixFromQuaternion(quaternion: any) {
    const num = quaternion.x * 2;
    const num2 = quaternion.y * 2;
    const num3 = quaternion.z * 2;
    const num4 = quaternion.x * num;
    const num5 = quaternion.y * num2;
    const num6 = quaternion.z * num3;
    const num7 = quaternion.x * num2;
    const num8 = quaternion.x * num3;
    const num9 = quaternion.y * num3;
    const num10 = quaternion.w * num;
    const num11 = quaternion.w * num2;
    const num12 = quaternion.w * num3;

    return [
        1 - (num5 + num6),      num7 - num12,           num8 + num11,           0,
        num7 + num12,           1 - (num4 + num6),      num9 - num10,           0,
        num8 - num11,           num9 + num10,           1 - (num4 + num5),      0,
        0,                      0,                      0,                      1,
    ];
}


function degToRad(deg: any) {
    return deg * Math.PI / 180;
}
