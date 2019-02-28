import {
    getMatrixValues,
    getRotationMatrix,
    getTranslationMatrix,
    getScalationValue,
} from '../../src';



describe('transformations', () => {
    it('gets matrix array numbers from the matrix3d CSS string', () => {
        const matrix3d = 'matrix3d(0.866025, 0.17101, -0.469846, 0, 0, 0.939693, 0.34202, 0, 0.5, -0.296198, 0.813798, 0, 200, 300, 0, 1)';
        const matrixValues = getMatrixValues(matrix3d);
        const result = [
            0.866025,
            0.17101,
            -0.469846,
            0,
            0,
            0.939693,
            0.34202,
                0,
            0.5,
            -0.296198,
            0.813798,
            0,
            200,
            300,
            0,
            1,
        ];
        expect(matrixValues).toEqual(result);

        getMatrixValues(matrix3d);
    });


    it('gets the rotation matrix from the matrix3d CSS string', () => {
        const matrix3d = 'matrix3d(0.866025, 0.17101, -0.469846, 0, 0, 0.939693, 0.34202, 0, 0.5, -0.296198, 0.813798, 0, 200, 300, 0, 1)';
        const matrixValues = getRotationMatrix(matrix3d);
        const result = [
            0.866025,
            0.17101,
            -0.469846,
            0,
            0,
            0.939693,
            0.34202,
                0,
            0.5,
            -0.296198,
            0.813798,
            0,
            200,
            300,
            0,
            1,
        ];
        expect(matrixValues).toEqual(result);

        getMatrixValues(matrix3d);
    });


    it('gets the translation matrix from the matrix3d CSS string', () => {
        const matrix3d = 'matrix3d(0.866025, 0.17101, -0.469846, 0, 0, 0.939693, 0.34202, 0, 0.5, -0.296198, 0.813798, 0, 200, 300, 0, 1)';
        const matrixValues = getTranslationMatrix(matrix3d);
        const result = [
            200, 300, 0
        ];
        expect(matrixValues).toEqual(result);

        getMatrixValues(matrix3d);
    });


    it('gets the scalation matrix from the matrix3d CSS string', () => {
        const matrix3d = 'matrix3d(0.866025, 0.17101, -0.469846, 0, 0, 0.939693, 0.34202, 0, 0.5, -0.296198, 0.813798, 0, 200, 300, 0, 1)';
        const matrixValues = getScalationValue(matrix3d);
        const result = 1;
        expect(matrixValues).toEqual(result);

        getMatrixValues(matrix3d);
    });
});
