import {
    /** constants */
    ROOTS_GAP,
    PLANE_DEFAULT_ANGLE,

    /** enumerations */
    LAYOUT_TYPES,

    /** interfaces */
    PluridPage,
    PluridConfiguration,
    TreePage,
    SpaceLocation,
    LinkCoordinates,
    PageParameter,
} from '@plurid/plurid-data';

import {
    uuidv4 as uuid,
} from '@plurid/plurid-functions';

import computeColumnLayout from './layout/column';
import computeRowLayout from './layout/row';
import computeFaceToFaceLayout from './layout/faceToFace';
import computeSheavesLayout from './layout/sheaves';
import computeZigZagLayout from './layout/zigZag';

import {
    getTreePageByPlaneID,
} from './tree';

import {
    computePluridPlaneLocation,
} from './location';

import {
    extractParameters,
} from './parameters';

import {
    match,
} from '../router';



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
    view?: string[],
): TreePage[] => {
    if (!configuration) {
        const columnLayoutTree = computeColumnLayout(pages);
        return columnLayoutTree;
    }

    const assignedPages = assignPagesFromView(pages, view);
    console.log('assignedPages', assignedPages);

    switch(configuration.space.layout.type) {
        case LAYOUT_TYPES.COLUMNS:
            {
                const {
                    columns,
                    gap,
                } = configuration.space.layout;
                const columnLayoutTree = computeColumnLayout(
                    assignedPages,
                    columns,
                    gap,
                    configuration,
                );
                return columnLayoutTree;
            }
        case LAYOUT_TYPES.ROWS:
            {
                const {
                    rows,
                    gap,
                } = configuration.space.layout;
                const columnLayoutTree = computeRowLayout(
                    assignedPages,
                    rows,
                    gap,
                    configuration,
                );
                return columnLayoutTree;
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
    view?: string[],
): TreePage[] => {
    if (!view) {
        return pages;
    }

    const tree: TreePage[] = [];


    view.forEach(viewPage => {
        const matchedPage = match(viewPage, pages);
        console.log('viewPage', viewPage);
        console.log('pages', pages);

        console.log('matchedPage', matchedPage);
        console.log('------------------');
        if (matchedPage) {
            const newPage = {
                ...matchedPage,
                path: viewPage,
                planeID: uuid(),
            };
            tree.push(newPage);
        }
    });

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
    parameters?: PageParameter[],
): UpdatedTreeWithNewPage => {
    // to receive parameters and composePath from pagePath and parameters

    const treePageParent = getTreePageByPlaneID(tree, treePageParentPlaneID);
    // console.log('tree page parent', treePageParent);

    if (treePageParent) {
        const location = computePluridPlaneLocation(
            linkCoordinates,
            treePageParent,
        );

        const extractedParameters = extractParameters(
            pagePath,
            parameters,
        );

        const planeID = uuid();
        const newTreePage: TreePage = {
            pageID,
            path: pagePath,
            parameters: extractedParameters,
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


export const computeSpaceSize = (
    tree: TreePage[],
) => {
    let width = 0;
    let height = 0;
    let depth = 0;
    let topCorner = {
        x: 0,
        y: 0,
        z: 0,
    };

    // console.log('tree', tree);
    tree.map(treePage => {
        // console.log('treePage', treePage);

        const spaceWidth = treePage.location.translateX + treePage.width;
        // console.log('spaceWidth', spaceWidth);
        if (spaceWidth > width) {
            width = spaceWidth;
        }

        const spaceHeight = treePage.location.translateY + treePage.height;
        // console.log('spaceHeight', spaceHeight);
        if (spaceHeight > height) {
            height = spaceHeight;
        }

        const spaceDepth = treePage.location.translateZ;
        // console.log('spaceDepth', spaceDepth);
        if (spaceDepth > depth) {
            depth = spaceDepth;
        }
    });

    // console.log('-------------');

    return {
        width,
        height,
        depth,
        topCorner,
    };
}
