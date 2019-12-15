import {
    PluridPage,
    PluridConfiguration,
    TreePage,
    SpaceLocation,
    LocationCoordinates,

    PageParameter,
    PathParameter,

    ROOTS_GAP,
    PLANE_DEFAULT_ANGLE,

    LAYOUT_TYPES,
} from '@plurid/plurid-data';

import {
    mathematics,
    uuidv4 as uuid,
} from '@plurid/plurid-functions';



const toRadians = mathematics.geometry.toRadians;


/**
 * Compute translateX based on configuration layout if it exists
 * or based on the index of the root.
 *
 * @param configuration
 * @param root
 * @param index
 */
export const computeRootLocationX = (
    configuration: PluridConfiguration | undefined,
    root: PluridPage,
    index: number,
) => {
    let translateX = 0;
    if (configuration && configuration.space) {
        if (Array.isArray(configuration.space.layout)) {
            const layoutIndex = configuration.space.layout.indexOf(root.path);
            translateX = window.innerWidth * layoutIndex + ROOTS_GAP * layoutIndex;
        }
    } else {
        translateX = index === 0
            ? 0
            : window.innerWidth * index + ROOTS_GAP * index;
    }

    return translateX;
}


/**
 * Compute the space based on the layout.
 * If there is no configuration.space.layout, it uses the default '2 COLUMNS' layout.
 *
 * @param pages
 * @param configuration
 */
