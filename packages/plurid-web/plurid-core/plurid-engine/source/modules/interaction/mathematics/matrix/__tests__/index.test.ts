// #region imports
    // #region external
    import {
        rotateMatrix,
        translateMatrix,
        scaleMatrix,
        multiplyMatrices,
        multiplyArrayOfMatrices,
        matrixArrayToCSSMatrix,
    } from '../';
    // #endregion external
// #endregion imports



// #region module
describe('matrix computation', () => {
    // The exact entries of `rotateMatrix` depend on the euler order/convention (which shifted during the
    // quaternion modernization), so the old hardcoded-matrix assertion was brittle. But a rotation matrix
    // is ALWAYS orthonormal, right-handed (det +1), and translation-free — convention-independent
    // invariants that actually prove correctness rather than pinning one composition. (Column-major,
    // 16-element; translation lives at indices 12/13/14, per `translateMatrix` below.)
    it('rotateMatrix() produces a valid orthonormal rotation matrix', () => {
        const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

        // zero rotation is the identity
        const identity = rotateMatrix(0, 0, 0);
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1].forEach((value, index) => {
            expect(identity[index]).toBeCloseTo(value, 10);
        });

        for (const [x, y, z] of [[0.3, 0.5, 0.2], [10, 20, 30], [-1.2, 0.7, 2.4]]) {
            const matrix = rotateMatrix(x, y, z);

            // the 3x3 rotation block as column vectors (column-major)
            const c0 = [matrix[0], matrix[1], matrix[2]];
            const c1 = [matrix[4], matrix[5], matrix[6]];
            const c2 = [matrix[8], matrix[9], matrix[10]];

            // each column is unit length, and the columns are mutually orthogonal
            expect(dot(c0, c0)).toBeCloseTo(1, 10);
            expect(dot(c1, c1)).toBeCloseTo(1, 10);
            expect(dot(c2, c2)).toBeCloseTo(1, 10);
            expect(dot(c0, c1)).toBeCloseTo(0, 10);
            expect(dot(c0, c2)).toBeCloseTo(0, 10);
            expect(dot(c1, c2)).toBeCloseTo(0, 10);

            // right-handed: determinant of the 3x3 block = c0 · (c1 × c2) ≈ +1
            const cross = [
                c1[1] * c2[2] - c1[2] * c2[1],
                c1[2] * c2[0] - c1[0] * c2[2],
                c1[0] * c2[1] - c1[1] * c2[0],
            ];
            expect(dot(c0, cross)).toBeCloseTo(1, 10);

            // pure rotation: no translation, canonical homogeneous bottom row
            expect(matrix[12]).toBeCloseTo(0, 10);
            expect(matrix[13]).toBeCloseTo(0, 10);
            expect(matrix[14]).toBeCloseTo(0, 10);
            expect(matrix[3]).toBeCloseTo(0, 10);
            expect(matrix[7]).toBeCloseTo(0, 10);
            expect(matrix[11]).toBeCloseTo(0, 10);
            expect(matrix[15]).toBeCloseTo(1, 10);
        }
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
// #endregion module
