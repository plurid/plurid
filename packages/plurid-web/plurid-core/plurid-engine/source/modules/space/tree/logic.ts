// #region imports
    // #region libraries
    import {
        /** constants */
        PLANE_DEFAULT_ANGLE,
        PLURID_ROUTE_SEPARATOR,

        /** enumerations */
        LAYOUT_TYPES,

        /** interfaces */
        PluridView,
        PluridApplicationView,
        PluridConfiguration,
        RegisteredPluridPlane,
        TreePlane,
        LinkCoordinates,
        PathParameters,
        PluridRoute,
        PluridPlane,
    } from '@plurid/plurid-data';

    import {
        uuid,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        computeColumnLayout,
        computeRowLayout,
        computeFaceToFaceLayout,
        computeSheavesLayout,
        computeZigZagLayout,
    } from '../layout';

    import {
        computePluridPlaneLocation,
    } from '../location';

    import {
        getTreePlaneByPlaneID,
    } from '../utilities';

    import {
        IsoMatcher,
    } from '~modules/routing';

    import {
        computeComparingPath,
        extractParametersValues,
    } from '~modules/routing/Parser/logic';

    import {
        computePlaneAddress,
    } from '~modules/routing/logic';
    // #endregion external
// #endregion imports



// #region module
const matchRouteElements = (
    routePath: string,
    viewPath: string,
) => {
    // routePath = routePath[0] === '/'
    //     ? routePath.slice(1)
    //     : routePath;
    // viewPath = viewPath[0] === '/'
    //     ? viewPath.slice(1)
    //     : viewPath;

    // console.log('viewPath', viewPath);
    // console.log('routePath', routePath);

    if (routePath === viewPath) {
        return {
            value: viewPath,
            parameters: {},
            query: {},
        };
    }

    // console.log('viewPath', viewPath);
    // console.log('routePath', routePath);


    // check if viewPath is a parametrization of routePath
    const parameters: string[] = [];
    const routeSplit = routePath.slice(1).split('/');
    // console.log('routeSplit', routeSplit);

    routeSplit.forEach(routeElement => {
        if (routeElement[0] === ':') {
            parameters.push(routeElement);
        } else {
            parameters.push('');
        }
    });
    // console.log('parameters', parameters);

    const {
        locationElements,
        comparingPath,
    } = computeComparingPath(viewPath, parameters);
    // console.log('comparingPath', comparingPath);
    // console.log('routePath', routePath);
    // console.log('locationElements', locationElements);

    // if (comparingPath !== '/' + routePath) {
    //     return;
    // }
    if (comparingPath !== routePath) {
        return;
    }

    const parametersValues = extractParametersValues(
        parameters,
        locationElements,
    );
    // console.log('parametersValues', parametersValues);
    return {
        value: viewPath,
        parameters: parametersValues,
        query: {},
    };
}


