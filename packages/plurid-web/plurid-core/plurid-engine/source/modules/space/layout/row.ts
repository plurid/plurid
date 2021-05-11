// #region imports
    // #region libraries
    import {
        PluridConfiguration,
        TreePlane,

        ROOTS_GAP,
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
const computeRowLayout = (
    roots: TreePlane[],
    rows: number = 1,
    rowLength?: number,
    gap: number = ROOTS_GAP,
    configuration: PluridConfiguration = defaultConfiguration,
): TreePlane[] => {
    const windowInnerWidth = typeof window === 'undefined'
        ? 1440
        : window.innerWidth;
    const windowInnerHeight = typeof window === 'undefined'
        ? 840
        : window.innerHeight;

    const tree: TreePlane[] = [];
    const configurationWidth = configuration.elements.plane.width;
    const width = mathematics.numbers.checkIntegerNonUnit(configurationWidth)
        ? configurationWidth
        : configurationWidth * windowInnerWidth;
    const height = windowInnerHeight;
    const gapValue = mathematics.numbers.checkIntegerNonUnit(gap)
        ? gap
        : gap * width;

    const length = rowLength || Math.ceil(roots.length / rows);

    for (const [index, root] of roots.entries()) {
        const rowIndex = Math.floor(index / length);
        const columnIndex = index % length;

        const translateX = columnIndex * (width + gapValue);
        const translateY = rowIndex * (height + gapValue);

        const treePage: TreePlane = {
            ...root,
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
        };

        tree.push(treePageWithChildren);
    }

    return tree;
}
// #endregion module



// #region exports
export default computeRowLayout;
// #endregion exports
