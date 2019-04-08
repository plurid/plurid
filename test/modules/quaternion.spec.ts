import {
    degToRad,
    makeQuaternion,
    zeroQuaternion,
    inverseQuaternion,
    conjugateQuaternion,
    computeQuaternionFromEulers,
    quaternionFromAxisAngle,
    quaternionMultiply,
    rotatePointViaQuaternion,
    makeRotationMatrixFromQuaternion
} from '../../src';



describe('degToRad', () => {
    it('converts 90 degrees to radians', () => {
        const rad = degToRad(90);
        expect(rad).toEqual(1.5707963268);
    });

    it('converts 180 degrees to radians', () => {
        const rad = degToRad(180);
        expect(rad).toEqual(3.1415926536);
    });
});

describe('quaternion generation', () => {
    it('creates a quaternion', () => {
        const quaternion = makeQuaternion(0.1, 0.2, 0.3, 0.4);
        expect(quaternion.x).toEqual(0.1);
        expect(quaternion.y).toEqual(0.2);
        expect(quaternion.z).toEqual(0.3);
        expect(quaternion.w).toEqual(0.4);
    });

    it('creates a 0-ed quaternion', () => {
        const quaternion = zeroQuaternion();
        expect(quaternion.x).toEqual(0);
        expect(quaternion.y).toEqual(0);
        expect(quaternion.z).toEqual(0);
        expect(quaternion.w).toEqual(0);
    });

    it('inverses a quaternion', () => {
        const quaternion = makeQuaternion(0.1, 0.2, 0.3, 0.4);
        const invertedQuaternion = makeQuaternion(0.1, 0.2, 0.3, -0.4);
        const inversedQuaternion = inverseQuaternion(quaternion);
        expect(inversedQuaternion).toEqual(invertedQuaternion);
    });

    it('conjugates a quaternion', () => {
        const quaternion = makeQuaternion(0.1, 0.2, 0.3, 0.4);
        const conjedQuaternion = makeQuaternion(-0.1, -0.2, -0.3, 0.4);
        const conjugatedQuaternion = conjugateQuaternion(quaternion);
        expect(conjugatedQuaternion).toEqual(conjedQuaternion);
    });
});

describe('quaternion computation', () => {
    it('computeQuaternionFromEulers() computes a quaternion from euler angle', () => {
        const quaternionFromEuler = computeQuaternionFromEulers(Math.PI, 0, 0);
        const quaternion = makeQuaternion(
            0,
            0,
            0.02741213359213333,
            0.9996242168594792,
        );
        expect(quaternionFromEuler).toEqual(quaternion);
    });

    it('computeQuaternionFromEulers() computes a quaternion from euler angles', () => {
        const quaternionFromEuler = computeQuaternionFromEulers(20, 20, 20);
        const quaternion = makeQuaternion(
            0.1387164571101101,
            0.19810763172437085,
            0.19810763172437085,
            0.9498760324547307
        );
        expect(quaternionFromEuler).toEqual(quaternion);
    });

    it('computes a quaternion from axis angle', () => {
        const qFromAxisAngle = quaternionFromAxisAngle(20, 20, 20, 20);
        const quaternion = makeQuaternion(
            -10.880422217787395,
            -10.880422217787395,
            -10.880422217787395,
            -0.8390715290764524
        );
        expect(qFromAxisAngle).toEqual(quaternion);
    });

    it('computes quaternion multiplication', () => {
        const quaternion1 = makeQuaternion(0.1, 0.2, 0.3, 0.4);
        const quaternion2 = makeQuaternion(0.2, 0.1, 0.3, 0.5);
        const quaternion3 = makeQuaternion(0.3, 0.2, 0.1, 0.6);
        const quaternionMultiplication = quaternionMultiply([
            quaternion1,
            quaternion2,
            quaternion3
        ]);
        const quaternionResult = makeQuaternion(
            0.086,
            0.172,
            0.132,
            -0.06400000000000002
        );
        expect(quaternionMultiplication).toEqual(quaternionResult);
    });

    it('computes rotation of a point via quaternion', () => {
        const pointRotate = [5, 10, 15];
        const quaternionCompute = makeQuaternion(0.1, 0.2, 0.3, 0.4);
        const quaternion = rotatePointViaQuaternion(
            pointRotate,
            quaternionCompute
        );
        const quaternionResult = makeQuaternion(
            1.5000000000000002,
            3,
            4.5,
            -2.220446049250313e-16
        );
        expect(quaternion).toEqual(quaternionResult);
    });

    it('computes a rotation matrix from quaternion', () => {
        const quaternionCompute = makeQuaternion(0.1, 0.2, 0.3, 0.4);
        const quaternion = makeRotationMatrixFromQuaternion(quaternionCompute);
        const rotationMatrixResult = [
            0.74,
            -0.19999999999999998,
            0.22000000000000003,
            0,
            0.28,
            0.8,
            0.03999999999999998,
            0,
            -0.10000000000000003,
            0.2,
            0.9,
            0,
            0,
            0,
            0,
            1
        ];
        expect(quaternion).toEqual(rotationMatrixResult);
    });
});