export const computeSpaceTree = (
    pages: TreePage[],
    configuration?: PluridConfiguration,
): TreePage[] => {
    if (!configuration) {
        const columnLayoutTree = computeColumnLayout(pages);
        return columnLayoutTree;
    }

    switch(configuration.space.layout.type) {
        case LAYOUT_TYPES.COLUMNS:
            {
                const {
                    columns,
                } = configuration.space.layout;
                const columnLayoutTree = computeColumnLayout(pages, columns);
                return columnLayoutTree;
            }
        case LAYOUT_TYPES.ZIG_ZAG:
            {
                const {
                    angle,
                } = configuration.space.layout;
                const zigzagLayoutTree = computeZigZagLayout(pages, angle);
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
                    pages,
                    angle,
                    gap,
                    middle,
                );
                console.log(faceToFaceLayoutTree);
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
                    pages,
                    depth,
                    offsetX,
                    offsetY,
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


export const computeColumnLayout = (
    roots: TreePage[],
    columns: number = 2,
    columnsGap: number = ROOTS_GAP,
    rowsGap: number = ROOTS_GAP,
): TreePage[] => {
    const tree: TreePage[] = [];

    const width = window.innerWidth;
    const height = window.innerHeight;

    for (const [index, root] of roots.entries()) {
        const rowIndex = Math.floor(index / columns);
        const columnIndex = index % columns;
        const translateX = columnIndex * (width + columnsGap);
        const translateY = rowIndex * (height + rowsGap);

        const treePage: TreePage = {
            pageID: root.pageID,
            path: root.path,
            planeID: uuid(),
            location: {
                translateX,
                translateY,
                translateZ: 0,
                rotateX: 0,
                rotateY: 0,
            },
            show: true,
        };

        tree.push(treePage);
    }

    return tree;
}


export const computeZigZagLayout = (
    roots: TreePage[],
    angle: number = 45,
): TreePage[] => {
    const tree: TreePage[] = [];

    const singleColumnedRoots = computeColumnLayout(roots, 1);

    for (const [index, root] of singleColumnedRoots.entries()) {
        const value = index % 2 === 0 ? 1 : -1;
        root.location.rotateY = value * angle;
        tree.push({ ...root });
    }

    return tree;
}


const splitIntoGroups = <T>(
    data: T[],
    length: number,
): T[][] => {
    const initialArray = [...data];
    const groups: any[] = [];

    while (initialArray.length) {
        const group = initialArray.splice(0, length);
        groups.push(group);
    }

    return groups;
}


export const computeFaceToFaceLayout = (
    roots: TreePage[],
    angle: number = 45,
    gap: number = 0,
    middle: number = 0,
): TreePage[] => {
    const tree: TreePage[] = [];

    const width = window.innerWidth;
    const height = window.innerHeight;
    const planeAngle = 90 - angle/2;

    const columns = 2 + middle;

    const rows = splitIntoGroups(roots, columns);

    for (const [index, row] of rows.entries()) {
        const translateY = index * height;

        for (const [index, page] of row.entries()) {
            const first = index === 0;
            const last = index === columns - 1;

            const translateZ = first
                ? width * Math.sin(toRadians(planeAngle))
                : last
                    ? 0
                    : 0;
            const translateX = first
                ? width * Math.cos(toRadians(planeAngle))
                : last
                    ? index * width
                    : index * width;
            const rotateY = first
                ? planeAngle
                : last
                    ? -planeAngle
                    : 0;

            const treePage: TreePage = {
                pageID: page.pageID,
                path: page.path,
                planeID: uuid(),
                location: {
                    translateX,
                    translateY,
                    translateZ,
                    rotateX: 0,
                    rotateY,
                },
                show: true,
            };
            tree.push(treePage);
        }
    }

    // for (const [index, root] of roots.entries()) {
    //     const translateX = 0;
    //     const translateY = 0;

    //     const rotateY = halfAngle;

    //     const treePage: TreePage = {
    //         pageID: root.pageID,
    //         path: root.path,
    //         planeID: uuid(),
    //         location: {
    //             translateX,
    //             translateY,
    //             translateZ: 0,
    //             rotateX: 0,
    //             rotateY,
    //         },
    //         show: true,
    //     };

    //     tree.push(treePage);
    // }

    return tree;
}


export const computeSheavesLayout = (
    roots: TreePage[],
    depth: number = 0.3,
    offsetX: number = 0,
    offsetY: number = 0,
): TreePage[] => {
    const tree: TreePage[] = [];

    const width = window.innerWidth;
    const height = window.innerHeight;

    for (const [index, root] of roots.entries()) {
        const translateX = 0;
        const translateY = 0;

        const treePage: TreePage = {
            pageID: root.pageID,
            path: root.path,
            planeID: uuid(),
            location: {
                translateX,
                translateY,
                translateZ: 0,
                rotateX: 0,
                rotateY: 0,
            },
            show: true,
        };

        tree.push(treePage);
    }

    return tree;
}



export const computeSpaceLocation = (
    configuration: PluridConfiguration,
): SpaceLocation => {
    // if (configuration.space && configuration.space.layout) {
    //     const {
    //         layout,
    //     } = configuration.space;

    // }

    const cameraLocationX = computeCameraLocationX(configuration);
    const spaceLocation = {
        rotationX: 0,
        rotationY: 0,
        translationX: cameraLocationX,
        translationY: 0,
        translationZ: 0,
        scale: 1,
    };

    return spaceLocation;
}


/**
 * Based on the specified camera, compute the X translation
 *
 * @param configuration
 */
export const computeCameraLocationX = (
    configuration: PluridConfiguration,
) => {
    let translateX = 0;

    if (configuration.space
        && Array.isArray(configuration.space.layout)
        && typeof configuration.space.camera === 'string'
    ) {
        const layoutIndex = configuration.space.layout.indexOf(configuration.space.camera || '');
        translateX = window.innerWidth * layoutIndex + ROOTS_GAP * layoutIndex;
    }

    // account for camera space inversion
    return -1 * translateX;
}


export const recomputeSpaceTreeLocations = (
    tree: TreePage[],
): TreePage[] => {
    const updatedTree: TreePage[] = [];

    tree.forEach((page, index) => {
        const _page = { ...page };

        const translateX = index === 0
            ? 0
            : window.innerWidth * index + ROOTS_GAP;
        _page.location.translateX = translateX;
        updatedTree.push(_page);
    });

    return updatedTree;
}


export const getTreePageByPlaneID = (
    tree: TreePage[],
    planeID: string
): TreePage | null => {
    let _page = null;

    for (let page of tree) {
        if (page.planeID === planeID) {
            _page = page;
        }

        if (page.children && !_page) {
            _page = getTreePageByPlaneID(page.children, planeID);
        }

        if (_page) {
            break;
        }
    }

    return _page;
}


export const updateTreePage = (
    tree: TreePage[],
    updatedPage: TreePage,
): TreePage[] => {
    const updatedTree = tree.map(page => {
        if (page.planeID === updatedPage.planeID) {
            return updatedPage;
        }

        if (page.children) {
            const pageTree = updateTreePage(page.children, updatedPage);
            page.children = pageTree;
            return page;
        }

        return page;
    });

    return updatedTree;
}


export const computePath = (
    tree: TreePage[],
    planeID: string,
): TreePage[] => {
    let path: TreePage[] = [];
    const page = getTreePageByPlaneID(tree, planeID);

    if (page) {
        path.push( { ...page} );

        let parentID = page.parentPlaneID;
        if (!parentID) {
            return path;
        }

        while (parentID) {
            const parentPage = getTreePageByPlaneID(tree, parentID);
            if (parentPage) {
                const page = { ...parentPage };
                page.children = [];
                path.push(page);
                parentID = parentPage.parentPlaneID;
            }
        }
    }

    return path.reverse();
}


export const computePluridPlaneLocation = (
    tree: TreePage[],
    linkCoordinates: any,
    treePageParent: TreePage,
    treePageParentPlaneID: string,
): LocationCoordinates => {
    // console.log(tree);

    const path = computePath(tree, treePageParentPlaneID);
    let x = 0;
    let y = 0;
    let z = 0;

    const bridgeLength = 100;

    let prevLinkX = treePageParent.location.translateX;
    let rotXbranch = 90;
    let prevTransX = treePageParent.location.translateX;
    let prevTransY = treePageParent.location.translateY;
    let prevTransZ = treePageParent.location.translateZ;
    let penultimateRootAngleYRad = treePageParent.location.rotateY * Math.PI / 180;


    if (path.length < 2) {
        // console.log('path length under 2');
        x = prevTransX + linkCoordinates.x
        z = -1 * bridgeLength;
    }

    if (path.length === 2) {
        // console.log('path length 2');
        x = (prevLinkX - bridgeLength) + (linkCoordinates.x + bridgeLength) * Math.cos(rotXbranch * Math.PI / 180);
        z = -1 * (linkCoordinates.x + bridgeLength) * Math.sin(rotXbranch * Math.PI / 180);
    }

    if (path.length === 3) {
        // console.log('path length 3');

        x = (prevTransX + bridgeLength) + Math.cos(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
        z = (prevTransZ + bridgeLength) - Math.sin(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
    }

    if (path.length === 4) {
        // console.log('path length 4');

        x = (prevTransX + bridgeLength) + Math.cos(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
        z = (Math.abs(prevTransZ) + bridgeLength) + Math.sin(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
    }

    if (path.length === 5) {
        // console.log('path length 5');

        x = (prevTransX - bridgeLength) + Math.cos(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
        z = -1 * ( (Math.abs(prevTransZ) + bridgeLength) + Math.sin(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength) );
    }

    if (path.length === 6) {
        // console.log('path length 6');

        x = (prevTransX - bridgeLength) + Math.cos(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
        z = (prevTransZ + bridgeLength) - Math.sin(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
    }

    if (path.length === 7) {
        // console.log('path length 7');

        x = (prevTransX + bridgeLength) + Math.cos(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
        z = (prevTransZ + bridgeLength) - Math.sin(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
    }

    if (path.length === 8) {
        // console.log('path length 8');

        x = (prevTransX + bridgeLength) + Math.cos(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
        z = (prevTransZ - bridgeLength) - Math.sin(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
    }

    if (path.length === 9) {
        // console.log('path length 9 is as 5');

        x = (prevTransX - bridgeLength) + Math.cos(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
        z = -1 * ( (Math.abs(prevTransZ) + bridgeLength) + Math.sin(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength) );
    }

    y = prevTransY + linkCoordinates.y;

    // console.log('x y z', x, y, z);

    return {
        x,
        y,
        z,
    };
}


interface UpdatedTreeWithNewPage {
    pluridPlaneID: string;
    updatedTree: TreePage[];
}

export const updateTreeWithNewPage = (
    tree: TreePage[],
    treePageParentPlaneID: string,
    pagePath: string,
    pageID: string,
    linkCoordinates: any,
    parameters?: PageParameter[],
): UpdatedTreeWithNewPage => {
    // to receive parameters and composePath from pagePath and parameters

    const treePageParent = getTreePageByPlaneID(tree, treePageParentPlaneID);
    // console.log('tree page parent', treePageParent);

    if (treePageParent) {
        const location = computePluridPlaneLocation(
            tree,
            linkCoordinates,
            treePageParent,
            treePageParentPlaneID,
        );

        const extractedParameters = extractParameters(
            pagePath,
            parameters
        );

        const planeID = uuid();
        const newTreePage: TreePage = {
            pageID,
            path: pagePath,
            parameters: extractedParameters,
            planeID,
            parentPlaneID: treePageParentPlaneID,
            location: {
                translateX: location.x,
                translateY: location.y,
                translateZ: location.z,
                rotateX: 0,
                rotateY: treePageParent.location.rotateY + PLANE_DEFAULT_ANGLE,
            },
            show: true,
        };
        if (treePageParent.children) {
            treePageParent.children.push(newTreePage);
        } else {
            treePageParent.children = [newTreePage];
        }
        const updatedTree = updateTreePage(tree, treePageParent);
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
    tree: TreePage[],
    pluridPlaneID: string,
): TreePage[] => {
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


export const togglePageFromTree = (
    tree: TreePage[],
    pluridPlaneID: string,
): TreePage[] => {
    const updatedTree: TreePage[] = [];

    for (const page of tree) {
        let toggled = false;

        if (page.planeID === pluridPlaneID) {
            const _page = { ...page };
            _page.show = !_page.show;
            updatedTree.push(_page);
            toggled = true;
        } else if (page.children && !toggled) {
            const pageTree = togglePageFromTree(page.children, pluridPlaneID);
            page.children = [ ...pageTree ];
            updatedTree.push(page);
        } else {
            updatedTree.push(page);
        }
    }

    return updatedTree;
}



export const extractParameters = (
    pagePath: string,
    parameters?: PageParameter[],
) => {
    if (!parameters) {
        return {};
    }

    const re = /\/([^/]+)/g;
    const match = pagePath.match(re);
    if (!match) {
        return {};
    }

    const extractedParameters: PathParameter = {};

    for (const [index, matched] of match.entries()) {
        for (const definedParameters of parameters) {
            if (definedParameters.index === index) {
                const cleanedParameter = matched.slice(1,);
                extractedParameters[definedParameters.name] = cleanedParameter;
            }
        }
    }

    return extractedParameters;
}
