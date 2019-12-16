import {
    getWheelDirection,
} from './modules/direction';

import {
    rotateMatrix,
    translateMatrix,
    scaleMatrix,
    multiplyMatrices,
    multiplyArrayOfMatrices,
    matrixArrayToCSSMatrix,
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
    makeRotationMatrixFromQuaternion,
} from './modules/quaternion';

import {
    getMatrixValues,
    getRotationMatrix,
    getTranslationMatrix,
    getScalationValue,
    getTransformRotate,
    getTransformTranslate,
    getTransformScale,
    rotatePlurid,
    translatePlurid,
    scalePlurid,
} from './modules/transform';

import {
    computeRootLocationX,
    computeSpaceTree,
    computeSpaceLocation,
    computeCameraLocationX,
    getTreePageByPlaneID,
    updateTreePage,
    computePath,
    computePluridPlaneLocation,
    updateTreeWithNewPage,
    removePageFromTree,
    togglePageFromTree,
    computeSpaceSize,
} from './modules/space';



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
    makeRotationMatrixFromQuaternion,


    // transformations.ts
    getMatrixValues,
    getRotationMatrix,
    getTranslationMatrix,
    getScalationValue,
    getTransformRotate,
    getTransformTranslate,
    getTransformScale,
    rotatePlurid,
    translatePlurid,
    scalePlurid,


    // space.ts
    computeRootLocationX,
    computeSpaceTree,
    computeSpaceLocation,
    computeCameraLocationX,
    getTreePageByPlaneID,
    updateTreePage,
    computePath,
    computePluridPlaneLocation,
    updateTreeWithNewPage,
    removePageFromTree,
    togglePageFromTree,
    computeSpaceSize,
};
