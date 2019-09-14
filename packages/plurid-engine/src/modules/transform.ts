import {
    multiplyArrayOfMatrices,
    matrixArrayToCSSMatrix,
    rotateMatrix,
    translateMatrix,
    scaleMatrix,
} from './matrix';
// import { radToDeg } from './quaternion';



/**
 * Converts the CSS string matrix3d into an array of numbers.
 *
 * @param matrix3d      CSS string obtained from
 *                      window
 *                          .getComputedStyle(element)
 *                          .getPropertyValue('transform').
 * @returns             Numbers array.
 */
export function getMatrixValues(matrix3d: string): number[] {
    const matrixValues = matrix3d.split('(')[1].split(')')[0].split(',');
    const matrixValuesInt = [] as number[];
    for (let i = 0; i < matrixValues.length; i++) {
        matrixValuesInt[i] = parseFloat(matrixValues[i]);
    }
    return matrixValuesInt;
}


/**
 * Extracts the rotation matrix from the matrix3d CSS string.
 *
 * @param matrix3d      CSS string obtained from
 *                      window
 *                          .getComputedStyle(element)
 *                          .getPropertyValue("transform").
 * @returns             Rotation matrix.
 */
export function getRotationMatrix(matrix3d: string): number[] {
    const valuesMatrix = getMatrixValues(matrix3d);
    const scale = getScalationValue(matrix3d);

    if (valuesMatrix.length === 16) {
        for (let i = 0; i < 11; i++) {
            valuesMatrix[i] /= scale;
        }
    } else if (valuesMatrix.length === 6) {
        for (let i = 0; i < 4; i++) {
            valuesMatrix[i] /= scale;
        }
    }

    const rotationMatrix = valuesMatrix;

    return rotationMatrix;
}


/**
 * Extracts the translation matrix from the matrix3d CSS string.
 *
 * @param matrix3d      CSS string obtained from
 *                      window
 *                          .getComputedStyle(element)
 *                          .getPropertyValue("transform").
 * @returns             Translation matrix.
 */
export function getTranslationMatrix(matrix3d: string): number[] {
    const valuesMatrix = getMatrixValues(matrix3d);
    let translationMatrix: any;

    if (valuesMatrix.length === 16) {
        translationMatrix = getMatrixValues(matrix3d).slice(12, 15);
    } else if (valuesMatrix.length === 6) {
        translationMatrix = getMatrixValues(matrix3d).slice(4);
    }

    return translationMatrix;
}


/**
 * Extracts the scalation value from the matrix3d CSS string.
 *
 * @param matrix3d      CSS string obtained from
 *                      window
 *                          .getComputedStyle(element)
 *                          .getPropertyValue("transform").
 * @returns             Scalation value.
 */
export function getScalationValue(matrix3d: string): number {
    const valuesMatrix = getMatrixValues(matrix3d);
    let temp = 0;
    let scale: any;

    if (valuesMatrix.length === 16) {
        const scaleMatrix = getMatrixValues(matrix3d).slice(0, 4);
        scale = 0;

        // for (let i = 0; i < scaleMatrix.length; i++) {
        //     scale += parseFloat(scaleMatrix[i]) * parseFloat(scaleMatrix[i]);
        // }
        for (const el of scaleMatrix) {
            scale += parseFloat(el as any) * parseFloat(el as any);
        }

        scale = parseFloat(Math.sqrt(scale).toPrecision(4));
    } else if (valuesMatrix.length === 6) {
        temp = valuesMatrix[0] * valuesMatrix[0] + valuesMatrix[1] * valuesMatrix[1];
        scale = parseFloat(Math.sqrt(temp).toPrecision(4));
    }

    return scale;
}



/**
 * Returns a a matrix3d CSS string.
 *
 * @param       rotationMatrix
 * @param       translationMatrix
 * @param       scalationMatrix
 * @returns     matrix3d CSS string.
 */
export function setTransform(
    rotationMatrix: number[],
    translationMatrix: number[],
    scalationMatrix: number[],
): string {
    const transformMatrix = multiplyArrayOfMatrices([
        translationMatrix,
        rotationMatrix,
        scalationMatrix,
    ]);

    return matrixArrayToCSSMatrix(transformMatrix);
}



interface RotationValues {
    rotateX: number;
    rotateY: number;
    rotateZ: number;
}

