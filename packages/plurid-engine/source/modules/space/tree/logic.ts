import {
    /** constants */
    PLANE_DEFAULT_ANGLE,

    /** enumerations */
    LAYOUT_TYPES,

    /** interfaces */
    PluridView,
    PluridConfiguration,
    TreePage,
    LinkCoordinates,
    PathParameters,
} from '@plurid/plurid-data';

import {
    uuidv4 as uuid,
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
    getTreePageByPlaneID,
} from '../utilities';

import Router, {
    Route,
} from '../../router';




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
    view?: string[] | PluridView[],
): TreePage[] => {
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
    pages: TreePage[],
    view?: string[] | PluridView[],
): TreePage[] => {
    if (!view) {
        return pages;
    }

    const tree: TreePage[] = [];

    const routes: Route<any>[] = pages.map(page => {
        const route: Route<any> = {
            location: page.path,
            view: '',
        };
        return route;
    });

    const router = new Router(routes);

    for (const [index, viewPage] of view.entries()) {
        const viewPagePath = typeof viewPage === 'string'
            ? viewPage
            : viewPage.path;

        const matchedPage = router.match(viewPagePath);

        if (matchedPage) {
            const page = pages.find(p => p.path === matchedPage?.route.location);
            if (!page) {
                break;
            }

            const newPage = {
                ...page,
                path: viewPagePath,
                planeID: uuid(),
            };

            const viewPageOrdinal = typeof viewPage === 'string'
                ? index
                : typeof viewPage.ordinal === 'number'
                    ? viewPage.ordinal
                    : index;

            const treePage = tree[viewPageOrdinal];

            if (typeof treePage === 'undefined') {
                tree[viewPageOrdinal] = newPage;
            } else {
                let elementSet = false;
                let pageIndex = viewPageOrdinal;

                do {
                    const nextIndex = pageIndex + 1;
                    const nextTreePage = tree[nextIndex];
                    if (typeof nextTreePage === 'undefined') {
                        tree[nextIndex] = newPage;
                        elementSet = true;
                    }
                } while (!elementSet);
            }
        }
    }

    return tree;
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



interface UpdatedTreeWithNewPage {
    pluridPlaneID: string;
    updatedTree: TreePage[];
}

export const updateTreeWithNewPage = (
    tree: TreePage[],
    treePageParentPlaneID: string,
    pagePath: string,
    pageID: string,
    linkCoordinates: LinkCoordinates,
    parameters?: PathParameters,
): UpdatedTreeWithNewPage => {
    // to receive parameters and composePath from pagePath and parameters

    const treePageParent = getTreePageByPlaneID(tree, treePageParentPlaneID);
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

        const planeID = uuid();
        const newTreePage: TreePage = {
            pageID,
            path: pagePath,
            // parameters: extractedParameters,
            parameters: {},
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

        const updatedTreePageParent = {...treePageParent};
        if (updatedTreePageParent.children) {
            updatedTreePageParent.children.push(newTreePage);
        } else {
            updatedTreePageParent.children = [newTreePage];
        }

        const updatedTree = updateTreePage(tree, updatedTreePageParent);

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


export const toggleChildren = (
    children: TreePage[],
): TreePage[] => {
    const updatedChildren = children.map(child => {
        if (child.children) {
            const updatedChild = {
                ...child,
                show: !child.show,
                children: toggleChildren(child.children),
            }
            return updatedChild;
        }

        const updatedChild: TreePage = {
            ...child,
            show: !child.show,
        };
        return updatedChild;
    });

    return updatedChildren;
}


export const togglePageFromTree = (
    tree: TreePage[],
    pluridPlaneID: string,
): TreePage[] => {
    const updatedTree: TreePage[] = [];

    for (const page of tree) {
        if (page.planeID === pluridPlaneID) {
            const updatedPage: TreePage = {
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
            const pageTree = togglePageFromTree(page.children, pluridPlaneID);
            page.children = [ ...pageTree ];
            updatedTree.push(page);
            continue;
        }

        updatedTree.push(page);
    }

    return updatedTree;
}
