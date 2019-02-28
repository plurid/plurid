import {
    multiplyArrayOfMatrices,
    matrixArrayToCSSMatrix,
    rotateMatrix,
    translateMatrix,
    scaleMatrix,
} from './matrix';



/**
 * Converts the CSS string matrix3d into an array of numbers.
 *
 * @param matrix3d      CSS string obtained from
 *                      window
 *                          .getComputedStyle(element)
 *                          .getPropertyValue("transform").
 * @returns             Numbers array.
 */
export function getMatrixValues(matrix3d: string): number[] {
    const matrixValues = matrix3d.split('(')[1].split(')')[0].split(',');
    const matrixValuesInt = [];
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
}

export function getTransformRotate(matrix3d: string): RotationValues {
    const pi = Math.PI;
    const values: number[] = getRotationMatrix(matrix3d);
    let rotateX: number = 0;
    let rotateY: number = 0;

    if (values.length === 6) {
        const cosa = values[0];
        const sina = values[1];

        if (cosa === 1 && sina === 0) {
            rotateX = Math.asin(sina);
            rotateY = Math.acos(cosa);
        }
    }

    if (values.length === 16) {
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
    }

    return {
        rotateX,
        rotateY,
    };
}


interface TranslationValues {
    translateX: number;
    translateY: number;
    translateZ: number;
}

export function getTransformTranslate(matrix3d: string): TranslationValues {
    const values: number[] = getTranslationMatrix(matrix3d);
    let translateX = values[0];
    let translateY = values[1];
    let translateZ = values[2];

    return {
        translateX,
        translateY,
        translateZ
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



export function rotatePlurid(
    matrix3d: string,
    direction: string = '',
    angleIncrement: number = 4.5
): string {
    let rotateX = getTransformRotate(matrix3d).rotateX;
    let rotateY = getTransformRotate(matrix3d).rotateY;
    const translateX = getTransformTranslate(matrix3d).translateX;
    const translateY = getTransformTranslate(matrix3d).translateY;
    const translateZ = getTransformTranslate(matrix3d).translateZ;
    const scale = getTransformScale(matrix3d).scale;

    let valRotationMatrix = rotateMatrix(rotateX, rotateY);
    const valTranslationMatrix = translateMatrix(translateX, translateY, translateZ);
    const valScalationMatrix = scaleMatrix(scale);

    // if (scale < 0.5) {
    //     angleIncrement = 4.5;
    // } else {
    //     angleIncrement = 4.5;
    // }

    if (direction === "left") {
        rotateY -= angleIncrement;
        valRotationMatrix = rotateMatrix(rotateX, rotateY);
    }

    if (direction === "right") {
        rotateY += angleIncrement;
        valRotationMatrix = rotateMatrix(rotateX, rotateY);
    }

    if (direction === "up") {
        rotateX += angleIncrement;
        valRotationMatrix = rotateMatrix(rotateX, rotateY);
    }

    if (direction === "down") {
        rotateX -= angleIncrement;
        valRotationMatrix = rotateMatrix(rotateX, rotateY);
    }

    const transformedMatrix3d = setTransform(
        valRotationMatrix,
        valTranslationMatrix,
        valScalationMatrix
    );
    return transformedMatrix3d;
}


export function translatePlurid(
    matrix3d: string,
    direction: string = '',
    linearIncrement: number = 50
): string {
    // if (direction == null) {
    //     direction = getDirection(event);
    // }
    // console.log("Direction", direction);

    const rotateX = getTransformRotate(matrix3d).rotateX;
    const rotateY = getTransformRotate(matrix3d).rotateY;
    let translateX = getTransformTranslate(matrix3d).translateX;
    let translateY = getTransformTranslate(matrix3d).translateY;
    let translateZ = getTransformTranslate(matrix3d).translateZ;
    const scale = getTransformScale(matrix3d).scale;

    const valRotationMatrix = rotateMatrix(rotateX, rotateY);
    let valTranslationMatrix = translateMatrix(translateX, translateY, translateZ);
    const valScalationMatrix = scaleMatrix(scale);

    if (scale < 0.5) {
        linearIncrement = 50;
    } else {
        linearIncrement = 30;
    }

    if (direction === "left") {
        translateX += linearIncrement;
        valTranslationMatrix = translateMatrix(translateX, translateY, translateZ);
    }

    if (direction === "right") {
        translateX -= linearIncrement;
        valTranslationMatrix = translateMatrix(translateX, translateY, translateZ);
    }

    if (direction === "up") {
        translateY += linearIncrement;
        valTranslationMatrix = translateMatrix(translateX, translateY, translateZ);
    }

    if (direction === "down") {
        translateY -= linearIncrement;
        valTranslationMatrix = translateMatrix(translateX, translateY, translateZ);
    }

    const transformedMatrix3d = setTransform(
        valRotationMatrix,
        valTranslationMatrix,
        valScalationMatrix
    );
    return transformedMatrix3d;
}


export function scalePlurid(
    matrix3d: string,
    direction: string = '',
): string {
    // if (direction == null) {
    //     direction = getDirection(event);
    // }

    let rotateX = getTransformRotate(matrix3d).rotateX;
    let rotateY = getTransformRotate(matrix3d).rotateY;
    const translateX = getTransformTranslate(matrix3d).translateX;
    const translateY = getTransformTranslate(matrix3d).translateY;
    const translateZ = getTransformTranslate(matrix3d).translateZ;
    let scale = getTransformScale(matrix3d).scale;

    const valRotationMatrix = rotateMatrix(rotateX, rotateY);
    const valTranslationMatrix = translateMatrix(translateX, translateY, translateZ);
    let valScalationMatrix = scaleMatrix(scale);

    const scaleIncrement = 0.05;

    if (direction === "up" || direction === "upright" || direction === "upleft") {
        scale += scaleIncrement;
        if (scale > 4) { scale = 4; }
        valScalationMatrix = scaleMatrix(scale);
    }

    if (direction === "down" || direction === "downleft" || direction === "downright") {
        scale -= scaleIncrement;
        if (scale < 0.1) { scale = 0.1; }
        valScalationMatrix = scaleMatrix(scale);
    }

    const transformedMatrix3d = setTransform(
        valRotationMatrix,
        valTranslationMatrix,
        valScalationMatrix
    );
    return transformedMatrix3d;
}