export function getTransformRotate(matrix3d: string): RotationValues {
    const pi = Math.PI;
    const values: number[] = getRotationMatrix(matrix3d);
    // console.log('getRotationMatrix', values);
    // console.log(values);
    let rotateX: number = 0;
    let rotateY: number = 0;
    // let thetaX = 0;
    // let thetaY = 0;
    // let thetaZ = 0;

    // let theta1 = 0;
    // let theta2 = 0;
    // let phi1 = 0;
    // let phi2 = 0;
    // let phi = 0;
    // let theta = 0;
    // let psi = 0;



    if (values.length === 6) {
        const cosa = values[0];
        const sina = values[1];

        if (cosa === 1 && sina === 0) {
            rotateX = Math.asin(sina);
            rotateY = Math.acos(cosa);
        }
    }

    if (values.length === 16) {
        // RxRzRy
        // if (values[1] < 1) {
        //     if (values[1] > -1) {
        //         thetaZ = Math.asin(-1 * values[1]);
        //         thetaX = Math.atan2(values[9], values[5]);
        //         thetaY = Math.atan2(values[2], values[0]);
        //     } else {
        //         thetaZ = Math.PI / 2;
        //         thetaX = -1 * Math.atan2(-1 * values[8], values[10]);
        //         thetaY = 0;
        //     }
        // } else {
        //     thetaZ = -1 * Math.PI / 2;
        //     thetaX = -1 * Math.atan2(-1 * values[8], values[10]);
        //     thetaY = 0;
        // }

        thetaZ = Math.asin(-1 * values[1]);
        thetaX = Math.atan2(values[9], values[5]);
        thetaY = Math.atan2(values[2], values[0]);


        // console.log('thetaX', thetaX);
        // console.log('thetaY', thetaY);
        // console.log('thetaZ', thetaZ);

        // const cosaX1 = values[5];
        // const sinaX3 = values[9];
        // // 0-180
        // if (sinaX3 <= 0) {
        //     rotateX = Math.acos(cosaX1);
        // }
        // // // 181-360
        // if (sinaX3 > 0) {
        //     rotateX = 2 * pi - Math.acos(cosaX1);
        // }
        // const cosaY1 = values[0];
        // const sinaY2 = values[2];
        // if (sinaY2 <= 0) {
        //     rotateY = Math.acos(cosaY1);
        // }
        // if (sinaY2 > 0) {
        //     rotateY = 2 * pi - Math.acos(cosaY1);
        // }
        const cosaX1 = values[5];
        const sinaX3 = values[9];
        // 0-180
        if (sinaX3 <= 0) {
            rotateX = Math.acos(cosaX1);
        }
        // // 181-360
        if (sinaX3 > 0) {
            rotateX = 2 * pi - Math.acos(cosaX1);
        }
        const cosaY1 = values[0];
        const sinaY2 = values[2];
        if (sinaY2 <= 0) {
            rotateY = Math.acos(cosaY1);
        }
        if (sinaY2 > 0) {
            rotateY = 2 * pi - Math.acos(cosaY1);
        }

        rotateX = Math.atan2(values[9], values[5]);
        rotateY = Math.atan2(values[2], values[0]);
    }

    // return {
    //     rotateX: thetaX,
    //     rotateY: thetaY,
    //     rotateZ: thetaZ,
    // };

    return {
        rotateX,
        rotateY,
        rotateZ: 0,
    };
}


interface TranslationValues {
    translateX: number;
    translateY: number;
    translateZ: number;
}

export function getTransformTranslate(matrix3d: string): TranslationValues {
    const values: number[] = getTranslationMatrix(matrix3d);
    const translateX = values[0];
    const translateY = values[1];
    const translateZ = values[2];

    return {
        translateX,
        translateY,
        translateZ,
    };
}

interface ScalationValue {
    scale: number;
}

export function getTransformScale(matrix3d: string): ScalationValue {
    const scale = getScalationValue(matrix3d);
    return {
        scale,
    };
}


// let rotateX = 0;
// let rotateY = 0;


