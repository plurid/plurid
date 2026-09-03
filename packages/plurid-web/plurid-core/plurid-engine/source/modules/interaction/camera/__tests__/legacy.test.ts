// #region imports
    // #region external
    import {
        cameraMatrix,
        createCamera,
        fromLegacy,
        toLegacy,
        setPivot,
    } from '../';

    import {
        rotateMatrix,
        translateMatrix,
        scaleMatrix,
        multiplyArrayOfMatrices,
    } from '../../mathematics/matrix';

    import {
        degToRad,
    } from '../../mathematics/quaternion';
    // #endregion external
// #endregion imports



// #region module
/**
 * The ORACLE: the pre-camera-core `computeMatrix` from plurid-react, copied verbatim so this test
 * survives the deletion of the original. The new camera model must reproduce it exactly for the
 * legacy parameterization (pivot at the view center, no offset).
 */
const legacyComputeMatrix = (
    spaceState: {
        translationX: number;
        translationY: number;
        translationZ: number;
        rotationX: number;
        rotationY: number;
        scale: number;
    },
    view: { width: number; height: number },
): number[] => {
    const {
        translationX,
        translationY,
        translationZ,
        rotationX,
        rotationY,
        scale,
    } = spaceState;

    const innerWidth = view.width / 2;
    const innerHeight = view.height / 2;

    const transformOriginX = translationX * -1 + innerWidth;
    const transformOriginY = translationY * -1 + innerHeight;
    const transformOriginZ = translationZ * -1;

    const rotationMatrix = rotateMatrix(degToRad(-rotationX), degToRad(-rotationY));
    const translationMatrix = translateMatrix(translationX, translationY, translationZ);
    const scalationMatrix = scaleMatrix(scale);

    return multiplyArrayOfMatrices([
        translationMatrix,
        translateMatrix(transformOriginX, transformOriginY, transformOriginZ),
        rotationMatrix,
        translateMatrix(-transformOriginX, -transformOriginY, -transformOriginZ),
        scalationMatrix,
    ]);
};


const SAMPLES = [
    { rotationX: 0, rotationY: 0, translationX: 0, translationY: 0, translationZ: 0, scale: 1 },
    { rotationX: 0, rotationY: 0, translationX: 120, translationY: -40, translationZ: 0, scale: 1 },
    { rotationX: 0, rotationY: 0, translationX: 120, translationY: -40, translationZ: 0, scale: 0.5 },
    { rotationX: 30, rotationY: 0, translationX: 0, translationY: 0, translationZ: 0, scale: 1 },
    { rotationX: 0, rotationY: 45, translationX: 0, translationY: 0, translationZ: 0, scale: 1 },
    { rotationX: 30, rotationY: 45, translationX: 0, translationY: 0, translationZ: 0, scale: 1 },
    { rotationX: -25, rotationY: 137, translationX: 300, translationY: 210, translationZ: -80, scale: 1.7 },
    { rotationX: 60, rotationY: -100, translationX: -450, translationY: 90, translationZ: 300, scale: 0.3 },
    { rotationX: 85, rotationY: 179, translationX: 10, translationY: 10, translationZ: 10, scale: 2.5 },
    { rotationX: -85, rotationY: -179, translationX: -900, translationY: 800, translationZ: -600, scale: 3.9 },
];

const VIEWS = [
    { width: 1440, height: 800 },
    { width: 900, height: 600 },
    { width: 320, height: 1200 },
];


describe('legacy camera parameterization', () => {
    it('fromLegacy() reproduces the historical computeMatrix() exactly', () => {
        for (const view of VIEWS) {
            for (const sample of SAMPLES) {
                const expected = legacyComputeMatrix(sample, view);
                const actual = cameraMatrix(fromLegacy(sample, view), view);
                expected.forEach((value, index) => {
                    expect(actual[index]).toBeCloseTo(value, 6);
                });
            }
        }
    });

    it('toLegacy() round-trips through fromLegacy()', () => {
        const view = { width: 1000, height: 700 };
        for (const sample of SAMPLES) {
            const camera = fromLegacy(sample, view);
            const back = toLegacy(camera, view);
            expect(back.rotationX).toBeCloseTo(sample.rotationX, 9);
            expect(back.rotationY).toBeCloseTo(sample.rotationY, 9);
            expect(back.translationX).toBeCloseTo(sample.translationX, 7);
            expect(back.translationY).toBeCloseTo(sample.translationY, 7);
            expect(back.translationZ).toBeCloseTo(sample.translationZ, 7);
            expect(back.scale).toBeCloseTo(sample.scale, 9);
        }
    });

    it('toLegacy() preserves the matrix for cameras with a pan offset and an off-center pivot', () => {
        const view = { width: 1000, height: 700 };
        const camera = createCamera(2000, {
            yaw: 33,
            pitch: -20,
            scale: 1.4,
            pivot: { x: 250, y: 100, z: -30 },
            offset: { x: 80, y: -60, z: 150 },
        });

        const direct = cameraMatrix(camera, view);
        const viaLegacy = cameraMatrix(fromLegacy(toLegacy(camera, view), view), view);
        direct.forEach((value, index) => {
            expect(viaLegacy[index]).toBeCloseTo(value, 7);
        });
    });

    it('fromLegacy() wraps the yaw and clamps the pitch', () => {
        const view = { width: 1000, height: 700 };
        const camera = fromLegacy(
            { rotationX: 120, rotationY: 730, translationX: 0, translationY: 0, translationZ: 0, scale: 1 },
            view,
        );
        expect(camera.yaw).toBeCloseTo(10, 9);
        expect(camera.pitch).toBe(89);
    });

    it('re-pivoting does not change the legacy scalars', () => {
        const view = { width: 1000, height: 700 };
        const camera = fromLegacy(SAMPLES[6], view);
        const repivoted = setPivot(camera, { x: -400, y: 500, z: 60 });
        const a = toLegacy(camera, view);
        const b = toLegacy(repivoted, view);
        (Object.keys(a) as (keyof typeof a)[]).forEach((key) => {
            expect(b[key]).toBeCloseTo(a[key], 7);
        });
    });
});
// #endregion module
