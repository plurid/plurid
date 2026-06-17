// #region imports
    // #region libraries
    import {
        TreePlane,
        PluridConfiguration,

        defaultConfiguration,
    } from '@plurid/plurid-data';

    import {
        mathematics,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        recomputeChildrenLocation,
    } from '../location';
    // #endregion external
// #endregion imports



// #region module
const computeSheavesLayout = (
    roots: TreePlane[],
    depth: number = 0.3,
    offsetX: number = 0,
    offsetY: number = 0,
    configuration: PluridConfiguration = defaultConfiguration,
): TreePlane[] => {
    const windowInnerWidth = typeof window === 'undefined'
        ? 1440
        : window.innerWidth;
    const windowInnerHeight = typeof window === 'undefined'
        ? 840
        : window.innerHeight;

    const tree: TreePlane[] = [];

    const width = mathematics.numbers.checkIntegerNonUnit(configuration.elements.plane.width)
        ? configuration.elements.plane.width
        : configuration.elements.plane.width * windowInnerWidth;
    const height = windowInnerHeight;

    // Sheaves = a stack of planes receding into depth. `depth` is the per-sheet Z step
    // (a fraction of the plane width, or an explicit pixel value like the width config),
    // with optional per-sheet X/Y cascade so the stack fans out instead of fully
    // occluding. Earlier this pinned every plane to (0,0,0) — a single visible plane.
    const depthStep = mathematics.numbers.checkIntegerNonUnit(depth)
        ? depth
        : depth * width;

    for (const [index, page] of roots.entries()) {
        const translateX = index * offsetX;
        const translateY = index * offsetY;
        const translateZ = -index * depthStep;

        const treePage: TreePlane = {
            ...page,
            location: {
                translateX,
                translateY,
                translateZ,
                rotateX: 0,
                rotateY: 0,
            },
        };

        const children = recomputeChildrenLocation(treePage);

        const treePageWithChildren = {
            ...treePage,
            children,
        }

        tree.push(treePageWithChildren);
    }

    return tree;
}
// #endregion module



// #region exports
export default computeSheavesLayout;
// #endregion exports
