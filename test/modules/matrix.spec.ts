import {
    rotateMatrix,
    translateMatrix,
    scaleMatrix,
    multiplyMatrices,
    multiplyArrayOfMatrices,
    matrixArrayToCSSMatrix,
} from '../../src';



describe('matrix computation', () => {
    it('rotateMatrix() computes rotation matrix from euler angles', () => {
        const rotationMatrix = rotateMatrix(10, 20, 30);
        const result = [
            0.8434932686554564,
            -0.4184120444176479,
            0.336824088834481,
            0,
            0.4924038765075056,
            0.8528685319515203,
            -0.17364817766748872,
            0,
            -0.21461017714291933,
            0.3123245560200204,
            0.9254165783978489,
            0,
            0,
            0,
            0,
            1,
        ];
        expect(rotationMatrix).toEqual(result);
    });

    it('translateMatrix() computes translation matrix from euler distances', () => {
        const translationMatrix = translateMatrix(10, 20, 30);
        const result = [
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            10,
            20,
            30,
            1,
        ];
        expect(translationMatrix).toEqual(result);
    });

    it('scaleMatrix() computes scaling matrix from scale', () => {
        const scalingMatrix = scaleMatrix(1.2);
        const result = [
            1.2,
            0,
            0,
            0,
            0,
            1.2,
            0,
            0,
            0,
            0,
            1.2,
            0,
            0,
            0,
            0,
            1,
        ];
        expect(scalingMatrix).toEqual(result);
    });

    it('multiplyMatrices()', () => {
        const matrix1 = [
            0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7
        ];
        const matrix2 = [
            0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7
        ];
        const matrixMultiplication = multiplyMatrices(matrix1, matrix2);
        const result = [
            0.54,
            0.37,
            0.47,
            0.5700000000000001,
            1.3,
            0.9299999999999999,
            1.19,
            1.4499999999999997,
            0.44000000000000006,
            0.41000000000000003,
            0.56,
            0.71,
            1.11,
            0.79,
            1.01,
            1.23,
        ];
        expect(matrixMultiplication).toEqual(result);
    });

    it('multiplyArrayOfMatrices()', () => {
        const matrix1 = [
            0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7
        ];
        const matrix2 = [
            0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7
        ];
        const matrix3 = [
            0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7
        ];
        const matrixMultiplication = multiplyArrayOfMatrices([matrix1, matrix2, matrix3]);
        const result = [
            0.8900000000000001,
            0.662,
            0.857,
            1.052,
            2.2460000000000004,
            1.662,
            2.149,
            2.6359999999999997,
            1.0370000000000001,
            0.745,
            0.9570000000000001,
            1.169,
            1.907,
            1.412,
            1.826,
            2.2399999999999998,
        ];
        expect(matrixMultiplication).toEqual(result);
    });

    it('matrixArrayToCssMatrix()', () => {
        const matrix = [
            0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7
        ];
        const matrixToCSSMatrix = matrixArrayToCSSMatrix(matrix);
        const result = 'matrix3d(0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,0.1,0.2,0.3,0.4,0.5,0.6,0.7)';
        expect(matrixToCSSMatrix).toEqual(result);
    })
});