const matchRouteToView = (
    route: string,
    view: string,
): undefined | any => {
    // const routeSplit = route.split(PLURID_ROUTE_SEPARATOR);
    // const viewSplit = view.split(PLURID_ROUTE_SEPARATOR);

    // console.log('route', route);
    // console.log('view', view);
    // console.log('routeSplit', routeSplit);
    // console.log('viewSplit', viewSplit);


    // if (routeSplit.length !== viewSplit.length) {
    //     return;
    // }

    const pathMatch = matchRouteElements(
        route,
        view,
    );
    // console.log('pathMatch', pathMatch);

    return {
        path: {
            ...pathMatch,
        },
        space: {
            // ...spaceMatch,
        },
        universe: {
            // ...universeMatch,
        },
        cluster: {
            // ...clusterMatch,
        },
        plane: {
            // ...planeMatch,
        },
    };




    // if (routeSplit.length !== viewSplit.length) {
    //     return;
    // }

    // const routePath = routeSplit[2];
    // // if (!routePath) return;
    // const viewPath = viewSplit[2];
    // // if (!viewPath) return;
    // console.log('viewPath', viewPath);
    // const pathMatch = matchRouteElements(
    //     routePath,
    //     viewPath,
    // );
    // console.log('pathMatch', pathMatch);
    // if (!pathMatch) {
    //     return;
    // }


    // const routeSpace = routeSplit[3];
    // // if (!routeSpace) return;
    // const viewSpace = viewSplit[3];
    // // if (!viewSpace) return;
    // const spaceMatch = matchRouteElements(
    //     routeSpace,
    //     viewSpace,
    // );
    // // console.log('spaceMatch', spaceMatch);
    // if (!spaceMatch) {
    //     return;
    // }


    // const routeUniverse = routeSplit[4];
    // // if (!routeUniverse) return;
    // const viewUniverse = viewSplit[4];
    // // if (!viewUniverse) return;
    // const universeMatch = matchRouteElements(
    //     routeUniverse,
    //     viewUniverse,
    // );
    // // console.log('universeMatch', universeMatch);
    // if (!universeMatch) {
    //     return;
    // }


    // const routeCluster = routeSplit[5];
    // // if (!routeCluster) return;
    // const viewCluster = viewSplit[5];
    // // if (!viewCluster) return;
    // const clusterMatch = matchRouteElements(
    //     routeCluster,
    //     viewCluster,
    // );
    // // console.log('clusterMatch', clusterMatch);
    // if (!clusterMatch) {
    //     return;
    // }


    // const routePlane = routeSplit[6];
    // // if (!routePlane) return;
    // const viewPlane = viewSplit[6];
    // // if (!viewPlane) return;
    // const planeMatch = matchRouteElements(
    //     routePlane,
    //     viewPlane,
    // );
    // // console.log('planeMatch', planeMatch);
    // if (!planeMatch) {
    //     return;
    // }

    // return {
    //     path: {
    //         ...pathMatch,
    //     },
    //     space: {
    //         ...spaceMatch,
    //     },
    //     universe: {
    //         ...universeMatch,
    //     },
    //     cluster: {
    //         ...clusterMatch,
    //     },
    //     plane: {
    //         ...planeMatch,
    //     },
    // };
}


/**
 * Given a view resolve it to an absolute view
 * and compute a TreePlane if there is a RegisteredPluridPlane
 * for that absolute view.
 *
 * @param view
 */
