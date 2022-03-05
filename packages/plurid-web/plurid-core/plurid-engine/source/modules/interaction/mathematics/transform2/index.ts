// #region module
export type Matrix = number[][];


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


export const arrayToMatrix = (
    array: number[],
): number[][] => {
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
) => {
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
// #endregion module
