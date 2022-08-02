// #region imports
    // #region libraries
    import {
        FOCUS_ANCHOR_SUFFIX,
    } from '@plurid/plurid-data';

    import {
        interaction,
    } from '@plurid/plurid-engine';
    // #endregion libraries


    // #region external
    import {
        State as SpaceState,
    } from '~services/state/modules/space/types';
    // #endregion external
// #endregion imports



// #region module
const {
    quaternion,
    matrix,
} = interaction;

const {
    matrixArrayToCSSMatrix,
    rotateMatrix,
    multiplyArrayOfMatrices,
    scaleMatrix,
    translateMatrix,
} = matrix;

const {
    degToRad,
} = quaternion;


export const computeMatrix = (
    spaceState: SpaceState,
) => {
    const {
        translationX,
        translationY,
        translationZ,
        rotationX,
        rotationY,
        scale,
    } = spaceState;

    const innerWidth = typeof window === 'undefined'
        ? 720
        : window.innerWidth / 2;
    const innerHeight = typeof window === 'undefined'
        ? 400
        : window.innerHeight / 2;

    const transformOriginX = translationX * -1 + innerWidth;
    const transformOriginY = translationY * -1 + innerHeight;
    const transformOriginZ = translationZ * -1;


    const rotationMatrix = rotateMatrix(degToRad(-rotationX), degToRad(-rotationY));
    const translationMatrix = translateMatrix(translationX, translationY, translationZ);
    const scalationMatrix = scaleMatrix(scale);

    const transformMatrix = multiplyArrayOfMatrices([
        translationMatrix,
        multiplyArrayOfMatrices([
            translateMatrix(transformOriginX, transformOriginY, transformOriginZ),
            rotationMatrix,
            translateMatrix(-transformOriginX, -transformOriginY, -transformOriginZ),
        ]),
        scalationMatrix,
    ]);

    const transform = matrixArrayToCSSMatrix(transformMatrix);


    return transform;
}


export const focusPluridPlaneAnchor = (
    planeID: string,
) => {
    const selector = `[id='${planeID + FOCUS_ANCHOR_SUFFIX}']`;
    const focusAnchor: HTMLAnchorElement | null = document.querySelector(selector);

    if (focusAnchor) {
        focusAnchor.focus();
    }
}
// #endregion module
