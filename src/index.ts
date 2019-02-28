import { getWheelDirection } from './modules/getDirection';
import {
    rotateMatrix,
    translateMatrix,
    scaleMatrix,
    multiplyMatrices,
    multiplyArrayOfMatrices,
    matrixArrayToCSSMatrix
} from './modules/matrix';
import {
    makeQuaternion,
    zeroQuaternion,
    degToRad,
    computeQuaternionFromEulers,
    quaternionFromAxisAngle,
    inverseQuaternion,
    conjugateQuaternion,
    quaternionMultiply,
    rotatePointViaQuaternion,
    makeRotationMatrixFromQuaternion
} from './modules/quaternion';



export {
    // getDirection.ts
    getWheelDirection,
    // matrix.ts
    rotateMatrix,
    translateMatrix,
    scaleMatrix,
    multiplyMatrices,
    multiplyArrayOfMatrices,
    matrixArrayToCSSMatrix,
    // quaternion.ts
    makeQuaternion,
    zeroQuaternion,
    degToRad,
    computeQuaternionFromEulers,
    quaternionFromAxisAngle,
    inverseQuaternion,
    conjugateQuaternion,
    quaternionMultiply,
    rotatePointViaQuaternion,
    makeRotationMatrixFromQuaternion
};