export const resolveViewItem = <C>(
    planes: Map<string, RegisteredPluridPlane<C>>,
    view: string | PluridView,
    configuration: PluridConfiguration,
    origin = 'origin',
    getCount?: () => number,
): TreePlane | undefined => {
    // console.log('resolveViewItem', planes);

    const {
        protocol,
        host,
    } = configuration.network;

    const viewData = typeof view === 'string'
        ? view
        : view.plane;
    // console.log('viewData', viewData);

    const viewAddress = computePlaneAddress(
        viewData,
        undefined,
        origin,
    );
    // console.log('viewAddress', viewAddress);

    // const resolvedView = resolveRoute(
    //     viewData,
    //     protocol,
    //     host,
    // );
    // console.log('resolvedView', resolvedView);

    const iPlanes = planes.values();
    const pluridPlanes: PluridPlane<C>[] = [];
    for (const iPlane of iPlanes) {
        // console.log('iPlane', iPlane);

        const plane: PluridPlane<C> = {
            route: iPlane.route.absolute,
            component: iPlane.component,
        };
        pluridPlanes.push(plane);
    }

    const isoMatcher = new IsoMatcher(
        {
            planes: pluridPlanes,
        },
        origin,
    );

    // const match = isoMatcher.match(resolvedView.route);
    const match = isoMatcher.match(viewData);
    // console.log('isoMatcher match', match);

    if (match) {
        const route = match.match.value;

        const count = getCount ? getCount() : uuid.generate();
        const planeID = route + '@' + count;

        const treePlane: TreePlane = {
            sourceID: route,

            planeID,

            // route: resolvedView.route,
            route: viewAddress,

            routeDivisions: {
                protocol: {
                    value: '',
                    secure: false,
                },
                host: {
                    value: host,
                    controlled: true,
                },
                path: {
                    parameters: {},
                    query: {},
                    value: '',
                },
                space: {
                    parameters: {},
                    query: {},
                    value: '',
                },
                universe: {
                    parameters: {},
                    query: {},
                    value: '',
                },
                cluster: {
                    parameters: {},
                    query: {},
                    value: '',
                },
                plane: {
                    parameters: {},
                    fragments: {
                        elements: [],
                        texts: [],
                    },
                    query: {},
                    value: '',
                },
                valid: true,
            },

            height: 0,
            width: 0,
            location: {
                translateX: 0,
                translateY: 0,
                translateZ: 0,
                rotateX: 0,
                rotateY: 0,
            },
            show: true,
        };

        return treePlane;
    }

    // for (const [route, _] of planes) {
    //     // const routeMatch = matchRouteToView(
    //     //     route,
    //     //     resolvedView.route,
    //     // );
    //     // console.log('route', route);
    //     // console.log('resolvedView.route', resolvedView.route);
    //     // console.log('routeMatch', routeMatch);

    //     if (resolvedView.route !== routeMatch.path.value) {
    //         continue;
    //     }
    //     // if (!routeMatch) {
    //     //     continue;
    //     // }

    //     const treePlane: TreePlane = {
    //         sourceID: route,

    //         planeID: uuid.generate(),

    //         route: resolvedView.route,

    //         routeDivisions: {
    //             protocol: {
    //                 value: '',
    //                 secure: false,
    //             },
    //             host: {
    //                 value: host,
    //                 controlled: true,
    //             },
    //             path: routeMatch.path,
    //             space: routeMatch.space,
    //             universe: routeMatch.universe,
    //             cluster: routeMatch.cluster,
    //             plane: routeMatch.plane,
    //             valid: true,
    //         },

    //         height: 0,
    //         width: 0,
    //         location: {
    //             translateX: 0,
    //             translateY: 0,
    //             translateZ: 0,
    //             rotateX: 0,
    //             rotateY: 0,
    //         },
    //         show: true,
    //     };

    //     return treePlane;
    // }

    return;
}


/**
 * Compute the space based on the layout.
 * If there is no configuration.space.layout, it uses the default '2 COLUMNS' layout.
 *
 * @param planes
 * @param configuration
 */
export const computeSpaceTree = <C>(
    planes: Map<string, RegisteredPluridPlane<C>>,
    view: PluridApplicationView,
    configuration: PluridConfiguration,
    layout: boolean | undefined,
    origin = 'origin',
    getCount: () => number,
): TreePlane[] => {
    // console.log('computeSpaceTree');
    // console.log('planes', planes);
    // console.log('configuration', configuration);
    // console.log('computeSpaceTree view', view);
    // console.log('computeSpaceTree origin', origin);

    const treePlanes: TreePlane[] = [];

    for (const viewItem of view) {
        const treePlane = resolveViewItem(
            planes,
            viewItem,
            configuration,
            origin,
            getCount,
        );

        if (treePlane) {
            treePlanes.push(treePlane);
        }
    }

    if (!layout) {
        const layoutlessTreePlanes = treePlanes.map(plane => {
            return {
                ...plane,
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 0,
                    translateZ: 0,
                },
            };
        });

        return layoutlessTreePlanes;
    }

    switch(configuration.space.layout.type) {
        case LAYOUT_TYPES.COLUMNS:
            {
                const {
                    columns,
                    columnLength,
                    gap,
                } = configuration.space.layout;
                const columnLayoutTree = computeColumnLayout(
                    treePlanes,
                    columns,
                    columnLength,
                    gap,
                    configuration,
                );
                return columnLayoutTree;
            }
        case LAYOUT_TYPES.ROWS:
            {
                const {
                    rows,
                    rowLength,
                    gap,
                } = configuration.space.layout;
                const rowLayoutTree = computeRowLayout(
                    treePlanes,
                    rows,
                    rowLength,
                    gap,
                    configuration,
                );
                return rowLayoutTree;
            }
        case LAYOUT_TYPES.ZIG_ZAG:
            {
                const {
                    angle,
                } = configuration.space.layout;
                const zigzagLayoutTree = computeZigZagLayout(
                    treePlanes,
                    angle,
                    configuration,
                );
                return zigzagLayoutTree;
            }
        case LAYOUT_TYPES.FACE_TO_FACE:
            {
                const {
                    angle,
                    gap,
                    middle,
                } = configuration.space.layout;
                const faceToFaceLayoutTree = computeFaceToFaceLayout(
                    treePlanes,
                    angle,
                    gap,
                    middle,
                    configuration,
                );
                return faceToFaceLayoutTree;
            }
        case LAYOUT_TYPES.SHEAVES:
            {
                const {
                    depth,
                    offsetX,
                    offsetY,
                } = configuration.space.layout;
                const sheavesLayoutTree = computeSheavesLayout(
                    treePlanes,
                    depth,
                    offsetX,
                    offsetY,
                    configuration,
                );
                return sheavesLayoutTree;
            }
        case LAYOUT_TYPES.META:
            {
                return [];
            }
        default:
            return [];
    }
}


