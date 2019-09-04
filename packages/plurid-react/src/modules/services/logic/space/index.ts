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
    console.log('tree page parent', treePage);

    if (treePage) {
        const planeID = uuid();
        const newTreePage = {
            path: pagePath,
            planeID,
            location: {
                // translateX(-208px) translateY(34px) translateZ(-363px) rotateX(0deg) rotateY(90.1deg)
                translateX: -208,
                translateY: 34,
                translateZ: -363,
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
