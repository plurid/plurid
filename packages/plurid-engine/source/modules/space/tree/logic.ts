import {
    /** constants */
    PLANE_DEFAULT_ANGLE,

    /** enumerations */
    LAYOUT_TYPES,

    /** interfaces */
    PluridView,
    PluridConfiguration,
    TreePlane,
    LinkCoordinates,
    PathParameters,
    PluridRouterPath,
} from '@plurid/plurid-data';

import {
    uuid,
} from '@plurid/plurid-functions';

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

import Router from '../../router';




/**
 * Compute the space based on the layout.
 * If there is no configuration.space.layout, it uses the default '2 COLUMNS' layout.
 *
 * @param pages
 * @param configuration
 */
export const computeSpaceTree = (
    pages: TreePlane[],
    configuration?: PluridConfiguration,
    view?: string[] | PluridView[],
): TreePlane[] => {
    if (!configuration) {
        const columnLayoutTree = computeColumnLayout(pages);
        return columnLayoutTree;
    }

    const assignedPages = assignPagesFromView(pages, view);
    // console.log('assignedPages', assignedPages);

    switch(configuration.space.layout.type) {
        case LAYOUT_TYPES.COLUMNS:
            {
                const {
                    columns,
                    columnLength,
                    gap,
                } = configuration.space.layout;
                const columnLayoutTree = computeColumnLayout(
                    assignedPages,
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
                    assignedPages,
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
                    assignedPages,
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
                    assignedPages,
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
                    assignedPages,
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


export const assignPagesFromView = (
    planes: TreePlane[],
    view?: string[] | PluridView[],
): TreePlane[] => {
    if (!view) {
        return planes;
    }

    const tree: TreePlane[] = [];

    // const routes: PluridRouterPath[] = pages.map(page => {
    //     const route: PluridRouterPath = {
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
                if (plane.route === viewPlane) {
                    tree.push(plane);
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
    updatedPage: TreePlane,
): TreePlane[] => {
    const updatedTree = tree.map(page => {
        if (page.planeID === updatedPage.planeID) {
            return updatedPage;
        }

        if (page.children) {
            const pageTree = updateTreePlane(page.children, updatedPage);
            page.children = pageTree;
            return page;
        }

        return page;
    });

    return updatedTree;
}




export const updateTreeWithNewPlane = (
    planePath: string,
    parentPlaneID: string,
    linkCoordinates: LinkCoordinates,
    tree: TreePlane[],
): UpdatedTreeWithNewPlane => {
    const parentPlane = getTreePlaneByPlaneID(tree, parentPlaneID);
    // console.log('parentPlane', parentPlane);

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

    const planeID = uuid.generate();
    const newPlane: TreePlane = {
        sourceID: '',
        route: planePath,
        routeDivisions: {
            protocol: '',
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
            },
            valid: false,
        },
        // parameters: extractedParameters,
        // parameters: {},
        planeID,
        width: 0,
        height: 0,
        parentPlaneID,
        location: {
            translateX: location.x,
            translateY: location.y,
            translateZ: location.z,
            rotateX: 0,
            rotateY: parentPlane.location.rotateY + PLANE_DEFAULT_ANGLE,
        },
        show: true,
        bridgeLength: 100,
        planeAngle: 90,
        linkCoordinates,
    };
    // console.log('newPlane', newPlane);

    const updatedParentPlane: TreePlane = {
        ...parentPlane,
    };

    if (updatedParentPlane.children) {
        updatedParentPlane.children.push(newPlane);
    } else {
        updatedParentPlane.children = [newPlane];
    }

    const updatedTree = updateTreePlane(tree, updatedParentPlane);

    return {
        pluridPlaneID: planeID,
        updatedTree,
    };
}



interface UpdatedTreeWithNewPlane {
    pluridPlaneID: string;
    updatedTree: TreePlane[];
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
                protocol: '',
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


export const togglePlaneFromTree = (
    tree: TreePlane[],
    pluridPlaneID: string,
): TreePlane[] => {
    const updatedTree: TreePlane[] = [];

    for (const page of tree) {
        if (page.planeID === pluridPlaneID) {
            const updatedPage: TreePlane = {
                ...page,
                show: !page.show,
                children: [],
                // TODO
                // Instead of removing all the children to toggle them
                // currently, issue with the plurid link creating new instances.
                // children: page.children ? toggleChildren(page.children) : [],
            };
            updatedTree.push(updatedPage);
            continue;
        }

        if (page.children) {
            const pageTree = togglePlaneFromTree(page.children, pluridPlaneID);
            page.children = [ ...pageTree ];
            updatedTree.push(page);
            continue;
        }

        updatedTree.push(page);
    }

    return updatedTree;
}
