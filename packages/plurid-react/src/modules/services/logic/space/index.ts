import {
    PluridPage,
} from '../../../data/interfaces';

import uuid from '../../utilities/uuid';

import {
    TreePage,
} from '../../../data/interfaces';

import {
    ROOTS_GAP,
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
                    // translateX: Math.random() * 1000,
                    // translateY: Math.random() * 200,
                    // translateZ: Math.random() * 100,
                    // rotateX: 0,
                    // rotateY: Math.random() * 80,
                },
            };
            tree.push(treePage);
        }
    });

    console.log(tree);
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
): UpdatedTreeWithNewPage => {
    const planeID = uuid();
    const newTreePage = {
        path: pagePath,
        planeID,
        location: {
            translateX: 0,
            translateY: 0,
            translateZ: 0,
            rotateX: 0,
            rotateY: 90.1,
        },
    };
    const treePage = getTreePageByPlaneID(tree, treePagePlaneID);
    if (treePage) {
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
