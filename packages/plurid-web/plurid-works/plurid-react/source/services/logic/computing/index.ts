// #region imports
    // #region libraries
    import {
        PluridPlane,
        IndexedPluridPlane,
        TreePlane,
        PluridApplicationView,
        PluridPartialConfiguration,
    } from '@plurid/plurid-data';

    import {
        routing,
        planes,
        interaction,
        space,
        general as generalEngine,
    } from '@plurid/plurid-engine';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
const {
    degToRad,
    radToDeg,
} = interaction.quaternion;

const {
    multiplyMatricesArray,
    translateMatrix,
    rotateYMatrix,
    matrixToCSSMatrix,
    arrayToMatrix,
    inverseMatrix,
} = interaction.transform.general;

const {
    getTransformRotate,
    getTransformTranslate,
    getTransformScale,
} = interaction.transform.matrix3d;

const {
    rotateMatrix,
    translateMatrix: translateMatrixArray,
    scaleMatrix,
    multiplyArrayOfMatrices,
} = interaction.matrix;

const {
    resolvePluridPlaneData,
    Registrar,
} = planes;



export const computeApplication = (
    indexedPlanes: Map<string, IndexedPluridPlane<PluridReactComponent>> | undefined,
    planes: PluridPlane<PluridReactComponent>[] | undefined,
    configuration: PluridPartialConfiguration | undefined,
    view: PluridApplicationView | undefined,
) => {
    // const planesPropertiesReference = new Map();

    // const computedIndexedPlanes = new Map<string, IndexedPluridPlane<PluridReactComponent>>(
    //     indexedPlanes || new Map()
    // );

    const appConfiguration = generalEngine.configuration.merge(configuration);


    if (planes) {
        for (const plane of planes) {
            const planeData = resolvePluridPlaneData(plane);

            const linkPath = routing.resolveRoute(planeData.route);
            if (!linkPath) {
                continue;
            }

            const {
                protocol,
                host,
                path,
                space,
                universe,
                cluster,
                plane: planePath,
                route,
            } = linkPath;

            const computedIndexedPlane: IndexedPluridPlane<PluridReactComponent> = {
                protocol: protocol,
                // host: host.value,
                // path: path.value,
                // space: space.value,
                // universe: universe.value,
                // cluster: cluster.value,
                // plane: planePath.value,
                host: '',
                path: '',
                space: '',
                universe: '',
                cluster: '',
                plane: '',
                route,
                component: planeData.component,
            };
            const id = route;

            // const planeProperties = {
            //     ...plane.component,
            // };
            // planesPropertiesReference.set(id, planeProperties);

            // computedIndexedPlanes.set(id, computedIndexedPlane);
        }
    }

    // const indexedPlanesReference = new Map(computedIndexedPlanes);

    // const planeSources: Record<string, string> = {};
    // for (const [id, indexedPlane] of computedIndexedPlanes) {
    //     planeSources[indexedPlane.route] = id;
    // }

    // // create tree planes
    // const treePlanes: TreePlane[] = [];

    // for (const [id, computedIndexedPlane] of computedIndexedPlanes) {
    //     // const pathProperties = computedIndexedPlane.component.properties?.plurid?.path;

    //     // let planeRouteSource = computedIndexedPlane.route;

    //     // if (pathProperties) {
    //     //     for (const [key, value] of Object.entries(pathProperties.parameters)) {
    //     //         planeRouteSource = planeRouteSource.replace(`:${key}`, value as string);
    //     //     }
    //     // }

    //     // const planeRoute = router.resolveRoute(planeRouteSource);
    //     // if (!planeRoute) {
    //     //     continue;
    //     // }

    //     // const {
    //     //     protocol,
    //     //     host,
    //     //     path,
    //     //     space,
    //     //     universe,
    //     //     cluster,
    //     //     plane,
    //     // } = planeRoute;

    //     // const treePlane: TreePlane = {
    //     //     ...defaultTreePlane,
    //     //     routeDivisions: {
    //     //         protocol: {
    //     //             value: protocol,
    //     //             secure: false,
    //     //         },
    //     //         host,
    //     //         path,
    //     //         space,
    //     //         universe,
    //     //         cluster,
    //     //         plane,
    //     //         valid: true,
    //     //     },
    //     //     sourceID: id,
    //     //     route: planeRouteSource,
    //     //     planeID: uuid.generate(),
    //     //     show: true,
    //     // };
    //     // treePlanes.push(treePlane);
    // }


    // create absolute view
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

    // console.log('treePlanes', treePlanes);
    // console.log('currentView', currentView);
    // console.log('absoluteView', absoluteView);

    // create tree
    // const planes = getRegisteredPlanes(planesRegistrar);

    const origin = 'localhost:63000';

    const registrar = new Registrar(
        planes,
        origin,
    );
    const registrarPlanes = registrar.getAll();
    // console.log({
    //     planes,
    //     registrarPlanes,
    // });

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
        // indexedPlanesReference,
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
