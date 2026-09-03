// #region imports
    // #region external
    import {
        quaternionFromAxisAngle,
        quaternionToColumnMajorMatrix,
        slerp,
        normalizeQuaternion,
        degToRad,
    } from '../';

    import {
        rotationXMatrix,
        rotationYMatrix,
    } from '../../../camera/matrix';
    // #endregion external
// #endregion imports



// #region module
const expectMatrix = (actual: number[], expected: number[]) => {
    expected.forEach((value, index) => {
        expect(actual[index]).toBeCloseTo(value, 10);
    });
};


describe('quaternion conventions', () => {
    it('quaternionToColumnMajorMatrix() matches the CSS rotateX / rotateY matrices', () => {
        for (const degrees of [0, 30, 90, -120, 180]) {
            const aboutX = quaternionFromAxisAngle(1, 0, 0, degToRad(degrees));
            expectMatrix(quaternionToColumnMajorMatrix(aboutX), rotationXMatrix(degrees));
            const aboutY = quaternionFromAxisAngle(0, 1, 0, degToRad(degrees));
            expectMatrix(quaternionToColumnMajorMatrix(aboutY), rotationYMatrix(degrees));
        }
    });

    it('slerp() interpolates along the shortest arc and hits both endpoints', () => {
        const from = quaternionFromAxisAngle(0, 1, 0, degToRad(170));
        const to = quaternionFromAxisAngle(0, 1, 0, degToRad(-170));
        expect(slerp(from, to, 0)).toEqual(from);
        expect(slerp(from, to, 1)).toEqual(to);
        // halfway is 180° about Y (20° the short way from 170°), never 0°
        const half = slerp(from, to, 0.5);
        expectMatrix(quaternionToColumnMajorMatrix(half), rotationYMatrix(180));
    });

    it('normalizeQuaternion() yields a unit quaternion', () => {
        const q = normalizeQuaternion({ x: 3, y: 0, z: 4, w: 0 });
        expect(Math.hypot(q.x, q.y, q.z, q.w)).toBeCloseTo(1, 12);
        expect(normalizeQuaternion({ x: 0, y: 0, z: 0, w: 0 })).toEqual({ x: 0, y: 0, z: 0, w: 1 });
    });
});
// #endregion module