export const isParametric = (
    viewRoute: string,
    planeRoute: string,
) => {
    return true;
}

export const matchForParameters = (
    viewRoute: string,
    planeRoute: string,
) => {
    const splitViewRoute = viewRoute.split('://');
    const splitPlaneRoute = planeRoute.split('://');
    // "http://localhost:3000://p://s://u://c://one"
    // "http://localhost:3000://p://s://u://c://:id"

    const pathViewRoute = splitViewRoute[2];
    const pathPlaneRoute = splitPlaneRoute[2];

}


export const assignPagesFromView = (
    planes: TreePlane[],
    view?: PluridApplicationView,
): TreePlane[] => {
    if (!view) {
        return planes;
    }

    const tree: TreePlane[] = [];

    // const routes: PluridRoute[] = pages.map(page => {
    //     const route: PluridRoute = {
    //         value: page.route,
    //         // value: page.value,
    //         // view: '',
    //     };
    //     return route;
    // });

    // const router = new Router(routes);

    // console.log('planes', planes);
    // console.log('view', view);

    for (const viewPlane of view) {
        if (typeof viewPlane === 'string') {
            for (const plane of planes) {
                if (viewPlane === plane.sourceID) {
                    tree.push(plane);
                }

                if (isParametric(viewPlane, plane.sourceID)) {
                    const parametricPlane = {
                        ...plane,
                    };
                    parametricPlane.routeDivisions.plane.parameters.id = 'one';
                    parametricPlane.routeDivisions.plane.value = 'one';
                    parametricPlane.route = viewPlane;
                    tree.push(parametricPlane);
                }
            }
        }
    }


    // for (const [index, viewPage] of view.entries()) {
        // const viewPagePath = typeof viewPage === 'string'
        //     ? viewPage
        //     : viewPage.path;

        // const matchedPage = router.match(viewPagePath);

        // console.log('matchedPage', matchedPage);

        // if (matchedPage) {
        //     const page = pages.find(p => p.route === matchedPage?.path.value);
        //     if (!page) {
        //         break;
        //     }

        //     const newPage = {
        //         ...page,
        //         path: viewPagePath,
        //         planeID: uuid.generate(),
        //     };

        //     const viewPageOrdinal = typeof viewPage === 'string'
        //         ? index
        //         : typeof viewPage.ordinal === 'number'
        //             ? viewPage.ordinal
        //             : index;

        //     const treePage = tree[viewPageOrdinal];

        //     if (typeof treePage === 'undefined') {
        //         tree[viewPageOrdinal] = newPage;
        //     } else {
        //         let elementSet = false;
        //         let pageIndex = viewPageOrdinal;

        //         do {
        //             const nextIndex = pageIndex + 1;
        //             const nextTreePlane = tree[nextIndex];
        //             if (typeof nextTreePlane === 'undefined') {
        //                 tree[nextIndex] = newPage;
        //                 elementSet = true;
        //             }
        //         } while (!elementSet);
        //     }
        // }
    // }

    return tree;
}







