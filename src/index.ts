import { getWheelDirection } from './modules/getDirection';
import {
    rotateMatrix,
    translateMatrix,
    scaleMatrix,
    multiplyMatrices,
    multiplyArrayOfMatrices,
    matrixArrayToCssMatrix
} from './modules/matrix';
import {
    computeQuaternionFromEulers,
    quaternionFromAxisAngle,
    inverseQuaternion,
    conjugateQuaternion,
    quaternionMultiply,
    rotatePointViaQuaternion,
    makeRotationMatrixFromQuaternion
} from './modules/quaternion';

export {
    getWheelDirection,
    rotateMatrix,
    translateMatrix,
    scaleMatrix,
    multiplyMatrices,
    multiplyArrayOfMatrices,
    matrixArrayToCssMatrix,
    computeQuaternionFromEulers,
    quaternionFromAxisAngle,
    inverseQuaternion,
    conjugateQuaternion,
    quaternionMultiply,
    rotatePointViaQuaternion,
    makeRotationMatrixFromQuaternion
};
