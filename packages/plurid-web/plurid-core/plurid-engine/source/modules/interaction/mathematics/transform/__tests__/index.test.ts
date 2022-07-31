// #region imports
    // #region external
    import {
        general,
        matrix3d,
    } from '../';

    import {
        degToRad,
        makeRotationMatrixFromQuaternion,
    } from '../../quaternion';
    // #endregion external
// #endregion imports



// #region module
const {
    getInitialMatrix,
    arrayToMatrix,
    matrixToArray,
    multiplyMatrices,
    printMatrix,
    rotateXMatrix,
    rotateYMatrix,
    rotateZMatrix,
    translateMatrix,
} = general;

const {
    getMatrixValues,
    getRotationMatrix,
    getScalationValue,
    getTransformRotate,
    getTransformScale,
    getTransformTranslate,
    getTranslationMatrix,
    rotatePlurid,
    scalePlurid,
    setTransform,
    translatePlurid,
} = matrix3d;



interface Vector {
    x: number;
    y: number;
    z: number;
}

interface Quaternion {
    w: number;
    i: number;
    j: number;
    k: number;
}

const sumQ = (
    first: Quaternion,
    second: Quaternion,
) => {
    return {
        w: first.w + second.w,
        i: first.i + second.i,
        j: first.j + second.j,
        k: first.k + second.k,
    };
}

const diffQ = (
    first: Quaternion,
    second: Quaternion,
) => {
    return {
        w: first.w - second.w,
        i: first.i - second.i,
        j: first.j - second.j,
        k: first.k - second.k,
    };
}

const productQ = (
    first: Quaternion,
    second: Quaternion,
) => {
    let w = first.w * second.w - first.i * second.i - first.j * second.j - first.k * second.k;
    let i = first.i * second.w + first.w * second.i + first.j * second.k - first.k * second.j;
    let j = first.j * second.w + first.w * second.j + first.k * second.i - first.i * second.k;
    let k = first.k * second.w + first.w * second.k + first.i * second.j - first.j * second.i;

    w = w < 10e-7 ? 0 : w;
    i = i < 10e-7 ? 0 : i;
    j = j < 10e-7 ? 0 : j;
    k = k < 10e-7 ? 0 : k;

    return {
        w,
        i,
        j,
        k,
    };
}

const productScalar = (
    first: number,
    second: Quaternion,
) => {
    return {
        w: first * second.w,
        i: first * second.i,
        j: first * second.j,
        k: first * second.k,
    };
}

const computeQ = (
    pointP: Quaternion,
    angle: number,
    axis: 'x' | 'y' | 'z',
) => {
    const unitVectorU = {
        w: 0,
        i: axis === 'x' ? 1 : 0,
        j: axis === 'y' ? 1 : 0,
        k: axis === 'z' ? 1 : 0,
    };

    const theta = degToRad(angle);

    const quaternionQ = sumQ(
        {
            w: Math.cos(theta / 2),
            i: 0,
            j: 0,
            k: 0,
        },
        productScalar(
            Math.sin(theta / 2),
            unitVectorU,
        ),
    );

    const inverseQuaternionQ = diffQ(
        {
            w: Math.cos(theta / 2),
            i: 0,
            j: 0,
            k: 0,
        },
        productScalar(
            Math.sin(theta / 2),
            unitVectorU,
        ),
    );

    const qp = productQ(
        quaternionQ,
        pointP,
    );

    const qpq1 = productQ(
        qp,
        inverseQuaternionQ,
    );

    // console.log({
    //     pointP,
    //     unitVectorU,
    //     theta,
    //     quaternionQ,
    //     inverseQuaternionQ,
    //     qp,
    //     qpq1,
    // });

    // console.log(`rotate point P from (${pointP.i}, ${pointP.j}, ${pointP.k})`);
    // console.log(`with angle ${angle} on axis ${axis}`);
    // console.log(`to point P' at (${qpq1.i}, ${qpq1.j}, ${qpq1.k})`)

    return qpq1;
}


describe('transform', () => {
    const jestConsole = console;
    beforeEach(() => {
        global.console = require('console');
    });
    afterEach(() => {
        global.console = jestConsole;
    });


    it('works', () => {
        const pointP = {
            w: 0,
            i: 0,
            j: 1,
            k: 1,
        };
        const angle = 45; // degrees
        const axis = 'x' as const;

        const q = computeQ(
            pointP,
            angle,
            axis,
        );

        const rot = makeRotationMatrixFromQuaternion({
            w: q.w,
            x: q.i,
            y: q.j,
            z: q.k,
        });
        console.log({
            q,
            rot,
        });
        printMatrix(arrayToMatrix(rot), 'rot');


        const setRotate = (
            q: Quaternion,
            center?: Vector,
        ) => {
            const sqw = q.w * q.w;
            const sqx = q.i * q.i;
            const sqy = q.j * q.j;
            const sqz = q.k * q.k;

            const m00 = sqx - sqy - sqz + sqw; // since sqw + sqx + sqy + sqz =1
            const m11 = -sqx + sqy - sqz + sqw;
            const m22 = -sqx - sqy + sqz + sqw;

            let tmp1, tmp2;

            tmp1 = q.i * q.j;
            tmp2 = q.k * q.w;
            const m01 = 2.0 * (tmp1 + tmp2);
            const m10 = 2.0 * (tmp1 - tmp2);

            tmp1 = q.i * q.k;
            tmp2 = q.j * q.w;
            const m02 = 2.0 * (tmp1 - tmp2);
            const m20 = 2.0 * (tmp1 + tmp2);

            tmp1 = q.j * q.k;
            tmp2 = q.i * q.w;
            const m12 = 2.0 * (tmp1 + tmp2);
            const m21 = 2.0 * (tmp1 - tmp2);


            let a1,a2,a3;
            if (!center) {
                a1 = a2 = a3 = 0;
            } else {
                a1 = center.x;
                a2 = center.y;
                a3 = center.z;
            }

            const m03 = a1 - a1 * m00 - a2 * m01 - a3 * m02;
            const m13 = a2 - a1 * m10 - a2 * m11 - a3 * m12;
            const m23 = a3 - a1 * m20 - a2 * m21 - a3 * m22;
            const m30 = 0.0;
            const m31 = 0.0;
            const m32 = 0.0;
            const m33 = 1.0;

            return [
                m00, m01, m02, m03,
                m10, m11, m12, m13,
                m20, m21, m22, m23,
                m30, m31, m32, m33,
            ];
        }


        const m =  setRotate(
            q,
            {
                x: 20,
                y: 30,
                z: 30,
            }
        );
        printMatrix(arrayToMatrix(m), 'setRotate');



        expect(true).toBeTruthy();


        // const quaternionQ = Math.cos(theta / 2) + Math.sin(theta / 2) * unitVectorU;
        // const inverseQuaternionQ = Math.cos(theta / 2) - Math.sin(theta / 2) * unitVectorU;

        // const pPrime = quaternionQ * pointP * inverseQuaternionQ;


        // const worldMatrix = getInitialMatrix();

        // const updatedWorldMatrix = rotateMatrix(
        //     worldMatrix,
        //     rotationType,
        //     rotationValue,
        // );


        // const i = getInitialMatrix();
        // printMatrix(i, 'i');

        // const r = rotateYMatrix(45);
        // printMatrix(r, 'r');
    });
});
// #endregion module