export function rotatePlurid(
    matrix3d: string,
    direction: string = '',
    angleIncrement: number = 0.07,
): string {
    const transformRotate = getTransformRotate(matrix3d);
    const rotateX = transformRotate.rotateX;
    let rotateY = transformRotate.rotateY;
    const rotateZ = transformRotate.rotateZ;
    // console.log('ROTATE', radToDeg(rotateX), radToDeg(rotateY));

    const transformTranslate = getTransformTranslate(matrix3d);
    const translateX = transformTranslate.translateX;
    const translateY = transformTranslate.translateY;
    const translateZ = transformTranslate.translateZ;

    const scale = getTransformScale(matrix3d).scale;

    let valRotationMatrix = rotateMatrix(rotateX, rotateY, rotateZ);
    const valTranslationMatrix = translateMatrix(translateX, translateY, translateZ);
    const valScalationMatrix = scaleMatrix(scale);

    // if (scale < 0.5) {
    //     angleIncrement = 0.08;
    // } else {
    //     angleIncrement = 0.03;
    // }

    if (direction === 'left') {
        rotateY -= angleIncrement;
        valRotationMatrix = rotateMatrix(rotateX, rotateY);
    }

    if (direction === 'right') {
        rotateY += angleIncrement;
        valRotationMatrix = rotateMatrix(rotateX, rotateY);
    }

    if (direction === 'up') {
        rotateY -= angleIncrement;
        // rotateX += angleIncrement;
        valRotationMatrix = rotateMatrix(rotateX, rotateY);
    }

    if (direction === 'down') {
        rotateY += angleIncrement;
        // rotateX -= angleIncrement;
        valRotationMatrix = rotateMatrix(rotateX, rotateY);
    }

    const transformedMatrix3d = setTransform(
        valRotationMatrix,
        valTranslationMatrix,
        valScalationMatrix,
    );
    return transformedMatrix3d;
}


export function translatePlurid(
    matrix3d: string,
    direction: string = '',
    linearIncrement: number = 50,
): string {
    const transformRotate = getTransformRotate(matrix3d);
    const rotateX = transformRotate.rotateX;
    const rotateY = transformRotate.rotateY;
    const rotateZ = transformRotate.rotateZ;

    const transformTranslate = getTransformTranslate(matrix3d);
    let translateX = transformTranslate.translateX;
    let translateY = transformTranslate.translateY;
    const translateZ = transformTranslate.translateZ;

    const scale = getTransformScale(matrix3d).scale;

    const valRotationMatrix = rotateMatrix(rotateX, rotateY, rotateZ);
    let valTranslationMatrix = translateMatrix(translateX, translateY, translateZ);
    const valScalationMatrix = scaleMatrix(scale);

    scale < 0.5 ? linearIncrement = 50 : linearIncrement = 30;

    if (direction === 'left') {
        translateX += linearIncrement;
        valTranslationMatrix = translateMatrix(translateX, translateY, translateZ);
    }

    if (direction === 'right') {
        translateX -= linearIncrement;
        valTranslationMatrix = translateMatrix(translateX, translateY, translateZ);
    }

    if (direction === 'up') {
        translateY += linearIncrement;
        valTranslationMatrix = translateMatrix(translateX, translateY, translateZ);
    }

    if (direction === 'down') {
        translateY -= linearIncrement;
        valTranslationMatrix = translateMatrix(translateX, translateY, translateZ);
    }

    const transformedMatrix3d = setTransform(
        valRotationMatrix,
        valTranslationMatrix,
        valScalationMatrix,
    );
    return transformedMatrix3d;
}


export function scalePlurid(
    matrix3d: string,
    direction: string = '',
    scaleIncrement: number = 0.05,
): string {
    const transformRotate = getTransformRotate(matrix3d);
    const rotateX = transformRotate.rotateX;
    const rotateY = transformRotate.rotateY;
    const rotateZ = transformRotate.rotateZ;

    const transformTranslate = getTransformTranslate(matrix3d);
    const translateX = transformTranslate.translateX;
    const translateY = transformTranslate.translateY;
    const translateZ = transformTranslate.translateZ;

    let scale = getTransformScale(matrix3d).scale;

    const valRotationMatrix = rotateMatrix(rotateX, rotateY, rotateZ);
    const valTranslationMatrix = translateMatrix(translateX, translateY, translateZ);
    let valScalationMatrix = scaleMatrix(scale);

    if (direction === 'up') {
        scale -= scaleIncrement;
        if (scale < 0.1) { scale = 0.1; }
        valScalationMatrix = scaleMatrix(scale);
    }

    if (direction === 'down') {
        scale += scaleIncrement;
        if (scale > 4) { scale = 4; }
        valScalationMatrix = scaleMatrix(scale);
    }

    const transformedMatrix3d = setTransform(
        valRotationMatrix,
        valTranslationMatrix,
        valScalationMatrix,
    );
    return transformedMatrix3d;
}