export const updateTreePlane = (
    tree: TreePlane[],
    updatedPlane: TreePlane,
): TreePlane[] => {
    const updatedTree = tree.map(treePlane => {
        if (treePlane.planeID === updatedPlane.planeID) {
            return updatedPlane;
        }

        if (treePlane.children) {
            const children = updateTreePlane(
                treePlane.children,
                updatedPlane,
            );
            treePlane.children = children;
            return treePlane;
        }

        return treePlane;
    });

    return updatedTree;
}



export interface UpdatedTreeWithNewPlane {
    pluridPlaneID: string;
    updatedTree: TreePlane[];
    updatedTreePlane?: TreePlane;
}

export const updateTreeWithNewPlane = <C>(
    planeRoute: string,
    parentPlaneID: string,
    linkCoordinates: LinkCoordinates,
    tree: TreePlane[],
    planesRegistry: Map<string, RegisteredPluridPlane<C>>,
    configuration: PluridConfiguration,
    hostname = 'origin',
): UpdatedTreeWithNewPlane => {
    const parentPlane = getTreePlaneByPlaneID(tree, parentPlaneID);
    // console.log('updateTreeWithNewPlane parentPlane', parentPlane);

    if (!parentPlane) {
        return {
            pluridPlaneID: '',
            updatedTree: tree,
        };
    }

    const location = computePluridPlaneLocation(
        linkCoordinates,
        parentPlane,
    );
    // console.log('location', location);
    // console.log('planeRoute', planeRoute);

    const treePlane = resolveViewItem(
        planesRegistry,
        planeRoute,
        configuration,
        hostname,
    );
    // console.log('updateTreeWithNewPlane treePlane', treePlane);

    if (!treePlane) {
        return {
            pluridPlaneID: '',
            updatedTree: tree,
        };
    }

    const updatedTreePlane = {
        ...treePlane,
        parentPlaneID,
        location: {
            translateX: location.x,
            translateY: location.y,
            translateZ: location.z,
            rotateX: 0,
            rotateY: parentPlane.location.rotateY + PLANE_DEFAULT_ANGLE,
        },
        bridgeLength: 100,
        planeAngle: 90,
        linkCoordinates,
    };
    // console.log('updatedTreePlane', updatedTreePlane);


    // const newPlane: TreePlane = {
    //     sourceID: '',
    //     route: planePath,
    //     routeDivisions: {
    //         protocol: '',
    //         host: {
    //             value: '',
    //             controlled: false,
    //         },
    //         path: {
    //             value: '',
    //             parameters: {},
    //             query: {},
    //         },
    //         space: {
    //             value: '',
    //             parameters: {},
    //             query: {},
    //         },
    //         universe: {
    //             value: '',
    //             parameters: {},
    //             query: {},
    //         },
    //         cluster: {
    //             value: '',
    //             parameters: {},
    //             query: {},
    //         },
    //         plane: {
    //             value: '',
    //             parameters: {},
    //             query: {},
    //         },
    //         valid: false,
    //     },
    //     // parameters: extractedParameters,
    //     // parameters: {},
    //     planeID,
    //     width: 0,
    //     height: 0,
    //     parentPlaneID,
    //     location: {
    //         translateX: location.x,
    //         translateY: location.y,
    //         translateZ: location.z,
    //         rotateX: 0,
    //         rotateY: parentPlane.location.rotateY + PLANE_DEFAULT_ANGLE,
    //     },
    //     show: true,
    //     bridgeLength: 100,
    //     planeAngle: 90,
    //     linkCoordinates,
    // };
    // console.log('newPlane', newPlane);

    const updatedParentPlane: TreePlane = {
        ...parentPlane,
    };

    if (updatedParentPlane.children) {
        updatedParentPlane.children.push(updatedTreePlane);
    } else {
        updatedParentPlane.children = [updatedTreePlane];
    }

    const updatedTree = updateTreePlane(tree, updatedParentPlane);

    return {
        pluridPlaneID: updatedTreePlane.planeID,
        updatedTree,
        updatedTreePlane,
    };
}


