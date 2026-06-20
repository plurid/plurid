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
        TreePlaneLocation,
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









export const updateTreePlane = (
    tree: TreePlane[],
    updatedPlane: TreePlane,
): TreePlane[] => {
    // Immutable + structurally-shared: only the nodes ON THE PATH to `updatedPlane` get new
    // object identities; every untouched subtree keeps its original reference (so React.memo /
    // referential selectors can skip the planes that didn't change). Previously this mutated
    // `treePlane.children` in place, corrupting the input tree (Redux stale-render/double-apply).
    let changed = false;

    const mapped = tree.map(treePlane => {
        if (treePlane.planeID === updatedPlane.planeID) {
            changed = true;
            return updatedPlane;
        }

        if (treePlane.children) {
            const newChildren = updateTreePlane(
                treePlane.children,
                updatedPlane,
            );
            if (newChildren !== treePlane.children) {
                changed = true;
                return {
                    ...treePlane,
                    children: newChildren,
                };
            }
        }

        return treePlane;
    });

    // Same reference out when nothing matched — preserves structural sharing up the recursion.
    return changed ? mapped : tree;
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
        // Couple the parent→child GAP to the same configured length the bridge renders at,
        // otherwise the bridge visual (width) overshoots/undershoots the actual gap.
        configuration.space.bridge?.length ?? 100,
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
        // Configurable bridge geometry (defaults preserve the original 100 / 90).
        bridgeLength: configuration.space.bridge?.length ?? 100,
        planeAngle: configuration.space.bridge?.planeAngle ?? 90,
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

    // New children array (don't `.push` into the shared `parentPlane.children`, which mutates
    // the input tree).
    const updatedParentPlane: TreePlane = {
        ...parentPlane,
        children: parentPlane.children
            ? [...parentPlane.children, updatedTreePlane]
            : [updatedTreePlane],
    };

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
        // Use the plane's STORED bridge geometry (set at spawn from config), otherwise this
        // recompute resets the gap to the default 100 and the bridge visual overshoots.
        plane.bridgeLength,
        plane.planeAngle,
    );

    // New plane object (don't mutate the live tree node in place); `updateTreePlane` then
    // swaps it in immutably with structural sharing.
    const updatedPlane: TreePlane = {
        ...plane,
        location: {
            translateX: location.x,
            translateY: location.y,
            translateZ: location.z,
            rotateX: 0,
            rotateY: parentPlane.location.rotateY + PLANE_DEFAULT_ANGLE,
        },
    };

    const updatedTree = updateTreePlane(
        tree,
        updatedPlane,
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

        // New children array instead of `.push` into the shared `treePageParent.children`.
        const updatedTreePlaneParent = {
            ...treePageParent,
            children: treePageParent.children
                ? [...treePageParent.children, newTreePlane]
                : [newTreePlane],
        };

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


// `removePageFromTree` was a byte-for-byte duplicate of `removePlaneFromTree` (below) — same
// immutable, structurally-shared removal, only the local names differed. It had no production
// caller (only its own test), so it was deleted and its test repointed at `removePlaneFromTree`.


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
): TreePlane[] => {
    // Fully immutable: each plane becomes a NEW node with the toggled `show` and recursively
    // toggled children. The previous version mutated `plane.show`/`plane.children` in place —
    // which now throws, since callers (e.g. `togglePlaneFromTree`, post clone-removal) pass the
    // frozen Redux tree directly.
    return tree.map((plane) => ({
        ...plane,
        show,
        children: plane.children
            ? toggleAllChildren(plane.children, show)
            : plane.children,
    }));
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

            // New node with the recursively-updated children (don't reassign
            // `plane.children`, which mutates the input tree).
            updatedTree.push({
                ...plane,
                children: [ ...childrenUpdatedTree ],
            });

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
): TreePlane[] => {
    // Immutable + structurally shared: untouched subtrees keep their reference; only the
    // branch that drops a node (or whose descendant was dropped) gets a new identity. The
    // previous version mutated `plane.children` in place.
    let changed = false;

    const updatedTree: TreePlane[] = [];
    for (const plane of tree) {
        if (plane.planeID === pluridPlaneID) {
            changed = true;
            continue;
        }

        if (plane.children) {
            const children = removePlaneFromTree(
                plane.children,
                pluridPlaneID,
            );
            if (children !== plane.children) {
                changed = true;
                updatedTree.push({ ...plane, children });
                continue;
            }
        }

        updatedTree.push(plane);
    }

    return changed ? updatedTree : tree;
}


