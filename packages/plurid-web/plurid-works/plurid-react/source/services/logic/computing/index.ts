// #region imports
    // #region libraries
    import {
        PluridPlane,
        TreePlane,
        PluridApplicationView,
        PluridPartialConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';

    import {
        routing,
        interaction,
        space,
        generalEngine,

        resolvePluridPlaneData,
        PluridPlanesRegistrar,
    } from '~services/engine';
    // #endregion external
// #endregion imports



// #region module
const {
    quaternion,
    transform,
    matrix,
} = interaction;


const {
    degToRad,
    radToDeg,
} = quaternion;

const {
    multiplyMatricesArray,
    translateMatrix,
    rotateYMatrix,
    matrixToCSSMatrix,
    arrayToMatrix,
    inverseMatrix,
} = transform.general;

const {
    getTransformRotate,
    getTransformTranslate,
    getTransformScale,
} = transform.matrix3d;

const {
    rotateMatrix,
    translateMatrix: translateMatrixArray,
    scaleMatrix,
    multiplyArrayOfMatrices,
} = matrix;


export const computeApplication = (
    planes: PluridPlane<PluridReactComponent>[] | undefined,
    configuration: PluridPartialConfiguration | undefined,
    view: PluridApplicationView | undefined,
    origin = 'origin',
) => {
    const appConfiguration = generalEngine.configuration.merge(configuration);

    const currentView = view || [];
    const absoluteView = [];

    for (const viewItem of currentView) {
        if (typeof viewItem === 'string') {
            const viewPath = routing.resolveRoute(viewItem);
            if (!viewPath) {
                continue;
            }
            absoluteView.push(viewPath.route);
        }
    }

    const registrar = new PluridPlanesRegistrar(
        planes,
        origin,
    );
    const registrarPlanes = registrar.getAll();

    const spaceTree = new space.tree.Tree(
        {
            planes: registrarPlanes,
            configuration: appConfiguration,
            view: absoluteView,
        },
        origin,
    );
    const computedTree = spaceTree.compute();


    const data = {
        computedTree,
        // planesPropertiesReference,
        appConfiguration,
    };

    return data;
}


export const computePlaneLocation = (
    plane: TreePlane,
) => {
    const {
        location,
    } = plane;

    const {
        translateX,
        translateY,
        translateZ,
        rotateY,
    } = location;


    const getTransform = () => {
        const innerWidth = typeof window === 'undefined'
            ? 720
            : window.innerWidth / 2;
        const innerHeight = typeof window === 'undefined'
            ? 400
            : window.innerHeight / 2;

        const transformOriginX = translateX * -1 + innerWidth;
        const transformOriginY = translateY * -1 + innerHeight;
        const transformOriginZ = translateZ * -1;

        const rotationMatrix = rotateMatrix(0, degToRad(rotateY));
        const translationMatrix = translateMatrixArray(translateX, translateY, translateZ);
        const scalationMatrix = scaleMatrix(1);

        const transformMatrix = multiplyArrayOfMatrices([
            translationMatrix,

            translateMatrixArray(transformOriginX, transformOriginY, transformOriginZ),
            rotationMatrix,
            translateMatrixArray(-transformOriginX, -transformOriginY, -transformOriginZ),

            scalationMatrix,
        ]);
        const inverseTransformMatrix = inverseMatrix(
            arrayToMatrix(transformMatrix),
        );

        const matrix3dTransformMatrix = matrixToCSSMatrix(inverseTransformMatrix);

        const rotate = getTransformRotate(matrix3dTransformMatrix);
        const translate = getTransformTranslate(matrix3dTransformMatrix);
        const scale = getTransformScale(matrix3dTransformMatrix);

        const transform = {
            translationX: translate.translateX,
            translationY: translate.translateY,
            translationZ: translate.translateZ,
            rotationX: radToDeg(rotate.rotateX),
            rotationY: radToDeg(rotate.rotateY),
            scale: scale.scale,
        };

        return transform;
    }
    const transform = getTransform();


    const getMatrix3d = () => {
        const zSign1 = rotateY < 100 ? 1 : -1;
        const zSign2 = rotateY < 100 ? -1 : 1;
        const xOffset = rotateY < 100
            ? plane.parentPlaneID ? 200 : 0
            : 0;

        const newMatrix = multiplyMatricesArray([
            translateMatrix(-translateX, -translateY, zSign1 * translateZ),
            rotateYMatrix(degToRad(rotateY)),
            translateMatrix(translateX, translateY, zSign2 * translateZ),

            translateMatrix(-(translateX + xOffset), -translateY, zSign1 * translateZ),
        ]);

        const matrix3d = matrixToCSSMatrix(newMatrix);

        return matrix3d;
    }
    const matrix3d = getMatrix3d();


    return {
        transform,
        matrix3d,
    };
}
// #endregion module