export const updatePlaneLocation = (
    tree: TreePlane[],
    parentPlaneID: string,
    planeID: string,
    linkCoordinates: LinkCoordinates,
) => {
    const parentPlane = getTreePlaneByPlaneID(tree, parentPlaneID);
    const plane = getTreePlaneByPlaneID(tree, planeID);

    if (!parentPlane || !plane) {
        return tree;
    }

    const location = computePluridPlaneLocation(
        linkCoordinates,
        parentPlane,
    );

    plane.location = {
        translateX: location.x,
        translateY: location.y,
        translateZ: location.z,
        rotateX: 0,
        rotateY: parentPlane.location.rotateY + PLANE_DEFAULT_ANGLE,
    };

    const updatedTree = updateTreePlane(
        tree,
        plane,
    );

    return updatedTree;
}



export const updateTreeWithNewPage = (
    tree: TreePlane[],
    treePageParentPlaneID: string,
    pagePath: string,
    pageID: string,
    linkCoordinates: LinkCoordinates,
    parameters?: PathParameters,
): UpdatedTreeWithNewPlane => {
    // to receive parameters and composePath from pagePath and parameters

    const treePageParent = getTreePlaneByPlaneID(tree, treePageParentPlaneID);
    // console.log('tree page parent', treePageParent);

    if (treePageParent) {
        const location = computePluridPlaneLocation(
            linkCoordinates,
            treePageParent,
        );

        // const extractedParameters = extractParameters(
        //     pagePath,
        //     parameters,
        // );

        const planeID = uuid.generate();
        const newTreePlane: TreePlane = {
            sourceID: pageID,
            route: pagePath,
            routeDivisions: {
                protocol: {
                    value: '',
                    secure: false,
                },
                host: {
                    value: '',
                    controlled: false,
                },
                path: {
                    value: '',
                    parameters: {},
                    query: {},
                },
                space: {
                    value: '',
                    parameters: {},
                    query: {},
                },
                universe: {
                    value: '',
                    parameters: {},
                    query: {},
                },
                cluster: {
                    value: '',
                    parameters: {},
                    query: {},
                },
                plane: {
                    value: '',
                    parameters: {},
                    query: {},
                    fragments: {
                        texts: [],
                        elements: [],
                    },
                },
                valid: false,
            },
            // parameters: extractedParameters,
            // parameters: {},
            planeID,
            width: 0,
            height: 0,
            parentPlaneID: treePageParentPlaneID,
            location: {
                translateX: location.x,
                translateY: location.y,
                translateZ: location.z,
                rotateX: 0,
                rotateY: treePageParent.location.rotateY + PLANE_DEFAULT_ANGLE,
            },
            show: true,
            bridgeLength: 100,
            planeAngle: 90,
            linkCoordinates,
        };

        const updatedTreePlaneParent = {...treePageParent};
        if (updatedTreePlaneParent.children) {
            updatedTreePlaneParent.children.push(newTreePlane);
        } else {
            updatedTreePlaneParent.children = [newTreePlane];
        }

        const updatedTree = updateTreePlane(tree, updatedTreePlaneParent);

        return {
            pluridPlaneID: planeID,
            updatedTree,
        };
    }

    return {
        pluridPlaneID: '',
        updatedTree: tree,
    };
}


