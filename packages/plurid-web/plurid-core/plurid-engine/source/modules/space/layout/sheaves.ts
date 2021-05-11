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

    for (const [index, page] of roots.entries()) {
        const translateX = 0;
        const translateY = 0;

        const treePage: TreePlane = {
            ...page,
            location: {
                translateX,
                translateY,
                translateZ: 0,
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
