import {
    PluridPage,
    PluridConfiguration,
    TreePage,
    SpaceLocation,

    ROOTS_GAP,
    PLANE_DEFAULT_ANGLE,
} from '@plurid/plurid-data';

import {
    uuidv4 as uuid,
} from '@plurid/apps.utilities.functions';



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
    if (configuration && configuration.roots) {
        if (Array.isArray(configuration.roots.layout)) {
            const layoutIndex = configuration.roots.layout.indexOf(root.path);
            translateX = window.innerWidth * layoutIndex + ROOTS_GAP * layoutIndex;
        }
    } else {
        translateX = index === 0
            ? 0
            : window.innerWidth * index + ROOTS_GAP * index;
    }

    return translateX;
}


export const computeSpaceTree = (
    pages: PluridPage[],
    configuration: PluridConfiguration | undefined,
): TreePage[] => {
    const tree: TreePage[] = [];

    const roots = pages.filter(page => page.root);

    roots.forEach((root, index) => {
        const translateX = computeRootLocationX(configuration, root, index);

        const treePage = {
            path: root.path,
            planeID: uuid(),
            location: {
                translateX,
                translateY: 0,
                translateZ: 0,
                rotateX: 0,
                rotateY: 0,
            },
            show: true,
        };
        tree.push(treePage);
    });

    return tree;
}


export const computeSpaceLocation = (
    configuration: PluridConfiguration,
): SpaceLocation => {
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

    if (configuration.roots
        && Array.isArray(configuration.roots.layout)
        && typeof configuration.roots.camera === 'string'
    ) {
        const layoutIndex = configuration.roots.layout.indexOf(configuration.roots.camera || '');
        translateX = window.innerWidth * layoutIndex + ROOTS_GAP * layoutIndex;
    }

    // account for camera space inversion
    return -1 * translateX;
}


export const recomputeSpaceTreeLocations = (
    tree: TreePage[],
): TreePage[] => {
    const updatedTree: TreePage[] = [];
    console.log(tree);

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
) => {
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


interface LocationCoordinates {
    x: number;
    y: number;
    z: number;
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
        console.log('path length under 2');
        x = prevTransX + linkCoordinates.x
        z = -1 * bridgeLength;
    }

    if (path.length === 2) {
        console.log('path length 2');
        x = (prevLinkX - bridgeLength) + (linkCoordinates.x + bridgeLength) * Math.cos(rotXbranch * Math.PI / 180);
        z = -1 * (linkCoordinates.x + bridgeLength) * Math.sin(rotXbranch * Math.PI / 180);
    }

    if (path.length === 3) {
        console.log('path length 3');

        x = (prevTransX + bridgeLength) + Math.cos(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
        z = (prevTransZ + bridgeLength) - Math.sin(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
    }

    if (path.length === 4) {
        console.log('path length 4');

        x = (prevTransX + bridgeLength) + Math.cos(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
        z = (Math.abs(prevTransZ) + bridgeLength) + Math.sin(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
    }

    if (path.length === 5) {
        console.log('path length 5');

        x = (prevTransX - bridgeLength) + Math.cos(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
        z = -1 * ( (Math.abs(prevTransZ) + bridgeLength) + Math.sin(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength) );
    }

    if (path.length === 6) {
        console.log('path length 6');

        x = (prevTransX - bridgeLength) + Math.cos(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
        z = (prevTransZ + bridgeLength) - Math.sin(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
    }

    if (path.length === 7) {
        console.log('path length 7');

        x = (prevTransX + bridgeLength) + Math.cos(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
        z = (prevTransZ + bridgeLength) - Math.sin(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
    }

    if (path.length === 8) {
        console.log('path length 8');

        x = (prevTransX + bridgeLength) + Math.cos(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
        z = (prevTransZ - bridgeLength) - Math.sin(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
    }

    if (path.length === 9) {
        console.log('path length 9 is as 5');

        x = (prevTransX - bridgeLength) + Math.cos(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
        z = -1 * ( (Math.abs(prevTransZ) + bridgeLength) + Math.sin(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength) );
    }

    y = prevTransY + linkCoordinates.y;

    console.log('x y z', x, y, z);

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
    linkCoordinates: any,
): UpdatedTreeWithNewPage => {
    const treePageParent = getTreePageByPlaneID(tree, treePageParentPlaneID);
    // console.log('tree page parent', treePageParent);

    if (treePageParent) {
        const location = computePluridPlaneLocation(
            tree,
            linkCoordinates,
            treePageParent,
            treePageParentPlaneID,
        );

        const planeID = uuid();
        const newTreePage: TreePage = {
            path: pagePath,
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
) => {
    const updatedTree: TreePage[] = [];

    for (const page of tree) {
        if (page.planeID === pluridPlaneID) {
            const _page = { ...page };
            _page.show = !_page.show;
            updatedTree.push(_page);
            break;
        }

        if (page.children) {
            const pageTree = togglePageFromTree(page.children, pluridPlaneID);
            page.children = [ ...pageTree ];
            updatedTree.push(page);
        }
    }

    return updatedTree;
}
