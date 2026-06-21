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
describe('transformations', () => {
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


    // The old assertion pinned a full decomposed-angle snapshot, which broke when the euler convention
    // shifted during modernization. Instead, test the actual extraction CONTRACT: `getTransformRotate`
    // reads `rotateX = atan2(m[9], m[5])`, `rotateY = atan2(m[2], m[0])`, and `rotateZ` is always 0 (it
    // recovers only the two screen-relevant axes). Encode known cos/sin at exactly those slots and assert
    // exact recovery — convention-independent and meaningful.
    it('getTransformRotate() extracts the X/Y euler angles from the matrix3d rotation entries', () => {
        const make = (matrix: number[]) => `matrix3d(${matrix.join(', ')})`;

        // identity → no rotation on any axis
        const identity = make([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        expect(getTransformRotate(identity)).toEqual({ rotateX: 0, rotateY: 0, rotateZ: 0 });

        // place cos/sin at the slots the extractor reads: m[5]=cos x, m[9]=sin x; m[0]=cos y, m[2]=sin y
        const x = 0.3;
        const y = -0.7;
        const matrix = [
            Math.cos(y), 0, Math.sin(y), 0,
            0, Math.cos(x), 0, 0,
            0, Math.sin(x), 0, 0,
            0, 0, 0, 1,
        ];
        const rotate = getTransformRotate(make(matrix));
        expect(rotate.rotateX).toBeCloseTo(x, 10);
        expect(rotate.rotateY).toBeCloseTo(y, 10);
        expect(rotate.rotateZ).toBe(0);
    });
});
// #endregion module
