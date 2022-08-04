// #region imports
    // #region external
    import {
        Quaternion,
    } from '../../quaternion';
    // #endregion external
// #endregion imports



// #region module
export type Matrix = number[][];



export const getInitialMatrix = () => {
    const matrix: Matrix = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ];

    return matrix;
}


export const multiplyMatrices = (
    m1: Matrix,
    m2: Matrix,
): Matrix => {
    const result: Matrix = [];

    for (let i = 0; i < m1.length; i++) {
        result[i] = [];

        for (let j = 0; j < m2[0].length; j++) {
            let sum = 0;

            for (let k = 0; k < m1[0].length; k++) {
                sum += m1[i][k] * m2[k][j];
            }

            result[i][j] = sum;
        }
    }

    return result;
}


export const multiplyMatricesArray = (
    matrices: Matrix[],
) => {
    const first = matrices[0];
    let result: Matrix = first;

    for (const [index, matrix] of matrices.entries()) {
        if (index === 0) {
            continue;
        }

        result = multiplyMatrices(
            result,
            matrix,
        );
    }

    return result;
}



export const arrayToMatrix = (
    array: number[],
): Matrix => {
    const matrix: Matrix = [];

    for (let i = 0; i < array.length; i += 4) {
        const row: number[] = [];

        row.push(array[i]);
        row.push(array[i + 1]);
        row.push(array[i + 2]);
        row.push(array[i + 3]);

        matrix.push(row);
    }

    return matrix;
}


export const matrixToArray = (
    matrix: Matrix,
) => {
    return matrix.flat();
}


/**
 * Parse a `matrix3d` string into a `Matrix`.
 *
 * @param value
 * @returns
 */
export const matrix3DToMatrix = (
    value: string,
): Matrix => {
    const values = value
        .replace('matrix3d(', '')
        .replace(')', '')
        .split(',')
        .map(val => parseFloat(val));

    return arrayToMatrix(values);
}


export const printMatrix = (
    matrix: Matrix,
    name: string,
) => {
    const normalize = (
        value: number,
    ) => {
        if (value === 1 || value === 0) {
            return value + '     ';
        }

        if (value > 0) {
            return value.toFixed(2) + '  ';
        }

        return value.toFixed(2) + ' ';
    }


    console.log('matrix', name + ':');

    for (const row of matrix) {
        console.log(
            normalize(row[0]), normalize(row[1]), normalize(row[2]), normalize(row[3]),
        );
    }

    console.log(`matrix3d(${
        matrix.flat().join(',')
    })`);

    console.log();
}



export const rotateXMatrix = (
    angle: number,
): Matrix => {
    const x = Math.cos(angle);
    const y = -1 * Math.sin(angle);
    const z = Math.sin(angle);

    const m: Matrix = [
        [1, 0, 0, 0],
        [0, x, y, 0],
        [0, z, x, 0],
        [0, 0, 0, 1],
    ];

    return m;
}


export const rotateYMatrix = (
    angle: number,
): Matrix => {
    const x = Math.cos(angle);
    const y = -1 * Math.sin(angle);
    const z = Math.sin(angle);

    const m: Matrix = [
        [x, 0, z, 0],
        [0, 1, 0, 0],
        [y, 0, x, 0],
        [0, 0, 0, 1],
    ];

    return m;
}


export const rotateZMatrix = (
    angle: number,
): Matrix => {
    const x = Math.cos(angle);
    const y = -1 * Math.sin(angle);
    const z = Math.sin(angle);

    const m = [
        [x, y, 0, 0],
        [z, x, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ];

    return m;
}


export const translateMatrix = (
    x = 0,
    y = 0,
    z = 0,
): Matrix => {
    const m = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [x, y, z, 1],
    ];

    return m;
}


export const scaleMatrix = (
    s: number,
): Matrix => {
    return [
        [s,    0,    0,   0],
        [0,    s,    0,   0],
        [0,    0,    s,   0],
        [0,    0,    0,   1],
    ];
}




export function rotationMatrixFromQuaternion(
    quaternion: Quaternion,
): Matrix {
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
        [1 - (num5 + num6),      num7 - num12,           num8 + num11,           0],
        [num7 + num12,           1 - (num4 + num6),      num9 - num10,           0],
        [num8 - num11,           num9 + num10,           1 - (num4 + num5),      0],
        [0,                      0,                      0,                      1],
    ];
}


export const matrixToCSSMatrix = (
    matrix: Matrix,
): string => {
    const value = matrix.flat().join(',');

    return `matrix3d(${value})`;
}
// #endregion module
