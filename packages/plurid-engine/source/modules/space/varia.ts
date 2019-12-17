import {
    PluridPage,
    PluridConfiguration,
    TreePage,
    SpaceLocation,

    PageParameter,

    ROOTS_GAP,
    PLANE_DEFAULT_ANGLE,

    LAYOUT_TYPES,
} from '@plurid/plurid-data';

import {
    uuidv4 as uuid,
} from '@plurid/plurid-functions';

import computeColumnLayout from './layout/column';
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
                    gap,
                } = configuration.space.layout;
                const columnLayoutTree = computeColumnLayout(
                    pages,
                    columns,
                    gap,
                );
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
    linkCoordinates: any,
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
            parameters
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
