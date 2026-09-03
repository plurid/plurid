// #region imports
    // #region external
    import {
        rotationXMatrix,
        rotationYMatrix,
        cameraRotation,
        cameraMatrix,
        cameraMatrix3d,
        invertMatrix,
        transformPoint,
        transformDirection,
        createCamera,
        identityCamera,
        IDENTITY_MATRIX3D,
    } from '../';

    import {
        multiplyMatrices,
        translateMatrix,
        scaleMatrix,
    } from '../../mathematics/matrix';
    // #endregion external
// #endregion imports



// #region module
const expectMatrix = (
    actual: number[],
    expected: number[],
    precision = 10,
) => {
    expect(actual).toHaveLength(16);
    expected.forEach((value, index) => {
        expect(actual[index]).toBeCloseTo(value, precision);
    });
};

const IDENTITY = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
];


describe('camera matrix primitives', () => {
    it('rotationXMatrix(90) is the CSS rotateX(90deg) matrix', () => {
        expectMatrix(rotationXMatrix(90), [
            1, 0, 0, 0,
            0, 0, 1, 0,
            0, -1, 0, 0,
            0, 0, 0, 1,
        ]);
    });

    it('rotationYMatrix(90) is the CSS rotateY(90deg) matrix', () => {
        expectMatrix(rotationYMatrix(90), [
            0, 0, -1, 0,
            0, 1, 0, 0,
            1, 0, 0, 0,
            0, 0, 0, 1,
        ]);
    });

    it('zero rotations are the identity', () => {
        expectMatrix(rotationXMatrix(0), IDENTITY);
        expectMatrix(rotationYMatrix(0), IDENTITY);
        expectMatrix(cameraRotation(0, 0), IDENTITY);
    });

    it('turntable rotation keeps world-up in the screen vertical plane', () => {
        for (const [pitch, yaw] of [[30, 45], [-60, 170], [85, -120], [12.5, 91]]) {
            const up = transformDirection(cameraRotation(pitch, yaw), { x: 0, y: 1, z: 0 });
            expect(up.x).toBeCloseTo(0, 10);
        }
    });

    it('translation and scale compose additively / multiplicatively', () => {
        expectMatrix(
            multiplyMatrices(translateMatrix(1, 2, 3), translateMatrix(4, 5, 6)),
            translateMatrix(5, 7, 9),
        );
        expectMatrix(
            multiplyMatrices(scaleMatrix(2), scaleMatrix(3)),
            scaleMatrix(6),
        );
    });

    it('invertMatrix() inverts random camera matrices', () => {
        const view = { width: 1200, height: 700 };
        const cameras = [
            createCamera(2000),
            createCamera(1500, { yaw: 37, pitch: -25, scale: 0.7, pivot: { x: 300, y: 200, z: -50 }, offset: { x: 40, y: -30, z: 120 } }),
            createCamera(2000, { yaw: -170, pitch: 80, scale: 3.2, pivot: { x: -100, y: 900, z: 400 }, offset: { x: -500, y: 10, z: -900 } }),
        ];

        for (const camera of cameras) {
            const matrix = cameraMatrix(camera, view);
            const product = multiplyMatrices(matrix, invertMatrix(matrix));
            expectMatrix(product, IDENTITY, 8);
        }
    });

    it('transformPoint() applies translation, transformDirection() does not', () => {
        const matrix = translateMatrix(10, 20, 30);
        expect(transformPoint(matrix, { x: 1, y: 2, z: 3 })).toEqual({ x: 11, y: 22, z: 33 });
        expect(transformDirection(matrix, { x: 1, y: 2, z: 3 })).toEqual({ x: 1, y: 2, z: 3 });
    });

    it('the default camera renders the identity and the string is cached', () => {
        const view = { width: 800, height: 600 };
        const camera = identityCamera(view);
        const first = cameraMatrix3d(camera, view);
        expect(first).toBe(IDENTITY_MATRIX3D);
        expect(cameraMatrix3d({ ...camera }, { ...view })).toBe(first);
    });
});
// #endregion module