export const removePageFromTree = (
    tree: TreePlane[],
    pluridPlaneID: string,
): TreePlane[] => {
    const updatedTree = tree.filter(page => {
        if (page.planeID === pluridPlaneID) {
            return false;
        }

        if (page.children) {
            const pageTree = removePageFromTree(page.children, pluridPlaneID);
            page.children = pageTree;
            return page;
        }

        return page;
    });

    return updatedTree;
}


export const toggleChildren = (
    children: TreePlane[],
): TreePlane[] => {
    const updatedChildren = children.map(child => {
        if (child.children) {
            const updatedChild = {
                ...child,
                show: !child.show,
                children: toggleChildren(child.children),
            }
            return updatedChild;
        }

        const updatedChild: TreePlane = {
            ...child,
            show: !child.show,
        };
        return updatedChild;
    });

    return updatedChildren;
}


export const toggleAllChildren = (
    tree: TreePlane[],
    show: boolean,
) => {
    const updatedTree: TreePlane[] = [];

    for (const plane of tree) {
        if (plane.children) {
            plane.children = toggleAllChildren(
                plane.children,
                show,
            );
        }

        plane.show = show;

        updatedTree.push(plane);
    }

    return tree;
}


export interface TogglePlaneFromTree {
    updatedTree: TreePlane[];
    updatedPlane: TreePlane | undefined;
}

export const togglePlaneFromTree = (
    tree: TreePlane[],
    pluridPlaneID: string,
    forceShow?: boolean,
): TogglePlaneFromTree => {
    const updatedTree: TreePlane[] = [];

    let updatedPlane: TreePlane | undefined;

    for (const plane of tree) {
        if (plane.planeID === pluridPlaneID) {
            const show = forceShow ?? !plane.show;

            const treeUpdatedPlane: TreePlane = {
                ...plane,
                show,
            };

            if (treeUpdatedPlane.children) {
                const children = toggleAllChildren(
                    treeUpdatedPlane.children,
                    show,
                );
                treeUpdatedPlane.children = children;
            }

            updatedTree.push(treeUpdatedPlane);
            updatedPlane = {
                ...treeUpdatedPlane,
            };

            continue;
        }


        if (plane.children) {
            const {
                updatedTree: childrenUpdatedTree,
                updatedPlane: childrenUpdatedPlane,
            } = togglePlaneFromTree(
                plane.children,
                pluridPlaneID,
                forceShow,
            );

            plane.children = [ ...childrenUpdatedTree ];
            updatedTree.push(plane);

            if (childrenUpdatedPlane) {
                updatedPlane = {
                    ...childrenUpdatedPlane,
                };
            }

            continue;
        }


        updatedTree.push(plane);
    }

    return {
        updatedTree,
        updatedPlane,
    };
}


export const getTreePlaneByID = (
    stateTree: TreePlane[],
    id: string | undefined,
): TreePlane | undefined => {
    if (!id) {
        return;
    }

    for (const plane of stateTree) {
        if (plane.planeID === id) {
            return plane;
        }

        if (plane.children) {
            const found = getTreePlaneByID(
                plane.children,
                id,
            );

            if (found) {
                return found;
            }
        }
    }

    return;
}


export const removeRootFromTree = (
    tree: TreePlane[],
    pluridPlaneID: string,
) => {
    const updatedTree = tree.filter(plane => plane.planeID !== pluridPlaneID);

    return {
        updatedTree,
    };
}


export const removePlaneFromTree = (
    tree: TreePlane[],
    pluridPlaneID: string,
) => {
    const updatedTree: TreePlane[] = [];

    for (const plane of tree) {
        if (plane.planeID === pluridPlaneID) {
            continue;
        }

        if (plane.children) {
            const children = removePlaneFromTree(
                plane.children,
                pluridPlaneID,
            );
            plane.children = children;
        }

        updatedTree.push(plane);
    }

    return updatedTree;
}
// #endregion module
