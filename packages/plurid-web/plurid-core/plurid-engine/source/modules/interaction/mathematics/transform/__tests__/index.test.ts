// #region imports
    // #region external
    import {
        getMatrixValues,
        getRotationMatrix,
        getTranslationMatrix,
        getScalationValue,
        getTransformRotate,
    } from '../';
    // #endregion external
// #endregion imports



// #region module
xdescribe('transformations', () => {
    it('getMatrixValues() - gets matrix array numbers from the matrix3d CSS string', () => {
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


    it('getRotationMatrix() - gets the rotation matrix from the matrix3d CSS string', () => {
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


    it('getTranslationMatrix() - gets the translation matrix from the matrix3d CSS string', () => {
        const matrix3d = 'matrix3d(0.866025, 0.17101, -0.469846, 0, 0, 0.939693, 0.34202, 0, 0.5, -0.296198, 0.813798, 0, 200, 300, 0, 1)';
        const matrixValues = getTranslationMatrix(matrix3d);
        const result = [
            200, 300, 0
        ];
        expect(matrixValues).toEqual(result);

        getMatrixValues(matrix3d);
    });


    it('getScalationValue() - gets the scalation matrix from the matrix3d CSS string', () => {
        const matrix3d = 'matrix3d(0.866025, 0.17101, -0.469846, 0, 0, 0.939693, 0.34202, 0, 0.5, -0.296198, 0.813798, 0, 200, 300, 0, 1)';
        const matrixValues = getScalationValue(matrix3d);
        const result = 1;
        expect(matrixValues).toEqual(result);
    });


    it('getTransformRotate()', () => {
        const matrix3d = 'matrix3d(0.866025, 0.17101, -0.469846, 0, 0, 0.939693, 0.34202, 0, 0.5, -0.296198, 0.813798, 0, 200, 300, 0, 1)';
        const rotate = getTransformRotate(matrix3d);
        const result = {
            rotateX: 0.3490647416493475,
            rotateY: 0.5235995831666113,
            rotateZ: 0
        };
        expect(rotate).toEqual(result);
    });
});
// #endregion module