// #region structural sharing
/**
 * `width`/`height` carry-forward: the layout recompute (`computeSpaceTree`) emits a root/child
 * plane with `width: 0, height: 0` because it cannot know the eventually-rendered pixel size —
 * that is measured at runtime by the plane's ResizeObserver and written back via a SEPARATE
 * `updateSpaceTreePlane` dispatch. So a `0` (or missing) incoming dimension means "unmeasured,
 * keep what we already have", NOT "the plane shrank to zero". Treating it as a change would both
 * blow away the live measurement on every relayout AND defeat reference reuse below.
 */
const carriedDimension = (
    next: number | undefined,
    previous: number,
): number => (
    (!next && previous) ? previous : (next as number)
);

const sameLocation = (
    a: TreePlaneLocation,
    b: TreePlaneLocation,
): boolean =>
    a.translateX === b.translateX
    && a.translateY === b.translateY
    && a.translateZ === b.translateZ
    && a.rotateX === b.rotateX
    && a.rotateY === b.rotateY;

/**
 * Every field the renderer/engine reads off a node EXCEPT `children` (reconciled recursively) and
 * `width`/`height` (carry-forward, handled by the caller). `routeDivisions`/`linkCoordinates` are
 * derived from `route`, so an equal `route` implies they match too.
 */
const sameNodeOwnFields = (
    a: TreePlane,
    b: TreePlane,
): boolean =>
    a.sourceID === b.sourceID
    && a.planeID === b.planeID
    && a.parentPlaneID === b.parentPlaneID
    && a.route === b.route
    && a.show === b.show
    && a.bridgeLength === b.bridgeLength
    && a.planeAngle === b.planeAngle
    && sameLocation(a.location, b.location);

// Mutually recursive with `reconcileNode`; declared as hoisted `function`s so order doesn't matter.
function reconcileNodeList(
    previous: TreePlane[] | undefined,
    next: TreePlane[],
): TreePlane[] {
    if (!previous || previous.length === 0) {
        return next;
    }

    const previousByID = new Map<string, TreePlane>();
    for (const node of previous) {
        if (node.planeID) {
            previousByID.set(node.planeID, node);
        }
    }

    let everyReused = previous.length === next.length;
    const reconciled = next.map((nextNode, index) => {
        // Pair by stable runtime identity (planeID), falling back to position.
        const previousNode = (nextNode.planeID && previousByID.get(nextNode.planeID))
            || previous[index];
        const result = reconcileNode(previousNode, nextNode);
        if (result !== previous[index]) {
            everyReused = false;
        }
        return result;
    });

    // If every node was reused in the same order/length, keep the previous ARRAY reference too, so
    // a consumer reading the whole list (e.g. `<PluridRoots>`) can also bail.
    return everyReused ? previous : reconciled;
}

function reconcileNode(
    previous: TreePlane | undefined,
    next: TreePlane,
): TreePlane {
    if (!previous || previous === next) {
        return next;
    }

    // Depth-first: reconcile children so a subtree whose descendants are all unchanged collapses
    // to the previous reference here.
    let children = next.children;
    if (next.children && next.children.length > 0) {
        children = reconcileNodeList(previous.children, next.children);
    } else if (
        (!next.children || next.children.length === 0)
        && previous.children
        && previous.children.length === 0
    ) {
        children = previous.children;
    }

    const width = carriedDimension(next.width, previous.width);
    const height = carriedDimension(next.height, previous.height);

    const unchanged =
        sameNodeOwnFields(previous, next)
        && children === previous.children
        && width === previous.width
        && height === previous.height;

    if (unchanged) {
        return previous;
    }

    // Partially changed: new node, but graft the reconciled children + carried dimensions so deeper
    // unchanged subtrees and the live measurement survive.
    if (
        children !== next.children
        || width !== next.width
        || height !== next.height
    ) {
        return {
            ...next,
            width,
            height,
            children,
        };
    }

    return next;
}

/**
 * Structural-sharing reconciliation: returns `nextTree`, but every node (and array) that is
 * deep-equal to its counterpart in `previousTree` is replaced by the PREVIOUS reference. Producers
 * of a new tree routinely rebuild it from scratch (a layout recompute emits brand-new node objects
 * for every plane even when only one moved); without this, every connected `<PluridRoot>`/`<Plane>`
 * receives fresh-identity props and re-renders. Running this in the `setTree` reducer means EVERY
 * tree-replacing path (link spawn, relayout, resize, persistence restore) gets reference stability
 * for free, so per-plane memoization actually pays off and only the genuinely-changed planes render.
 */
export const reconcileTree = (
    previousTree: TreePlane[] | undefined,
    nextTree: TreePlane[],
): TreePlane[] => {
    if (!previousTree || previousTree === nextTree) {
        return nextTree;
    }
    return reconcileNodeList(previousTree, nextTree);
};
// #endregion structural sharing
// #endregion module
