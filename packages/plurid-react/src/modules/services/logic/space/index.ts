import {
    PluridPage,
} from '../../../data/interfaces';

import uuid from '../../utilities/uuid';

import {
    TreePage,
} from '../../../data/interfaces';

import {
    ROOTS_GAP,
    PLANE_DEFAULT_ANGLE,
} from '../../../data/constants/space';



export const computeSpaceTree = (
    pages: PluridPage[],
): TreePage[] => {
    const tree: TreePage[] = [];

    pages.forEach((page, index) => {
        if (page.root) {
            const translateX = index === 0
                ? 0
                : window.innerWidth * index + ROOTS_GAP;

            const treePage = {
                path: page.path,
                planeID: uuid(),
                location: {
                    translateX,
                    translateY: 0,
                    translateZ: 0,
                    rotateX: 0,
                    rotateY: 0,
                },
            };
            tree.push(treePage);
        }
    });

    return tree;
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
    tree: TreePage[], planeID: string
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


interface LocationCoordinates {
    x: number;
    y: number;
    z: number;
}

export const computePluridPlaneLocation = (
    tree: TreePage[],
    linkCoordinates: any,
    parent: any,
): LocationCoordinates => {
    // let path = ['a', 'b'];
    let x = 0;
    let y = 0;
    let z = 0;

    const bridgeLength = 100;

    let prevLinkX = linkCoordinates.x;
    let rotXbranch = 90;
    let prevTransX = parent.location.translateX;
    let prevTransY = parent.location.translateY;
    let prevTransZ = parent.location.translateZ;
    let penultimateRootAngleYRad = parent.location.rotateY * Math.PI / 180;

    // if (path.length === 2) {
        // x = prevLinkX + (linkCoordinates.x + bridgeLength) * Math.cos(rotXbranch * Math.PI / 180);
        // z = -1 * (linkCoordinates.x + bridgeLength) * Math.sin(rotXbranch * Math.PI / 180);
    // }

    // if (path.length > 2) {
        // x = prevTransX + Math.cos(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
        // z = prevTransZ - Math.sin(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
    // }

    x = prevTransX + linkCoordinates.x
    z = -1 * bridgeLength;

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
    treePagePlaneID: string,
    pagePath: string,
    linkCoordinates: any,
): UpdatedTreeWithNewPage => {
    const treePage = getTreePageByPlaneID(tree, treePagePlaneID);

    console.log(tree);
    console.log(linkCoordinates);
    console.log('tree page parent', treePage);

    const location = computePluridPlaneLocation(
        tree,
        linkCoordinates,
        treePage,
    );

    if (treePage) {
        const planeID = uuid();
        const newTreePage = {
            path: pagePath,
            planeID,
            location: {
                translateX: location.x,
                translateY: location.y,
                translateZ: location.z,
                rotateX: 0,
                rotateY: treePage.location.rotateY + PLANE_DEFAULT_ANGLE,
            },
        };
        if (treePage.children) {
            treePage.children.push(newTreePage);
        } else {
            treePage.children = [newTreePage];
        }
        const updatedTree = updateTreePage(tree, treePage);
        return {
            pluridPlaneID: planeID,
            updatedTree,
        }
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
